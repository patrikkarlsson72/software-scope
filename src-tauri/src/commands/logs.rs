use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;
use tauri::command;
use chrono::{DateTime, Utc};
use std::time::SystemTime;
use std::process::Command;
use std::env;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct LogFileInfo {
    pub filename: String,
    pub full_path: String,
    pub size: u64,
    pub created: DateTime<Utc>,
    pub modified: DateTime<Utc>,
    pub program_name: Option<String>,
    pub is_vf_log: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LogViewerConfig {
    pub log_directory: String,
    pub max_file_size_mb: u64,
    pub enabled: bool,
}

#[command]
pub async fn scan_vf_log_directory(config: LogViewerConfig) -> Result<Vec<LogFileInfo>, String> {
    if !config.enabled {
        return Ok(vec![]);
    }

    let mut log_files = Vec::new();
    let max_size_bytes = config.max_file_size_mb * 1024 * 1024;

    let log_path = Path::new(&config.log_directory);
    
    if !log_path.exists() {
        return Err(format!("Log directory does not exist: {}", config.log_directory));
    }

    if !log_path.is_dir() {
        return Err(format!("Path is not a directory: {}", config.log_directory));
    }

    match fs::read_dir(log_path) {
        Ok(entries) => {
            for entry in entries {
                if let Ok(entry) = entry {
                    let path = entry.path();
                    
                    if path.is_file() {
                        if let Some(filename) = path.file_name().and_then(|n| n.to_str()) {
                            // Check if it's a log file (common extensions)
                            let is_log_file = filename.to_lowercase().ends_with(".log") ||
                                             filename.to_lowercase().ends_with(".txt") ||
                                             filename.to_lowercase().contains("log");
                            
                            if is_log_file {
                                if let Ok(metadata) = fs::metadata(&path) {
                                    let size = metadata.len();
                                    
                                    // Skip files that are too large
                                    if size > max_size_bytes {
                                        continue;
                                    }

                                    let created = metadata.created()
                                        .unwrap_or(SystemTime::UNIX_EPOCH)
                                        .duration_since(SystemTime::UNIX_EPOCH)
                                        .unwrap_or_default();
                                    
                                    let modified = metadata.modified()
                                        .unwrap_or(SystemTime::UNIX_EPOCH)
                                        .duration_since(SystemTime::UNIX_EPOCH)
                                        .unwrap_or_default();

                                    // Try to extract program name from filename
                                    let program_name = extract_program_name_from_filename(filename);

                                    log_files.push(LogFileInfo {
                                        filename: filename.to_string(),
                                        full_path: path.to_string_lossy().to_string(),
                                        size,
                                        created: DateTime::from_timestamp(created.as_secs() as i64, 0)
                                            .unwrap_or_else(|| Utc::now()),
                                        modified: DateTime::from_timestamp(modified.as_secs() as i64, 0)
                                            .unwrap_or_else(|| Utc::now()),
                                        program_name,
                                        is_vf_log: is_vf_log_file(filename),
                                    });
                                }
                            }
                        }
                    }
                }
            }
        }
        Err(e) => {
            return Err(format!("Failed to read log directory: {}", e));
        }
    }

    // Sort by modification date (newest first)
    log_files.sort_by(|a, b| b.modified.cmp(&a.modified));

    Ok(log_files)
}

#[command]
pub async fn read_log_file(file_path: String, max_lines: Option<usize>) -> Result<String, String> {
    let path = Path::new(&file_path);
    
    if !path.exists() {
        return Err("File does not exist".to_string());
    }

    if !path.is_file() {
        return Err("Path is not a file".to_string());
    }

    // Read file as bytes and convert to string with lossy UTF-8 conversion
    // This handles encoding issues gracefully by replacing invalid UTF-8 with
    let bytes = match fs::read(path) {
        Ok(data) => data,
        Err(e) => return Err(format!("Failed to read file: {}", e))
    };

    let content = String::from_utf8_lossy(&bytes).to_string();

    if let Some(max) = max_lines {
        let lines: Vec<&str> = content.lines().collect();
        let lines_to_show = if lines.len() > max {
            &lines[lines.len() - max..]
        } else {
            &lines
        };
        Ok(lines_to_show.join("\n"))
    } else {
        Ok(content)
    }
}

#[command]
pub async fn get_log_file_info(file_path: String) -> Result<LogFileInfo, String> {
    let path = Path::new(&file_path);
    
    if !path.exists() {
        return Err("File does not exist".to_string());
    }

    if !path.is_file() {
        return Err("Path is not a file".to_string());
    }

    let filename = path.file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("unknown")
        .to_string();

    match fs::metadata(path) {
        Ok(metadata) => {
            let size = metadata.len();
            
            let created = metadata.created()
                .unwrap_or(SystemTime::UNIX_EPOCH)
                .duration_since(SystemTime::UNIX_EPOCH)
                .unwrap_or_default();
            
            let modified = metadata.modified()
                .unwrap_or(SystemTime::UNIX_EPOCH)
                .duration_since(SystemTime::UNIX_EPOCH)
                .unwrap_or_default();

            let program_name = extract_program_name_from_filename(&filename);
            let is_vf_log = is_vf_log_file(&filename);
            
            Ok(LogFileInfo {
                filename,
                full_path: file_path,
                size,
                created: DateTime::from_timestamp(created.as_secs() as i64, 0)
                    .unwrap_or_else(|| Utc::now()),
                modified: DateTime::from_timestamp(modified.as_secs() as i64, 0)
                    .unwrap_or_else(|| Utc::now()),
                program_name,
                is_vf_log,
            })
        }
        Err(e) => Err(format!("Failed to get file metadata: {}", e))
    }
}

#[command]
pub async fn copy_file_to_temp(source_path: String, filename: String) -> Result<String, String> {
    let source = Path::new(&source_path);
    
    if !source.exists() {
        return Err("Source file does not exist".to_string());
    }

    // Get temp directory
    let temp_dir = env::temp_dir();
    let temp_file_path = temp_dir.join(&filename);
    
    // Copy the file to temp directory
    match fs::copy(source, &temp_file_path) {
        Ok(_) => Ok(temp_file_path.to_string_lossy().to_string()),
        Err(e) => Err(format!("Failed to copy file to temp: {}", e))
    }
}

#[command]
pub async fn open_file_with_editor(file_path: String, editor: String) -> Result<(), String> {
    let path = Path::new(&file_path);
    
    if !path.exists() {
        return Err("File does not exist".to_string());
    }

    let result = match editor.as_str() {
        "cmtrace" => {
            // Try to find CMTrace in common locations
            let cmtrace_paths = [
                r"C:\Program Files (x86)\Microsoft Configuration Manager\AdminConsole\bin\cmtrace.exe",
                r"C:\Program Files\Microsoft Configuration Manager\AdminConsole\bin\cmtrace.exe",
                r"C:\Windows\System32\cmtrace.exe",
                r"C:\Windows\SysWOW64\cmtrace.exe",
            ];
            
            let mut found = false;
            for cmtrace_path in &cmtrace_paths {
                if Path::new(cmtrace_path).exists() {
                    Command::new(cmtrace_path)
                        .arg(&file_path)
                        .spawn()
                        .map_err(|e| format!("Failed to open with CMTrace: {}", e))?;
                    found = true;
                    break;
                }
            }
            
            if !found {
                return Err("CMTrace not found. Please install Configuration Manager Admin Console or copy cmtrace.exe to System32.".to_string());
            }
            Ok(())
        },
        "notepad++" => {
            let notepad_paths = [
                r"C:\Program Files\Notepad++\notepad++.exe",
                r"C:\Program Files (x86)\Notepad++\notepad++.exe",
            ];
            
            let mut found = false;
            for notepad_path in &notepad_paths {
                if Path::new(notepad_path).exists() {
                    Command::new(notepad_path)
                        .arg(&file_path)
                        .spawn()
                        .map_err(|e| format!("Failed to open with Notepad++: {}", e))?;
                    found = true;
                    break;
                }
            }
            
            if !found {
                return Err("Notepad++ not found. Please install Notepad++ or use a different editor.".to_string());
            }
            Ok(())
        },
        "vscode" => {
            Command::new("code")
                .arg(&file_path)
                .spawn()
                .map_err(|e| format!("Failed to open with VS Code: {}. Make sure VS Code is installed and 'code' command is in PATH.", e))?;
            Ok(())
        },
        "notepad" => {
            Command::new("notepad")
                .arg(&file_path)
                .spawn()
                .map_err(|e| format!("Failed to open with Notepad: {}", e))?;
            Ok(())
        },
        "default" => {
            // Use the default system handler
            #[cfg(target_os = "windows")]
            {
                Command::new("cmd")
                    .args(&["/C", "start", "", &file_path])
                    .spawn()
                    .map_err(|e| format!("Failed to open with default editor: {}", e))?;
            }
            #[cfg(not(target_os = "windows"))]
            {
                Command::new("xdg-open")
                    .arg(&file_path)
                    .spawn()
                    .map_err(|e| format!("Failed to open with default editor: {}", e))?;
            }
            Ok(())
        },
        _ => Err("Unknown editor specified".to_string())
    };

    result
}

fn extract_program_name_from_filename(filename: &str) -> Option<String> {
    // Common VF log file patterns:
    // - AppName_YYYYMMDD_HHMMSS.log
    // - AppName-Install.log
    // - AppName.log
    // - VF_AppName_Install.log
    // - COM-Vendor-AppName-Version.log
    // - AnyDeskClient_8.0.9.1_x64_EN_01_PSAppDeployToolkit_Install.log
    
    let mut name = filename.to_lowercase();
    
    // Remove common prefixes
    if name.starts_with("vf_") {
        name = name[3..].to_string();
    }
    
    // Remove common suffixes
    if name.ends_with(".log") {
        name = name[..name.len() - 4].to_string();
    } else if name.ends_with(".txt") {
        name = name[..name.len() - 4].to_string();
    }
    
    // Remove timestamp patterns (YYYYMMDD_HHMMSS or similar)
    if name.contains("_20") && name.len() > 10 {
        // Look for timestamp pattern
        let parts: Vec<&str> = name.split('_').collect();
        if parts.len() > 1 {
            // Check if last part looks like a timestamp
            let last_part = parts.last().unwrap();
            if last_part.len() >= 8 && last_part.chars().all(|c| c.is_ascii_digit()) {
                // Remove the timestamp part
                name = parts[..parts.len()-1].join("_");
            }
        }
    }
    
    // Remove common suffixes and patterns
    name = name.replace("-install", "")
               .replace("-uninstall", "")
               .replace("-update", "")
               .replace("_install", "")
               .replace("_uninstall", "")
               .replace("_update", "")
               .replace("_x64", "")
               .replace("_x86", "")
               .replace("_en", "")
               .replace("_01", "")
               .replace("_02", "")
               .replace("_03", "")
               .replace("_04", "")
               .replace("_05", "")
               .replace("_06", "")
               .replace("_07", "")
               .replace("_08", "")
               .replace("_09", "")
               .replace("_10", "")
               .replace("_11", "")
               .replace("_12", "")
               .replace("_13", "")
               .replace("_14", "")
               .replace("_15", "")
               .replace("_16", "")
               .replace("_17", "")
               .replace("_18", "")
               .replace("_19", "")
               .replace("_20", "")
               .replace("_21", "")
               .replace("_22", "")
               .replace("_23", "")
               .replace("_24", "")
               .replace("_25", "")
               .replace("_26", "")
               .replace("_27", "")
               .replace("_28", "")
               .replace("_29", "")
               .replace("_30", "")
               .replace("_31", "");
    
    // Handle COM- prefixed files (like COM-IgorPavlov-7Zip-x64-24.08.00.0-...)
    if name.starts_with("com-") {
        let parts: Vec<&str> = name.split('-').collect();
        if parts.len() >= 3 {
            // Extract the app name (usually the 3rd part)
            name = parts[2].to_string();
        }
    }
    
    // Handle version patterns (like 8.0.9.1)
    // Remove version numbers that are standalone
    let parts: Vec<&str> = name.split('_').collect();
    let mut filtered_parts = Vec::new();
    
    for part in parts {
        // Skip parts that look like version numbers (contain dots and are mostly digits)
        if part.contains('.') && part.chars().filter(|c| c.is_ascii_digit() || *c == '.').count() >= part.len() * 2 / 3 {
            continue;
        }
        // Skip parts that are just numbers
        if part.chars().all(|c| c.is_ascii_digit()) && part.len() <= 2 {
            continue;
        }
        filtered_parts.push(part);
    }
    
    if !filtered_parts.is_empty() {
        name = filtered_parts.join("_");
    }
    
    // Clean up any remaining artifacts
    name = name.trim_matches('_').to_string();
    
    if name.is_empty() {
        None
    } else {
        Some(name)
    }
}

fn is_vf_log_file(filename: &str) -> bool {
    let name = filename.to_lowercase();
    
    // VF log files typically contain these patterns
    name.contains("vf_") ||
    name.contains("install") ||
    name.contains("deploy") ||
    name.contains("setup") ||
    name.ends_with(".log") ||
    name.ends_with(".txt")
}
