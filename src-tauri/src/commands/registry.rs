use winreg::enums::*;
use winreg::RegKey;
use serde::{Serialize, Deserialize};
use std::path::Path;
use std::fs;
use base64::Engine;

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

#[tauri::command]
pub fn debug_icon_paths() -> Result<Vec<DebugIconInfo>, String> {
    let mut debug_info = Vec::new();
    let hklm = RegKey::predef(HKEY_LOCAL_MACHINE);

    if let Ok(uninstall_key) = hklm.open_subkey("SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall") {
        let mut count = 0;
        for key_result in uninstall_key.enum_keys() {
            if let Ok(key_name) = key_result {
                if let Ok(program_key) = uninstall_key.open_subkey(&key_name) {
                    if let Ok(name) = program_key.get_value::<String, _>("DisplayName") {
                        let raw_icon_path: Option<String> = program_key.get_value("DisplayIcon").ok();
                        let processed_icon_path = raw_icon_path.as_ref().and_then(|path| extract_icon_path(path));
                        
                        let file_exists = processed_icon_path.as_ref().map(|p| Path::new(p).exists()).unwrap_or(false);
                        
                        debug_info.push(DebugIconInfo {
                            program_name: name,
                            raw_icon_path,
                            processed_icon_path,
                            file_exists,
                        });
                        
                        count += 1;
                        if count >= 10 { // Limit to first 10 for debugging
                            break;
                        }
                    }
                }
            }
        }
    }

    Ok(debug_info)
}

#[tauri::command]
pub fn get_icon_as_base64(icon_path: String) -> Result<String, String> {
    // Read the icon file and convert to base64
    match fs::read(&icon_path) {
        Ok(file_data) => {
            let base64_data = base64::engine::general_purpose::STANDARD.encode(&file_data);
            let extension = Path::new(&icon_path)
                .extension()
                .and_then(|ext| ext.to_str())
                .unwrap_or("")
                .to_lowercase();
            
            // Return data URL format
            let mime_type = match extension.as_str() {
                "ico" => "image/x-icon",
                "png" => "image/png",
                "jpg" | "jpeg" => "image/jpeg",
                "exe" | "dll" => "image/x-icon", // Executables contain icon resources
                _ => "application/octet-stream",
            };
            
            Ok(format!("data:{};base64,{}", mime_type, base64_data))
        }
        Err(e) => {
            Err(format!("Failed to read icon file {}: {}", icon_path, e))
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ScanProgress {
    pub total_keys: usize,
    pub scanned_keys: usize,
    pub is_complete: bool,
    pub current_operation: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DebugIconInfo {
    pub program_name: String,
    pub raw_icon_path: Option<String>,
    pub processed_icon_path: Option<String>,
    pub file_exists: bool,
}

fn extract_icon_path(icon_path: &str) -> Option<String> {
    let parts: Vec<&str> = icon_path.split(',').collect();
    let path = parts[0].trim_matches('"');
    
    // Expand environment variables like %ProgramFiles%
    let expanded_path = expand_environment_path(path);
    
    // Try multiple path variations
    let paths_to_try = vec![
        expanded_path.clone(),
        path.to_string(),
        // Try with and without quotes
        path.trim_matches('"').to_string(),
        // Try common variations
        path.replace("%ProgramFiles%", r"C:\Program Files").to_string(),
        path.replace("%ProgramFiles%", r"C:\Program Files (x86)").to_string(),
    ];
    
    for test_path in &paths_to_try {
        if Path::new(test_path).exists() {
            let extension = Path::new(test_path)
                .extension()
                .and_then(|ext| ext.to_str())
                .unwrap_or("");

            match extension.to_lowercase().as_str() {
                "ico" => {
                    // Direct ICO file - return as is
                    println!("Found ICO file: {}", test_path);
                    return Some(test_path.clone());
                }
                "exe" | "dll" => {
                    // For executable files, return the path
                    println!("Found executable: {}", test_path);
                    return Some(test_path.clone());
                }
                "lnk" => {
                    // Shortcut file
                    println!("Found shortcut: {}", test_path);
                    return Some(test_path.clone());
                }
                _ => {
                    // Unknown extension, but file exists
                    println!("Found file with extension '{}': {}", extension, test_path);
                    return Some(test_path.clone());
                }
            }
        }
    }
    
    println!("No valid icon path found for: {} (tried: {:?})", icon_path, paths_to_try);
    None
}

fn expand_environment_path(path: &str) -> String {
    // Simple environment variable expansion for common Windows paths
    let mut expanded = path.to_string();
    
    // Common Windows environment variables
    let replacements = [
        ("%ProgramFiles%", r"C:\Program Files"),
        ("%ProgramFiles(x86)%", r"C:\Program Files (x86)"),
        ("%ProgramData%", r"C:\ProgramData"),
        ("%SystemRoot%", r"C:\Windows"),
        ("%windir%", r"C:\Windows"),
        ("%SystemDrive%", "C:"),
    ];
    
    for (var, value) in &replacements {
        expanded = expanded.replace(var, value);
    }
    
    expanded
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