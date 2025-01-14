use std::collections::HashMap;
use winreg::enums::*;
use winreg::RegKey;
use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct ProgramInfo {
    name: String,
    publisher: Option<String>,
    install_date: Option<String>,
    install_location: Option<String>,
    version: Option<String>,
    uninstall_string: Option<String>,
    registry_path: String,
    program_type: String,
    is_windows_installer: bool,
}

#[tauri::command]
pub fn get_installed_programs() -> Result<Vec<ProgramInfo>, String> {
    let hklm = RegKey::predef(HKEY_LOCAL_MACHINE);
    let uninstall_key = hklm.open_subkey("SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall")
        .map_err(|e| e.to_string())?;

    let mut programs = Vec::new();

    for key_result in uninstall_key.enum_keys() {
        match key_result {
            Ok(key_name) => {
                if let Ok(key) = uninstall_key.open_subkey(&key_name) {
                    let program = ProgramInfo {
                        name: key.get_value("DisplayName").unwrap_or_default(),
                        publisher: key.get_value("Publisher").ok(),
                        install_date: key.get_value("InstallDate").ok(),
                        install_location: key.get_value("InstallLocation").ok(),
                        version: key.get_value("DisplayVersion").ok(),
                        uninstall_string: key.get_value("UninstallString").ok(),
                        registry_path: format!("HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\{}", key_name),
                        program_type: determine_program_type(&key),
                        is_windows_installer: key.get_value("WindowsInstaller")
                            .unwrap_or(0u32) == 1,
                    };
                    
                    // Only add if it has a display name
                    if !program.name.is_empty() {
                        programs.push(program);
                    }
                }
            }
            Err(_) => continue,
        }
    }

    Ok(programs)
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