use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;
use tauri::command;
use chrono::{DateTime, Utc};
use std::time::SystemTime;

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

    let log_path = Path::new(&config.log_directory);
    
    if !log_path.exists() {
        return Err(format!("Log directory does not exist: {}", config.log_directory));
    }

    if !log_path.is_dir() {
        return Err(format!("Path is not a directory: {}", config.log_directory));
    }

    let mut log_files = Vec::new();
    let max_size_bytes = config.max_file_size_mb * 1024 * 1024;

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

    match fs::read_to_string(path) {
        Ok(content) => {
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
        Err(e) => Err(format!("Failed to read file: {}", e))
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

fn extract_program_name_from_filename(filename: &str) -> Option<String> {
    // Common VF log file patterns:
    // - AppName_YYYYMMDD_HHMMSS.log
    // - AppName-Install.log
    // - AppName.log
    // - VF_AppName_Install.log
    
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
    
    // Remove common suffixes
    name = name.replace("-install", "")
               .replace("-uninstall", "")
               .replace("-update", "");
    
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
