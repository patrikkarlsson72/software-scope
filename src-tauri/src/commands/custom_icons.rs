use std::path::{Path, PathBuf};
use std::fs;
use serde::{Deserialize, Serialize};
use tauri::command;
use crate::services::icon_extractor::IconExtractor;

#[derive(Debug, Serialize, Deserialize)]
pub struct CustomIconInfo {
    pub program_name: String,
    pub icon_path: String,
    pub icon_data: String,
    pub format: String,
    pub size: u32,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CustomIconRequest {
    pub program_name: String,
    pub icon_path: String,
    pub preferred_size: u32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CustomIconResponse {
    pub success: bool,
    pub message: String,
    pub icon_info: Option<CustomIconInfo>,
}

// Get the custom icons directory path
fn get_custom_icons_dir() -> PathBuf {
    let mut path = dirs::data_dir().unwrap_or_else(|| PathBuf::from("."));
    path.push("software-scope");
    path.push("custom_icons");
    path
}

// Ensure custom icons directory exists
fn ensure_custom_icons_dir() -> Result<(), Box<dyn std::error::Error>> {
    let dir = get_custom_icons_dir();
    if !dir.exists() {
        fs::create_dir_all(&dir)?;
    }
    Ok(())
}

// Get custom icon file path for a program
fn get_custom_icon_path(program_name: &str) -> PathBuf {
    let mut path = get_custom_icons_dir();
    // Sanitize program name for filename
    let sanitized_name = program_name
        .chars()
        .map(|c| if c.is_alphanumeric() || c == '-' || c == '_' { c } else { '_' })
        .collect::<String>();
    path.push(format!("{}.json", sanitized_name));
    path
}

#[command]
pub async fn set_custom_icon(request: CustomIconRequest) -> Result<CustomIconResponse, String> {
    println!("🎨 Setting custom icon for: {}", request.program_name);
    
    // Ensure custom icons directory exists
    if let Err(e) = ensure_custom_icons_dir() {
        return Ok(CustomIconResponse {
            success: false,
            message: format!("Failed to create custom icons directory: {}", e),
            icon_info: None,
        });
    }

    // Check if the icon file exists
    if !Path::new(&request.icon_path).exists() {
        return Ok(CustomIconResponse {
            success: false,
            message: format!("Icon file not found: {}", request.icon_path),
            icon_info: None,
        });
    }

    // Extract icon using the existing IconExtractor
    let mut extractor = IconExtractor::new();
    let extracted_icon = match extractor.extract_icon_from_ico(&request.icon_path, request.preferred_size) {
        Ok(icon) => icon,
        Err(e) => {
            return Ok(CustomIconResponse {
                success: false,
                message: format!("Failed to extract icon: {}", e),
                icon_info: None,
            });
        }
    };

    // Create custom icon info
    let custom_icon_info = CustomIconInfo {
        program_name: request.program_name.clone(),
        icon_path: request.icon_path.clone(),
        icon_data: extracted_icon.data,
        format: extracted_icon.format,
        size: extracted_icon.size,
        created_at: chrono::Utc::now().to_rfc3339(),
    };

    // Save custom icon info to file
    let custom_icon_path = get_custom_icon_path(&request.program_name);
    match serde_json::to_string_pretty(&custom_icon_info) {
        Ok(json) => {
            if let Err(e) = fs::write(&custom_icon_path, json) {
                return Ok(CustomIconResponse {
                    success: false,
                    message: format!("Failed to save custom icon: {}", e),
                    icon_info: None,
                });
            }
        }
        Err(e) => {
            return Ok(CustomIconResponse {
                success: false,
                message: format!("Failed to serialize custom icon: {}", e),
                icon_info: None,
            });
        }
    }

    println!("✅ Custom icon saved for: {}", request.program_name);
    Ok(CustomIconResponse {
        success: true,
        message: format!("Custom icon set for {}", request.program_name),
        icon_info: Some(custom_icon_info),
    })
}

#[command]
pub async fn get_custom_icon(program_name: String) -> Result<CustomIconResponse, String> {
    println!("🔍 Getting custom icon for: {}", program_name);
    
    let custom_icon_path = get_custom_icon_path(&program_name);
    
    if !custom_icon_path.exists() {
        return Ok(CustomIconResponse {
            success: false,
            message: "No custom icon found".to_string(),
            icon_info: None,
        });
    }

    match fs::read_to_string(&custom_icon_path) {
        Ok(json) => {
            match serde_json::from_str::<CustomIconInfo>(&json) {
                Ok(icon_info) => {
                    println!("✅ Found custom icon for: {}", program_name);
                    Ok(CustomIconResponse {
                        success: true,
                        message: "Custom icon found".to_string(),
                        icon_info: Some(icon_info),
                    })
                }
                Err(e) => {
                    Ok(CustomIconResponse {
                        success: false,
                        message: format!("Failed to parse custom icon: {}", e),
                        icon_info: None,
                    })
                }
            }
        }
        Err(e) => {
            Ok(CustomIconResponse {
                success: false,
                message: format!("Failed to read custom icon: {}", e),
                icon_info: None,
            })
        }
    }
}

#[command]
pub async fn remove_custom_icon(program_name: String) -> Result<CustomIconResponse, String> {
    println!("🗑️ Removing custom icon for: {}", program_name);
    
    let custom_icon_path = get_custom_icon_path(&program_name);
    
    if !custom_icon_path.exists() {
        return Ok(CustomIconResponse {
            success: false,
            message: "No custom icon found to remove".to_string(),
            icon_info: None,
        });
    }

    match fs::remove_file(&custom_icon_path) {
        Ok(_) => {
            println!("✅ Custom icon removed for: {}", program_name);
            Ok(CustomIconResponse {
                success: true,
                message: format!("Custom icon removed for {}", program_name),
                icon_info: None,
            })
        }
        Err(e) => {
            Ok(CustomIconResponse {
                success: false,
                message: format!("Failed to remove custom icon: {}", e),
                icon_info: None,
            })
        }
    }
}

#[command]
pub async fn list_custom_icons() -> Result<Vec<CustomIconInfo>, String> {
    println!("📋 Listing all custom icons");
    
    let custom_icons_dir = get_custom_icons_dir();
    
    if !custom_icons_dir.exists() {
        return Ok(vec![]);
    }

    let mut custom_icons = Vec::new();
    
    match fs::read_dir(&custom_icons_dir) {
        Ok(entries) => {
            for entry in entries.flatten() {
                if let Some(file_name) = entry.file_name().to_str() {
                    if file_name.ends_with(".json") {
                        match fs::read_to_string(entry.path()) {
                            Ok(json) => {
                                if let Ok(icon_info) = serde_json::from_str::<CustomIconInfo>(&json) {
                                    custom_icons.push(icon_info);
                                }
                            }
                            Err(_) => {
                                // Skip invalid files
                                continue;
                            }
                        }
                    }
                }
            }
        }
        Err(e) => {
            return Err(format!("Failed to read custom icons directory: {}", e));
        }
    }

    // Sort by program name
    custom_icons.sort_by(|a, b| a.program_name.cmp(&b.program_name));
    
    println!("✅ Found {} custom icons", custom_icons.len());
    Ok(custom_icons)
}

#[command]
pub async fn open_custom_icons_directory() -> Result<String, String> {
    println!("📁 Opening custom icons directory");
    
    let custom_icons_dir = get_custom_icons_dir();
    
    // Ensure directory exists
    if let Err(e) = ensure_custom_icons_dir() {
        return Err(format!("Failed to create custom icons directory: {}", e));
    }

    // Open directory in file explorer
    #[cfg(target_os = "windows")]
    {
        use std::process::Command;
        match Command::new("explorer").arg(&custom_icons_dir).spawn() {
            Ok(_) => Ok(format!("Opened directory: {}", custom_icons_dir.display())),
            Err(e) => Err(format!("Failed to open directory: {}", e)),
        }
    }
    
    #[cfg(not(target_os = "windows"))]
    {
        Err("Directory opening not supported on this platform".to_string())
    }
}
