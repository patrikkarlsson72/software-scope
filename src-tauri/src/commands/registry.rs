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
    pub shortcuts: Option<Vec<String>>,  // NEW: List of shortcut paths found
    pub programdata_paths: Option<Vec<String>>, // NEW: List of ProgramData paths found
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

#[tauri::command]
pub fn open_winver() -> Result<(), String> {
    // Open winver command to show Windows version dialog
    std::process::Command::new("winver")
        .spawn()
        .map_err(|e| format!("Failed to open winver: {}", e))?;
    
    Ok(())
}

#[tauri::command]
pub fn debug_windows_version() -> Result<String, String> {
    let hklm = RegKey::predef(HKEY_LOCAL_MACHINE);
    
    if let Ok(version_key) = hklm.open_subkey("SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion") {
        let product_name = version_key.get_value::<String, _>("ProductName").unwrap_or_default();
        let build_number = version_key.get_value::<u32, _>("CurrentBuild").unwrap_or(0);
        let display_version = version_key.get_value::<String, _>("DisplayVersion").unwrap_or_default();
        let release_id = version_key.get_value::<String, _>("ReleaseId").unwrap_or_default();
        let ubr = version_key.get_value::<u32, _>("UBR").unwrap_or(0);
        
        Ok(format!(
            "ProductName: {}\nBuild: {}\nDisplayVersion: {}\nReleaseId: {}\nUBR: {}",
            product_name, build_number, display_version, release_id, ubr
        ))
    } else {
        Ok("Failed to read registry".to_string())
    }
}

