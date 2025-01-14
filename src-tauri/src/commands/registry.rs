use winreg::enums::*;
use winreg::RegKey;
use serde::Serialize;
use std::path::Path;
use std::process::Command;

#[derive(Debug, Serialize)]
pub struct ProgramInfo {
    // Basic Info
    name: String,                    // DisplayName
    registry_name: String,           // Registry key name
    version: Option<String>,         // DisplayVersion
    registry_time: Option<String>,   // NEW: InstallTime
    install_date: Option<String>,    // InstallDate
    installed_for: Option<String>,   // NEW: Based on registry path (32/64 bit)
    install_location: Option<String>, // InstallLocation
    install_source: Option<String>,  // NEW: InstallSource
    install_folder_created: Option<String>, // NEW
    install_folder_modified: Option<String>, // NEW
    install_folder_owner: Option<String>,    // NEW
    publisher: Option<String>,       // Publisher
    uninstall_string: Option<String>, // UninstallString
    change_install_string: Option<String>, // NEW: ModifyPath
    quiet_uninstall_string: Option<String>, // NEW: QuietUninstallString
    comments: Option<String>,        // Comments
    about_url: Option<String>,       // URLInfoAbout
    update_info_url: Option<String>, // NEW: URLUpdateInfo
    help_link: Option<String>,       // NEW: HelpLink
    install_source_path: Option<String>, // NEW
    installer_name: Option<String>,  // NEW
    release_type: Option<String>,    // NEW
    icon_path: Option<String>,       // DisplayIcon
    msi_filename: Option<String>,    // NEW
    estimated_size: Option<u32>,     // NEW: EstimatedSize
    attributes: Option<String>,      // NEW
    language: Option<String>,        // NEW
    parent_key_name: Option<String>, // NEW
    registry_path: String,
    program_type: String,
    is_windows_installer: bool,
    architecture: String,
}

#[tauri::command]
pub fn get_installed_programs() -> Result<Vec<ProgramInfo>, String> {
    let mut programs = Vec::new();
    let hklm = RegKey::predef(HKEY_LOCAL_MACHINE);

    // Scan 64-bit programs
    if let Ok(uninstall_key) = hklm.open_subkey("SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall") {
        scan_registry_key(&uninstall_key, &mut programs, "64-bit");
    }

    // Scan 32-bit programs
    if let Ok(uninstall_key) = hklm.open_subkey("SOFTWARE\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall") {
        scan_registry_key(&uninstall_key, &mut programs, "32-bit");
    }

    Ok(programs)
}

fn extract_icon_path(icon_path: &str) -> Option<String> {
    let parts: Vec<&str> = icon_path.split(',').collect();
    let path = parts[0].trim_matches('"');
    
    if Path::new(path).exists() {
        let extension = Path::new(path)
            .extension()
            .and_then(|ext| ext.to_str())
            .unwrap_or("");

        match extension.to_lowercase().as_str() {
            "ico" => Some(path.to_string()),
            "exe" | "dll" => {
                // For exe/dll files, we need to extract the icon
                let temp_dir = std::env::temp_dir().join("software-scope-icons");
                std::fs::create_dir_all(&temp_dir).ok()?;
                
                let icon_filename = format!("{}.ico", 
                    Path::new(path).file_stem()?.to_str()?
                );
                let icon_path = temp_dir.join(icon_filename);
                
                let _index = parts.get(1).unwrap_or(&"0").parse::<i32>().unwrap_or(0);
                
                let ps_command = format!(
                    "[System.Drawing.Icon]::ExtractAssociatedIcon('{}').ToBitmap().Save('{}')",
                    path,
                    icon_path.to_str()?
                );
                
                Command::new("powershell")
                    .args(&["-Command", &ps_command])
                    .output()
                    .ok()?;

                if icon_path.exists() {
                    Some(icon_path.to_str()?.to_string())
                } else {
                    None
                }
            }
            _ => None
        }
    } else {
        None
    }
}

fn scan_registry_key(key: &RegKey, programs: &mut Vec<ProgramInfo>, architecture: &str) {
    for key_result in key.enum_keys() {
        if let Ok(key_name) = key_result {
            if let Ok(program_key) = key.open_subkey(&key_name) {
                if let Ok(name) = program_key.get_value::<String, _>("DisplayName") {
                    let icon_path = program_key.get_value("DisplayIcon")
                        .ok()
                        .and_then(|path: String| extract_icon_path(&path));

                    let program = ProgramInfo {
                        name,
                        registry_name: key_name.clone(),
                        version: program_key.get_value("DisplayVersion").ok(),
                        registry_time: program_key.get_value("InstallTime").ok(),
                        install_date: program_key.get_value("InstallDate").ok(),
                        installed_for: Some(format!("All Users ({})", architecture)),
                        install_location: program_key.get_value("InstallLocation").ok(),
                        install_source: program_key.get_value("InstallSource").ok(),
                        install_folder_created: program_key.get_value("InstallFolderCreated").ok(),
                        install_folder_modified: program_key.get_value("InstallFolderModified").ok(),
                        install_folder_owner: program_key.get_value("InstallFolderOwner").ok(),
                        publisher: program_key.get_value("Publisher").ok(),
                        uninstall_string: program_key.get_value("UninstallString").ok(),
                        change_install_string: program_key.get_value("ModifyPath").ok(),
                        quiet_uninstall_string: program_key.get_value("QuietUninstallString").ok(),
                        comments: program_key.get_value("Comments").ok(),
                        about_url: program_key.get_value("URLInfoAbout").ok(),
                        update_info_url: program_key.get_value("URLUpdateInfo").ok(),
                        help_link: program_key.get_value("HelpLink").ok(),
                        install_source_path: program_key.get_value("InstallSource").ok(),
                        installer_name: program_key.get_value("InstallerName").ok(),
                        release_type: program_key.get_value("ReleaseType").ok(),
                        icon_path,
                        msi_filename: program_key.get_value("MSIFilename").ok(),
                        estimated_size: program_key.get_value("EstimatedSize").ok(),
                        attributes: program_key.get_value("Attributes").ok(),
                        language: program_key.get_value("Language").ok(),
                        parent_key_name: program_key.get_value("ParentKeyName").ok(),
                        registry_path: format!("HKEY_LOCAL_MACHINE\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\{}", key_name),
                        program_type: determine_program_type(&program_key),
                        is_windows_installer: program_key.get_value::<u32, _>("WindowsInstaller").unwrap_or(0) == 1,
                        architecture: architecture.to_string(),
                    };
                    programs.push(program);
                }
            }
        }
    }
}

fn determine_program_type(key: &RegKey) -> String {
    if key.get_value::<u32, _>("SystemComponent").unwrap_or(0) == 1 {
        "SystemComponent".to_string()
    } else if key.get_value::<String, _>("ParentKeyName").is_ok() {
        "Update".to_string()
    } else {
        "Application".to_string()
    }
} 