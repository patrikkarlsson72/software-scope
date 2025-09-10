use winreg::enums::*;
use winreg::RegKey;
use serde::{Serialize, Deserialize};
use std::path::Path;
use std::fs;
use base64::Engine;
use reqwest;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SystemInfo {
    pub windows_version: String,
    pub vf_managed_count: u32,
}

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
    pub installation_source: String,     // NEW: "System", "User", "Filesystem"
    pub is_vf_deployed: bool,            // NEW: Indicates if deployed by VF company
}

#[tauri::command]
pub fn get_system_info() -> Result<SystemInfo, String> {
    let windows_version = get_windows_version()?;
    let vf_managed_count = 0; // This will be calculated by the frontend
    
    Ok(SystemInfo {
        windows_version,
        vf_managed_count,
    })
}

fn get_windows_version() -> Result<String, String> {
    let hklm = RegKey::predef(HKEY_LOCAL_MACHINE);
    
    // Try to get Windows version from registry
    if let Ok(version_key) = hklm.open_subkey("SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion") {
        let product_name = version_key.get_value::<String, _>("ProductName")
            .unwrap_or_else(|_| "Windows".to_string());
        
        let display_version = version_key.get_value::<String, _>("DisplayVersion")
            .unwrap_or_else(|_| version_key.get_value::<String, _>("ReleaseId")
                .unwrap_or_else(|_| "Unknown".to_string()));
        
        Ok(format!("{} {}", product_name, display_version))
    } else {
        Ok("Windows Unknown".to_string())
    }
}

#[tauri::command]
pub fn get_installed_programs() -> Result<Vec<ProgramInfo>, String> {
    let mut programs = Vec::new();
    let hklm = RegKey::predef(HKEY_LOCAL_MACHINE);
    let hkcu = RegKey::predef(HKEY_CURRENT_USER);

    // Scan system-wide 64-bit programs
    if let Ok(uninstall_key) = hklm.open_subkey("SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall") {
        scan_registry_key(&uninstall_key, &mut programs, "64-bit", "System");
    }

    // Scan system-wide 32-bit programs
    if let Ok(uninstall_key) = hklm.open_subkey("SOFTWARE\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall") {
        scan_registry_key(&uninstall_key, &mut programs, "32-bit", "System");
    }

    // Scan user-installed programs (HKEY_CURRENT_USER)
    if let Ok(uninstall_key) = hkcu.open_subkey("SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall") {
        scan_registry_key(&uninstall_key, &mut programs, "User", "User");
    }

    // Scan alternative installation locations
    scan_alternative_locations(&mut programs);

    // Scan VF company deployed applications
    scan_vf_deployed_applications(&mut programs);

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
                    return Some(test_path.clone());
                }
                "exe" | "dll" => {
                    // For executable files, return the path
                    return Some(test_path.clone());
                }
                "lnk" => {
                    // Shortcut file
                    return Some(test_path.clone());
                }
                _ => {
                    // Unknown extension, but file exists
                    return Some(test_path.clone());
                }
            }
        }
    }
    
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
        ("%APPDATA%", r"C:\Users\%USERNAME%\AppData\Roaming"),
        ("%LOCALAPPDATA%", r"C:\Users\%USERNAME%\AppData\Local"),
        ("%USERPROFILE%", r"C:\Users\%USERNAME%"),
    ];
    
    for (var, value) in &replacements {
        expanded = expanded.replace(var, value);
    }
    
    expanded
}

fn scan_vf_deployed_applications(programs: &mut Vec<ProgramInfo>) {
    // Scan all programs for APPID in Comments field to identify VF-deployed applications
    for program in programs.iter_mut() {
        if let Some(comments) = &program.comments {
            if comments.contains("APPID:") {
                program.is_vf_deployed = true;
            }
        }
    }
}

fn scan_alternative_locations(programs: &mut Vec<ProgramInfo>) {
    // Get current user's profile path
    if let Ok(user_profile) = std::env::var("USERPROFILE") {
        let appdata_roaming = format!("{}\\AppData\\Roaming", user_profile);
        let appdata_local = format!("{}\\AppData\\Local", user_profile);
        
        // Scan AppData\Roaming for portable applications
        scan_directory_for_programs(&appdata_roaming, programs, "AppData\\Roaming");
        
        // Scan AppData\Local for portable applications
        scan_directory_for_programs(&appdata_local, programs, "AppData\\Local");
    }
    
    // Scan common portable application locations
    let common_paths = [
        r"C:\PortableApps",
        r"C:\Tools",
        r"C:\Utilities",
        r"C:\Programs",
    ];
    
    for path in &common_paths {
        if Path::new(path).exists() {
            scan_directory_for_programs(path, programs, "Portable");
        }
    }
}

