use winreg::enums::*;
use winreg::RegKey;
use serde::{Serialize, Deserialize};
use std::path::Path;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ProgramInfo {
    // Basic Info
    pub name: String,                    // DisplayName
    pub registry_name: String,           // Registry key name
    pub version: Option<String>,         // DisplayVersion
    pub registry_time: Option<String>,   // NEW: InstallTime
    pub install_date: Option<String>,    // InstallDate
    pub installed_for: Option<String>,   // NEW: Based on registry path (32/64 bit)
    pub install_location: Option<String>, // InstallLocation
    pub install_source: Option<String>,  // NEW: InstallSource
    pub install_folder_created: Option<String>, // NEW
    pub install_folder_modified: Option<String>, // NEW
    pub install_folder_owner: Option<String>,    // NEW
    pub publisher: Option<String>,       // Publisher
    pub uninstall_string: Option<String>, // UninstallString
    pub change_install_string: Option<String>, // NEW: ModifyPath
    pub quiet_uninstall_string: Option<String>, // NEW: QuietUninstallString
    pub comments: Option<String>,        // Comments
    pub about_url: Option<String>,       // URLInfoAbout
    pub update_info_url: Option<String>, // NEW: URLUpdateInfo
    pub help_link: Option<String>,       // NEW: HelpLink
    pub install_source_path: Option<String>, // NEW
    pub installer_name: Option<String>,  // NEW
    pub release_type: Option<String>,    // NEW
    pub icon_path: Option<String>,       // DisplayIcon
    pub msi_filename: Option<String>,    // NEW
    pub estimated_size: Option<u32>,     // NEW: EstimatedSize
    pub attributes: Option<String>,      // NEW
    pub language: Option<String>,        // NEW
    pub parent_key_name: Option<String>, // NEW
    pub registry_path: String,
    pub program_type: String,
    pub is_windows_installer: bool,
    pub architecture: String,
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

#[tauri::command]
pub fn get_scan_progress() -> Result<ScanProgress, String> {
    // This would be implemented with a shared state in a real application
    // For now, return a mock progress
    Ok(ScanProgress {
        total_keys: 0,
        scanned_keys: 0,
        is_complete: false,
        current_operation: "Ready".to_string(),
    })
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ScanProgress {
    pub total_keys: usize,
    pub scanned_keys: usize,
    pub is_complete: bool,
    pub current_operation: String,
}

fn extract_icon_path(icon_path: &str) -> Option<String> {
    let parts: Vec<&str> = icon_path.split(',').collect();
    let path = parts[0].trim_matches('"');
    
    // Check if the path exists
    if !Path::new(path).exists() {
        return None;
    }
    
    let extension = Path::new(path)
        .extension()
        .and_then(|ext| ext.to_str())
        .unwrap_or("");

    match extension.to_lowercase().as_str() {
        "ico" => {
            // Direct ICO file - return as is
            Some(path.to_string())
        }
        "exe" | "dll" => {
            // For executable files, we'll return the path and let the frontend handle icon extraction
            // This is more reliable than trying to extract icons in the backend
            Some(path.to_string())
        }
        "lnk" => {
            // Shortcut file - could parse to get target, but for now just return the shortcut
            Some(path.to_string())
        }
        _ => {
            // Unknown extension, but file exists - return as is
            Some(path.to_string())
        }
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