fn get_windows_version() -> Result<String, String> {
    // Use PowerShell to get Windows version - similar to winver but we can capture output
    let output = std::process::Command::new("powershell")
        .args(&["-Command", "Get-ComputerInfo | Select-Object WindowsProductName, WindowsVersion | Format-Table -HideTableHeaders"])
        .output();
    
    if let Ok(output) = output {
        let output_str = String::from_utf8_lossy(&output.stdout);
        let lines: Vec<&str> = output_str.lines().collect();
        
        if lines.len() >= 2 {
            let product_line = lines[0].trim();
            let version_line = lines[1].trim();
            
            // Extract Windows version from product name
            let windows_version = if product_line.contains("Windows 11") {
                "Windows 11"
            } else if product_line.contains("Windows 10") {
                "Windows 10"
            } else {
                "Windows"
            };
            
            // Extract version number (like 24H2)
            let version_number = if !version_line.is_empty() {
                version_line
            } else {
                "Unknown"
            };
            
            return Ok(format!("{} {}", windows_version, version_number));
        }
    }
    
    // Fallback to registry if PowerShell fails
    let hklm = RegKey::predef(HKEY_LOCAL_MACHINE);
    
    if let Ok(version_key) = hklm.open_subkey("SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion") {
        let product_name = version_key.get_value::<String, _>("ProductName")
            .unwrap_or_else(|_| "Windows".to_string());
        
        let display_version = version_key.get_value::<String, _>("DisplayVersion")
            .unwrap_or_else(|_| version_key.get_value::<String, _>("ReleaseId")
                .unwrap_or_else(|_| "Unknown".to_string()));
        
        // Clean up the product name
        let clean_product_name = if product_name.contains("Windows 11") {
            "Windows 11"
        } else if product_name.contains("Windows 10") {
            "Windows 10"
        } else {
            "Windows"
        };
        
        Ok(format!("{} {}", clean_product_name, display_version))
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
pub fn debug_vf_apps() -> Result<Vec<VFDebugInfo>, String> {
    let mut debug_info = Vec::new();
    let hklm = RegKey::predef(HKEY_LOCAL_MACHINE);

    if let Ok(uninstall_key) = hklm.open_subkey("SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall") {
        for key_result in uninstall_key.enum_keys() {
            if let Ok(key_name) = key_result {
                if let Ok(program_key) = uninstall_key.open_subkey(&key_name) {
                    if let Ok(name) = program_key.get_value::<String, _>("DisplayName") {
                        let comments: Option<String> = program_key.get_value("Comments").ok();
                        let has_appid = comments.as_ref().map_or(false, |c| c.contains("APPID:"));
                        let icon_path: Option<String> = program_key.get_value("DisplayIcon").ok();
                        let publisher: Option<String> = program_key.get_value("Publisher").ok();
                        
                        debug_info.push(VFDebugInfo {
                            program_name: name,
                            comments,
                            has_appid,
                            is_vf_deployed: has_appid,
                            icon_path,
                            publisher,
                        });
                    }
                }
            }
        }
    }

    Ok(debug_info)
}

#[tauri::command]
pub fn debug_vf_icons_to_file() -> Result<String, String> {
    use std::fs::OpenOptions;
    use std::io::Write;
    
    let mut debug_info = Vec::new();
    let hklm = RegKey::predef(HKEY_LOCAL_MACHINE);

    // Get all programs and check VF status
    if let Ok(uninstall_key) = hklm.open_subkey("SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall") {
        for key_result in uninstall_key.enum_keys() {
            if let Ok(key_name) = key_result {
                if let Ok(program_key) = uninstall_key.open_subkey(&key_name) {
                    if let Ok(name) = program_key.get_value::<String, _>("DisplayName") {
                        let comments: Option<String> = program_key.get_value("Comments").ok();
                        let has_appid = comments.as_ref().map_or(false, |c| c.contains("APPID:"));
                        let icon_path: Option<String> = program_key.get_value("DisplayIcon").ok();
                        let publisher: Option<String> = program_key.get_value("Publisher").ok();
                        
                        debug_info.push(VFDebugInfo {
                            program_name: name,
                            comments,
                            has_appid,
                            is_vf_deployed: has_appid,
                            icon_path,
                            publisher,
                        });
                    }
                }
            }
        }
    }

    // Write debug info to file
    let debug_file = "vf_icon_debug.txt";
    let mut file = OpenOptions::new()
        .create(true)
        .write(true)
        .truncate(true)
        .open(debug_file)
        .map_err(|e| format!("Failed to create debug file: {}", e))?;

    writeln!(file, "VF Icon Debug Report - {}", chrono::Utc::now().format("%Y-%m-%d %H:%M:%S UTC")).unwrap();
    writeln!(file, "{}", "=".repeat(60)).unwrap();
    writeln!(file, "").unwrap();

    let vf_apps: Vec<_> = debug_info.iter().filter(|app| app.is_vf_deployed).collect();
    writeln!(file, "Found {} VF managed apps out of {} total apps", vf_apps.len(), debug_info.len()).unwrap();
    writeln!(file, "").unwrap();

    if vf_apps.is_empty() {
        writeln!(file, "❌ NO VF MANAGED APPS FOUND!").unwrap();
        writeln!(file, "").unwrap();
        writeln!(file, "This could be the root cause of the icon issue.").unwrap();
        writeln!(file, "VF apps are detected by looking for 'APPID:' in the Comments field.").unwrap();
        writeln!(file, "").unwrap();
        writeln!(file, "Sample apps with comments (first 10):").unwrap();
        for app in debug_info.iter().take(10) {
            if let Some(comments) = &app.comments {
                writeln!(file, "  - {}: Comments = '{}'", app.program_name, comments).unwrap();
            }
        }
    } else {
        writeln!(file, "✅ VF MANAGED APPS FOUND:").unwrap();
        for (i, app) in vf_apps.iter().enumerate() {
            writeln!(file, "{}. {}", i + 1, app.program_name).unwrap();
            writeln!(file, "   Publisher: {}", app.publisher.as_deref().unwrap_or("N/A")).unwrap();
            writeln!(file, "   Icon Path: {}", app.icon_path.as_deref().unwrap_or("N/A")).unwrap();
            writeln!(file, "   Comments: {}", app.comments.as_deref().unwrap_or("N/A")).unwrap();
            writeln!(file, "").unwrap();
        }
    }

    writeln!(file, "{}", "=".repeat(60)).unwrap();
    writeln!(file, "End of debug report").unwrap();

    Ok(format!("Debug report written to {}", debug_file))
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

#[derive(Debug, Serialize, Deserialize)]
pub struct VFDebugInfo {
    pub program_name: String,
    pub comments: Option<String>,
    pub has_appid: bool,
    pub is_vf_deployed: bool,
    pub icon_path: Option<String>,
    pub publisher: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AteaInformation {
    pub appid: Option<String>,
    pub app_reference: Option<String>,
    pub app_script_author: Option<String>,
    pub app_update: Option<String>,
    pub architecture: Option<String>,
    pub date_time: Option<String>,
    pub language: Option<String>,
    pub manufacturer: Option<String>,
    pub name: Option<String>,
    pub revision: Option<String>,
    pub version: Option<String>,
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
    // Enhanced environment variable expansion for common Windows paths
    let mut expanded = path.to_string();
    
    // Common Windows environment variables
    let replacements = [
        ("%ProgramFiles%", r"C:\Program Files"),
        ("%ProgramFiles(x86)%", r"C:\Program Files (x86)"),
        ("%ProgramData%", r"C:\ProgramData"),
        ("%SystemRoot%", r"C:\Windows"),
        ("%windir%", r"C:\Windows"),
        ("%SystemDrive%", "C:"),
        ("%SystemDirectory%", r"C:\Windows\System32"),
        ("%SystemPath%", r"C:\Windows\System32"),
        ("%CommonProgramFiles%", r"C:\Program Files\Common Files"),
        ("%CommonProgramFiles(x86)%", r"C:\Program Files (x86)\Common Files"),
        ("%APPDATA%", r"C:\Users\%USERNAME%\AppData\Roaming"),
        ("%LOCALAPPDATA%", r"C:\Users\%USERNAME%\AppData\Local"),
        ("%USERPROFILE%", r"C:\Users\%USERNAME%"),
        ("%TEMP%", r"C:\Users\%USERNAME%\AppData\Local\Temp"),
        ("%TMP%", r"C:\Users\%USERNAME%\AppData\Local\Temp"),
        ("%PUBLIC%", r"C:\Users\Public"),
        ("%ALLUSERSPROFILE%", r"C:\ProgramData"),
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
        
        // For ALL apps, try to detect actual installation location in Program Files
        // Check if install_location is None, empty, or invalid path
        let needs_location_detection = program.install_location.is_none() || 
            program.install_location.as_ref().map_or(false, |loc| {
                loc.is_empty() || !Path::new(loc).exists()
            });
            
        if needs_location_detection {
            if let Some(detected_location) = detect_program_files_location(&program.name, program.publisher.as_deref()) {
                println!("DEBUG: Detected location for {}: {}", program.name, detected_location);
                program.install_location = Some(detected_location);
            } else {
                // For VF Managed apps, try additional detection methods
                if program.is_vf_deployed {
                    println!("DEBUG: VF Managed app {} - trying additional detection methods", program.name);
                    if let Some(vf_location) = detect_vf_managed_location(&program.name, program.publisher.as_deref()) {
                        println!("DEBUG: VF Managed location detected for {}: {}", program.name, vf_location);
                        program.install_location = Some(vf_location);
                    } else {
                        println!("DEBUG: No VF Managed location detected for {} (publisher: {:?})", program.name, program.publisher);
                    }
                } else {
                    println!("DEBUG: No location detected for {} (publisher: {:?})", program.name, program.publisher);
                }
            }
        } else {
            println!("DEBUG: {} already has valid install_location: {:?}", program.name, program.install_location);
        }
        
        // For ALL apps, scan for shortcuts and ProgramData paths
        let shortcuts = scan_shortcuts(&program.name, program.publisher.as_deref());
        let programdata_paths = scan_programdata_paths(&program.name, program.publisher.as_deref());
        
        if !shortcuts.is_empty() {
            program.shortcuts = Some(shortcuts);
        }
        if !programdata_paths.is_empty() {
            program.programdata_paths = Some(programdata_paths);
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
                                shortcuts: None, // Will be populated later if needed
                                programdata_paths: None, // Will be populated later if needed
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

                    let install_location = program_key.get_value("InstallLocation").ok()
                        .or_else(|| program_key.get_value("InstallSource").ok())
                        .or_else(|| {
                            // Try to extract path from uninstall string as last resort
                            program_key.get_value::<String, _>("UninstallString").ok()
                                .and_then(|uninstall_str| {
                                    // Extract path from common uninstall string patterns
                                    if uninstall_str.contains("\\") {
                                        let path = uninstall_str.split('\\').take(3).collect::<Vec<&str>>().join("\\");
                                        if Path::new(&path).exists() {
                                            Some(path)
                                        } else {
                                            None
                                        }
                                    } else {
                                        None
                                    }
                                })
                        });
                    
                    let program = ProgramInfo {
                        name,
                        registry_name: key_name.clone(),
                        version: program_key.get_value("DisplayVersion").ok(),
                        registry_time: program_key.get_value("InstallTime").ok(),
                        install_date: program_key.get_value("InstallDate").ok(),
                        installed_for,
                        install_location,
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
                        shortcuts: None, // Will be populated later if needed
                        programdata_paths: None, // Will be populated later if needed
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

/// Scan for shortcuts related to a program
fn scan_shortcuts(program_name: &str, publisher: Option<&str>) -> Vec<String> {
    let mut shortcuts = Vec::new();
    
    // Common shortcut locations
    let shortcut_locations = vec![
        // User shortcuts
        format!("{}\\Microsoft\\Windows\\Start Menu\\Programs", 
                std::env::var("APPDATA").unwrap_or_default()),
        // All users shortcuts
        format!("{}\\Microsoft\\Windows\\Start Menu\\Programs", 
                std::env::var("ALLUSERSPROFILE").unwrap_or_default()),
        // Desktop shortcuts
        format!("{}\\Desktop", 
                std::env::var("USERPROFILE").unwrap_or_default()),
        // Public desktop shortcuts
        format!("{}\\Desktop", 
                std::env::var("PUBLIC").unwrap_or_default()),
    ];
    
    for location in shortcut_locations {
        if let Ok(entries) = std::fs::read_dir(&location) {
            for entry in entries.flatten() {
                if let Some(file_name) = entry.file_name().to_str() {
                    let file_name_lower = file_name.to_lowercase();
                    let program_name_lower = program_name.to_lowercase();
                    
                    // Check if shortcut name contains program name or publisher
                    if file_name_lower.contains(&program_name_lower) ||
                       (publisher.is_some() && file_name_lower.contains(&publisher.unwrap().to_lowercase())) {
                        if file_name.ends_with(".lnk") {
                            shortcuts.push(entry.path().to_string_lossy().to_string());
                        }
                    }
                }
            }
        }
    }
    
    shortcuts
}

/// Scan for ProgramData folders related to a program
fn scan_programdata_paths(program_name: &str, publisher: Option<&str>) -> Vec<String> {
    let mut paths = Vec::new();
    
    let programdata = std::env::var("PROGRAMDATA").unwrap_or_else(|_| "C:\\ProgramData".to_string());
    
    if let Ok(entries) = std::fs::read_dir(&programdata) {
        for entry in entries.flatten() {
            if let Some(folder_name) = entry.file_name().to_str() {
                let folder_name_lower = folder_name.to_lowercase();
                let program_name_lower = program_name.to_lowercase();
                
                // Check if folder name contains program name or publisher
                if folder_name_lower.contains(&program_name_lower) ||
                   (publisher.is_some() && folder_name_lower.contains(&publisher.unwrap().to_lowercase())) {
                    if entry.path().is_dir() {
                        paths.push(entry.path().to_string_lossy().to_string());
                    }
                }
            }
        }
    }
    
    paths
}

/// Detect actual installation location in Program Files for VF Managed apps
fn detect_program_files_location(program_name: &str, publisher: Option<&str>) -> Option<String> {
    let program_files_paths = vec![
        r"C:\Program Files",
        r"C:\Program Files (x86)",
    ];
    
    for program_files in program_files_paths {
        if let Ok(entries) = std::fs::read_dir(program_files) {
            for entry in entries.flatten() {
                if let Some(folder_name) = entry.file_name().to_str() {
                    let folder_name_lower = folder_name.to_lowercase();
                    let program_name_lower = program_name.to_lowercase();
                    
                    // More flexible matching for VF Managed apps
                    let is_match = 
                        // Exact name match
                        folder_name_lower == program_name_lower ||
                        // Contains program name
                        folder_name_lower.contains(&program_name_lower) ||
                        // Program name contains folder name (for partial matches)
                        program_name_lower.contains(&folder_name_lower) ||
                        // Publisher match
                        (publisher.is_some() && folder_name_lower.contains(&publisher.unwrap().to_lowercase())) ||
                        // Specific known patterns
                        (program_name_lower.contains("7-zip") && folder_name_lower.contains("7-zip")) ||
                        (program_name_lower.contains("7zip") && folder_name_lower.contains("7-zip")) ||
                        // VF Managed apps might have different naming patterns
                        (program_name_lower.contains("microsoft") && folder_name_lower.contains("microsoft")) ||
                        (program_name_lower.contains("office") && folder_name_lower.contains("office")) ||
                        (program_name_lower.contains("adobe") && folder_name_lower.contains("adobe"));
                    
                    if is_match {
                        let full_path = entry.path().to_string_lossy().to_string();
                        
                        // Verify it's actually the program by looking for common executable patterns
                        if is_likely_program_folder(&full_path, program_name) {
                            return Some(full_path);
                        }
                    }
                }
            }
        }
    }
    
    None
}

/// Check if a folder is likely to contain the actual program
fn is_likely_program_folder(folder_path: &str, program_name: &str) -> bool {
    // Look for common executable patterns in the folder
    let mut common_exe_patterns = vec![
        format!("{}.exe", program_name),
        format!("{}.exe", program_name.replace(" ", "")),
        format!("{}.exe", program_name.replace(" ", "-")),
        format!("{}.exe", program_name.replace(" ", "_")),
        "uninstall.exe".to_string(),
        "setup.exe".to_string(),
        "install.exe".to_string(),
    ];
    
    // Add specific patterns for 7-Zip
    if program_name.to_lowercase().contains("7-zip") || program_name.to_lowercase().contains("7zip") {
        common_exe_patterns.extend(vec![
            "7z.exe".to_string(),
            "7zFM.exe".to_string(),
            "7zG.exe".to_string(),
            "7z.sfx".to_string(),
        ]);
    }
    
    // Add patterns for Microsoft applications (common VF Managed apps)
    if program_name.to_lowercase().contains("microsoft") {
        common_exe_patterns.extend(vec![
            "winword.exe".to_string(),
            "excel.exe".to_string(),
            "powerpnt.exe".to_string(),
            "outlook.exe".to_string(),
            "msedge.exe".to_string(),
            "chrome.exe".to_string(),
            "firefox.exe".to_string(),
        ]);
    }
    
    // Add patterns for Adobe applications
    if program_name.to_lowercase().contains("adobe") {
        common_exe_patterns.extend(vec![
            "acrobat.exe".to_string(),
            "photoshop.exe".to_string(),
            "illustrator.exe".to_string(),
            "indesign.exe".to_string(),
        ]);
    }
    
    if let Ok(entries) = std::fs::read_dir(folder_path) {
        for entry in entries.flatten() {
            if let Some(file_name) = entry.file_name().to_str() {
                let file_name_lower = file_name.to_lowercase();
                
                // Check against specific patterns
                for pattern in &common_exe_patterns {
                    if file_name_lower.contains(&pattern.to_lowercase()) {
                        return true;
                    }
                }
                
                // Also check for any .exe file (more permissive for VF Managed apps)
                if file_name_lower.ends_with(".exe") {
                    // Additional check: make sure it's not a system file
                    if !file_name_lower.contains("system") && 
                       !file_name_lower.contains("windows") &&
                       !file_name_lower.contains("microsoft") {
                        return true;
                    }
                }
            }
        }
    }
    
    false
}

/// Special detection method for VF Managed applications
fn detect_vf_managed_location(program_name: &str, publisher: Option<&str>) -> Option<String> {
    // VF Managed apps might be installed in different locations
    let search_paths = vec![
        r"C:\Program Files",
        r"C:\Program Files (x86)",
        r"C:\ProgramData",
        r"C:\Windows\System32",
        r"C:\Windows\SysWOW64",
    ];
    
    for search_path in search_paths {
        if let Ok(entries) = std::fs::read_dir(search_path) {
            for entry in entries.flatten() {
                if let Some(folder_name) = entry.file_name().to_str() {
                    let folder_name_lower = folder_name.to_lowercase();
                    let program_name_lower = program_name.to_lowercase();
                    
                    // Very flexible matching for VF Managed apps
                    let is_match = 
                        // Any partial match
                        folder_name_lower.contains(&program_name_lower) ||
                        program_name_lower.contains(&folder_name_lower) ||
                        // Publisher match
                        (publisher.is_some() && folder_name_lower.contains(&publisher.unwrap().to_lowercase())) ||
                        // Common VF Managed app patterns
                        (program_name_lower.contains("microsoft") && folder_name_lower.contains("microsoft")) ||
                        (program_name_lower.contains("office") && folder_name_lower.contains("office")) ||
                        (program_name_lower.contains("adobe") && folder_name_lower.contains("adobe")) ||
                        (program_name_lower.contains("chrome") && folder_name_lower.contains("google")) ||
                        (program_name_lower.contains("edge") && folder_name_lower.contains("microsoft"));
                    
                    if is_match {
                        let full_path = entry.path().to_string_lossy().to_string();
                        
                        // For VF Managed apps, be more permissive in verification
                        if is_likely_vf_managed_folder(&full_path, program_name) {
                            return Some(full_path);
                        }
                    }
                }
            }
        }
    }
    
    None
}

/// Check if a folder is likely to contain a VF Managed application
fn is_likely_vf_managed_folder(folder_path: &str, _program_name: &str) -> bool {
    if let Ok(entries) = std::fs::read_dir(folder_path) {
        for entry in entries.flatten() {
            if let Some(file_name) = entry.file_name().to_str() {
                let file_name_lower = file_name.to_lowercase();
                
                // Look for any executable file
                if file_name_lower.ends_with(".exe") {
                    // Exclude system files but be more permissive for VF Managed apps
                    if !file_name_lower.contains("system32") && 
                       !file_name_lower.contains("syswow64") &&
                       !file_name_lower.contains("windows") {
                        return true;
                    }
                }
                
                // Also look for common application files
                if file_name_lower.ends_with(".dll") || 
                   file_name_lower.ends_with(".msi") ||
                   file_name_lower.ends_with(".config") {
                    return true;
                }
            }
        }
    }
    
    false
}

#[tauri::command]
pub fn get_atea_information(appid: String) -> Result<AteaInformation, String> {
    let hklm = RegKey::predef(HKEY_LOCAL_MACHINE);
    let atea_path = "SOFTWARE\\Atea\\Applications";
    
    if let Ok(atea_key) = hklm.open_subkey(atea_path) {
        // Find the GUID that matches the APPID
        for key_result in atea_key.enum_keys() {
            if let Ok(guid) = key_result {
                if let Ok(app_key) = atea_key.open_subkey(&guid) {
                    // Check if this GUID has the matching APPID
                    if let Ok(stored_appid) = app_key.get_value::<String, _>("APPID") {
                        if stored_appid == appid {
                            // Found the matching app, extract all Atea information
                            return Ok(AteaInformation {
                                appid: app_key.get_value("APPID").ok(),
                                app_reference: app_key.get_value("APPReference").ok(),
                                app_script_author: app_key.get_value("APPScriptAuthor").ok(),
                                app_update: app_key.get_value("AppUpdate").ok(),
                                architecture: app_key.get_value("Architecture").ok(),
                                date_time: app_key.get_value("DateTime").ok(),
                                language: app_key.get_value("Language").ok(),
                                manufacturer: app_key.get_value("Manufacturer").ok(),
                                name: app_key.get_value("Name").ok(),
                                revision: app_key.get_value("Revision").ok(),
                                version: app_key.get_value("Version").ok(),
                            });
                        }
                    }
                }
            }
        }
    }
    
    Err(format!("Atea information not found for APPID: {}", appid))
}

#[tauri::command]
pub fn open_program_files_folder(architecture: String) -> Result<(), String> {
    let folder_path = match architecture.as_str() {
        "64-bit" => r"C:\Program Files",
        "32-bit" => r"C:\Program Files (x86)",
        _ => return Err(format!("Unsupported architecture: {}", architecture)),
    };
    
    // Check if folder exists
    if !std::path::Path::new(folder_path).exists() {
        return Err(format!("Folder does not exist: {}", folder_path));
    }
    
    // Open Windows Explorer
    std::process::Command::new("explorer")
        .arg(folder_path)
        .spawn()
        .map_err(|e| format!("Failed to open folder: {}", e))?;
    
    Ok(())
} 