fn scan_directory_for_programs(base_path: &str, programs: &mut Vec<ProgramInfo>, source: &str) {
    if let Ok(entries) = fs::read_dir(base_path) {
        for entry in entries {
            if let Ok(entry) = entry {
                let path = entry.path();
                if path.is_dir() {
                    let dir_name = path.file_name().unwrap().to_string_lossy().to_string();
                    
                    // Look for common executable patterns
                    let executable_patterns = [
                        format!("{}.exe", dir_name),
                        format!("{}\\{}.exe", dir_name, dir_name),
                        format!("{}\\bin\\{}.exe", dir_name, dir_name),
                        format!("{}\\app\\{}.exe", dir_name, dir_name),
                    ];
                    
                    for pattern in &executable_patterns {
                        let full_path = format!("{}\\{}", base_path, pattern);
                        if Path::new(&full_path).exists() {
                            // Try to get version info from the executable
                            let version = get_file_version(&full_path);
                            
                            let program = ProgramInfo {
                                name: dir_name.clone(),
                                registry_name: format!("{}_{}", dir_name, source.replace("\\", "_")),
                                version,
                                registry_time: None,
                                install_date: None,
                                installed_for: Some("Current User".to_string()),
                                install_location: Some(full_path.clone()),
                                install_source: None,
                                install_folder_created: None,
                                install_folder_modified: None,
                                install_folder_owner: None,
                                publisher: None,
                                uninstall_string: None,
                                change_install_string: None,
                                quiet_uninstall_string: None,
                                comments: Some(format!("Portable application found in {}", source)),
                                about_url: None,
                                update_info_url: None,
                                help_link: None,
                                install_source_path: None,
                                installer_name: None,
                                release_type: None,
                                icon_path: Some(full_path.clone()),
                                msi_filename: None,
                                estimated_size: None,
                                attributes: None,
                                language: None,
                                parent_key_name: None,
                                registry_path: format!("Filesystem: {}", full_path),
                                program_type: "Portable Application".to_string(),
                                is_windows_installer: false,
                                architecture: "Unknown".to_string(),
                                installation_source: "Filesystem".to_string(),
                                is_vf_deployed: false, // Portable apps are not VF-deployed
                            };
                            
                            // Check if we already have this program (avoid duplicates)
                            if !programs.iter().any(|p| p.name == program.name && p.install_location == program.install_location) {
                                programs.push(program);
                            }
                            break; // Found executable, move to next directory
                        }
                    }
                }
            }
        }
    }
}

fn get_file_version(_file_path: &str) -> Option<String> {
    // This is a simplified version extraction
    // In a real implementation, you might want to use a Windows API to get the actual version
    // For now, we'll just return None and let the UI handle missing versions
    None
}

fn scan_registry_key(key: &RegKey, programs: &mut Vec<ProgramInfo>, architecture: &str, source: &str) {
    for key_result in key.enum_keys() {
        if let Ok(key_name) = key_result {
            if let Ok(program_key) = key.open_subkey(&key_name) {
                if let Ok(name) = program_key.get_value::<String, _>("DisplayName") {
                    let icon_path = program_key.get_value("DisplayIcon")
                        .ok()
                        .and_then(|path: String| extract_icon_path(&path));

                    let installed_for = match source {
                        "User" => Some("Current User".to_string()),
                        _ => Some(format!("All Users ({})", architecture)),
                    };

                    let registry_path = match source {
                        "User" => format!("HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\{}", key_name),
                        _ => format!("HKEY_LOCAL_MACHINE\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\{}", key_name),
                    };

                    let program = ProgramInfo {
                        name,
                        registry_name: key_name.clone(),
                        version: program_key.get_value("DisplayVersion").ok(),
                        registry_time: program_key.get_value("InstallTime").ok(),
                        install_date: program_key.get_value("InstallDate").ok(),
                        installed_for,
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
                        registry_path,
                        program_type: determine_program_type(&program_key),
                        is_windows_installer: program_key.get_value::<u32, _>("WindowsInstaller").unwrap_or(0) == 1,
                        architecture: architecture.to_string(),
                        installation_source: source.to_string(),
                        is_vf_deployed: false, // Will be updated later by scan_vf_deployed_applications
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

#[tauri::command]
pub async fn download_icon_from_url(url: String) -> Result<String, String> {
    // Download icon from URL and convert to base64
    match reqwest::get(&url).await {
        Ok(response) => {
            if response.status().is_success() {
                match response.bytes().await {
                    Ok(bytes) => {
                        let base64_data = base64::engine::general_purpose::STANDARD.encode(&bytes);
                        
                        // Determine MIME type from URL or content
                        let mime_type = if url.ends_with(".svg") {
                            "image/svg+xml"
                        } else if url.ends_with(".png") {
                            "image/png"
                        } else if url.ends_with(".jpg") || url.ends_with(".jpeg") {
                            "image/jpeg"
                        } else if url.ends_with(".ico") {
                            "image/x-icon"
                        } else {
                            "image/svg+xml" // Default for most CDN icons
                        };
                        
                        Ok(format!("data:{};base64,{}", mime_type, base64_data))
                    }
                    Err(e) => Err(format!("Failed to read response bytes: {}", e))
                }
            } else {
                Err(format!("HTTP error: {}", response.status()))
            }
        }
        Err(e) => Err(format!("Failed to download icon: {}", e))
    }
}

#[tauri::command]
pub fn test_alternative_locations() -> Result<Vec<String>, String> {
    let mut found_programs = Vec::new();
    
    // Get current user's profile path
    if let Ok(user_profile) = std::env::var("USERPROFILE") {
        let appdata_roaming = format!("{}\\AppData\\Roaming", user_profile);
        let appdata_local = format!("{}\\AppData\\Local", user_profile);
        
        // Check for common programs in AppData
        let common_programs = ["Obsidian", "Discord", "Spotify", "Slack", "VSCode", "Code"];
        
        for program in &common_programs {
            let roaming_path = format!("{}\\{}", appdata_roaming, program);
            let local_path = format!("{}\\{}", appdata_local, program);
            
            if Path::new(&roaming_path).exists() {
                found_programs.push(format!("Found {} in AppData\\Roaming", program));
            }
            if Path::new(&local_path).exists() {
                found_programs.push(format!("Found {} in AppData\\Local", program));
            }
        }
    }
    
    if found_programs.is_empty() {
        found_programs.push("No common programs found in alternative locations".to_string());
    }
    
    Ok(found_programs)
} 