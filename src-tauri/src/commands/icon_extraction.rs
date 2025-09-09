use std::sync::Mutex;
use tauri::State;
use serde::{Serialize, Deserialize};
use crate::services::icon_extractor::{IconExtractor, ExtractedIcon, resolve_icon_path};

// Global state for the icon extractor
pub type IconExtractorState = Mutex<IconExtractor>;

#[derive(Debug, Serialize, Deserialize)]
pub struct IconExtractionRequest {
    pub icon_path: String,
    pub preferred_size: u32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct IconExtractionResponse {
    pub success: bool,
    pub icon: Option<ExtractedIcon>,
    pub error: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct IconCacheStats {
    pub cache_size: usize,
    pub last_updated: String,
}

#[tauri::command]
pub fn extract_icon_from_path(
    request: IconExtractionRequest,
    extractor: State<IconExtractorState>,
) -> Result<IconExtractionResponse, String> {
    let mut extractor = extractor.lock().map_err(|e| format!("Failed to lock extractor: {}", e))?;
    
    // Resolve the icon path to find the actual executable or icon file
    let resolved_path = match resolve_icon_path(&request.icon_path) {
        Some(path) => path,
        None => {
            return Ok(IconExtractionResponse {
                success: false,
                icon: None,
                error: Some(format!("Could not resolve icon path: {}", request.icon_path)),
            });
        }
    };

    // Try to extract icon from the resolved path
    match extractor.extract_icon_from_exe(&resolved_path, request.preferred_size) {
        Ok(icon) => Ok(IconExtractionResponse {
            success: true,
            icon: Some(icon),
            error: None,
        }),
        Err(e) => {
            // If exe extraction fails, try as .ico file
            match extractor.extract_icon_from_ico(&resolved_path, request.preferred_size) {
                Ok(icon) => Ok(IconExtractionResponse {
                    success: true,
                    icon: Some(icon),
                    error: None,
                }),
                Err(ico_error) => Ok(IconExtractionResponse {
                    success: false,
                    icon: None,
                    error: Some(format!("Failed to extract icon: {} (ICO: {})", e, ico_error)),
                }),
            }
        }
    }
}

#[tauri::command]
pub fn extract_icon_from_exe(
    exe_path: String,
    preferred_size: u32,
    extractor: State<IconExtractorState>,
) -> Result<IconExtractionResponse, String> {
    let mut extractor = extractor.lock().map_err(|e| format!("Failed to lock extractor: {}", e))?;
    
    match extractor.extract_icon_from_exe(&exe_path, preferred_size) {
        Ok(icon) => Ok(IconExtractionResponse {
            success: true,
            icon: Some(icon),
            error: None,
        }),
        Err(e) => Ok(IconExtractionResponse {
            success: false,
            icon: None,
            error: Some(format!("Failed to extract icon from exe: {}", e)),
        }),
    }
}

#[tauri::command]
pub fn extract_icon_from_ico(
    ico_path: String,
    preferred_size: u32,
    extractor: State<IconExtractorState>,
) -> Result<IconExtractionResponse, String> {
    let mut extractor = extractor.lock().map_err(|e| format!("Failed to lock extractor: {}", e))?;
    
    match extractor.extract_icon_from_ico(&ico_path, preferred_size) {
        Ok(icon) => Ok(IconExtractionResponse {
            success: true,
            icon: Some(icon),
            error: None,
        }),
        Err(e) => Ok(IconExtractionResponse {
            success: false,
            icon: None,
            error: Some(format!("Failed to extract icon from ico: {}", e)),
        }),
    }
}

#[tauri::command]
pub fn get_icon_cache_stats(
    extractor: State<IconExtractorState>,
) -> Result<IconCacheStats, String> {
    let extractor = extractor.lock().map_err(|e| format!("Failed to lock extractor: {}", e))?;
    let (cache_size, last_updated) = extractor.get_cache_stats();
    
    Ok(IconCacheStats {
        cache_size,
        last_updated,
    })
}

#[tauri::command]
pub fn clear_icon_cache(
    extractor: State<IconExtractorState>,
) -> Result<(), String> {
    let mut extractor = extractor.lock().map_err(|e| format!("Failed to lock extractor: {}", e))?;
    extractor.clear_cache().map_err(|e| format!("Failed to clear cache: {}", e))?;
    Ok(())
}

#[tauri::command]
pub fn resolve_icon_path_command(icon_path: String) -> Result<Option<String>, String> {
    Ok(resolve_icon_path(&icon_path))
}
