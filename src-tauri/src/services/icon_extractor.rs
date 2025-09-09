use std::path::Path;
use std::fs;
use std::collections::HashMap;
use serde::{Serialize, Deserialize};
use windows_icons::get_icon_base64_by_path;
use walkdir::WalkDir;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ExtractedIcon {
    pub data: String,        // Base64 encoded image data
    pub format: String,      // "png", "ico", etc.
    pub size: u32,          // Icon size (width/height)
    pub source: String,     // Source file path
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct IconCache {
    pub icons: HashMap<String, ExtractedIcon>,
    pub last_updated: String,
}

impl IconCache {
    pub fn new() -> Self {
        Self {
            icons: HashMap::new(),
            last_updated: chrono::Utc::now().to_rfc3339(),
        }
    }

    pub fn get(&self, key: &str) -> Option<&ExtractedIcon> {
        self.icons.get(key)
    }

    pub fn set(&mut self, key: String, icon: ExtractedIcon) {
        self.icons.insert(key, icon);
        self.last_updated = chrono::Utc::now().to_rfc3339();
    }

    pub fn save_to_file(&self, path: &str) -> Result<(), Box<dyn std::error::Error>> {
        let json = serde_json::to_string_pretty(self)?;
        fs::write(path, json)?;
        Ok(())
    }

    pub fn load_from_file(path: &str) -> Result<Self, Box<dyn std::error::Error>> {
        if Path::new(path).exists() {
            let content = fs::read_to_string(path)?;
            let cache: IconCache = serde_json::from_str(&content)?;
            Ok(cache)
        } else {
            Ok(IconCache::new())
        }
    }
}

pub struct IconExtractor {
    cache: IconCache,
    cache_path: String,
}

impl IconExtractor {
    pub fn new() -> Self {
        let cache_path = "icon_cache.json".to_string();
        let cache = IconCache::load_from_file(&cache_path).unwrap_or_else(|_| IconCache::new());
        
        Self {
            cache,
            cache_path,
        }
    }

    pub fn extract_icon_from_exe(&mut self, exe_path: &str, preferred_size: u32) -> Result<ExtractedIcon, Box<dyn std::error::Error>> {
        // Create cache key based on file path and modification time
        let cache_key = self.create_cache_key(exe_path)?;
        
        // Check cache first
        if let Some(cached_icon) = self.cache.get(&cache_key) {
            return Ok(cached_icon.clone());
        }

        // Extract icon from executable
        let icon = self.extract_from_executable(exe_path, preferred_size)?;
        
        // Cache the result
        self.cache.set(cache_key, icon.clone());
        self.save_cache()?;
        
        Ok(icon)
    }

    pub fn extract_icon_from_ico(&mut self, ico_path: &str, preferred_size: u32) -> Result<ExtractedIcon, Box<dyn std::error::Error>> {
        // Create cache key
        let cache_key = self.create_cache_key(ico_path)?;
        
        // Check cache first
        if let Some(cached_icon) = self.cache.get(&cache_key) {
            return Ok(cached_icon.clone());
        }

        // Extract icon from .ico file
        let icon = self.extract_from_ico_file(ico_path, preferred_size)?;
        
        // Cache the result
        self.cache.set(cache_key, icon.clone());
        self.save_cache()?;
        
        Ok(icon)
    }

    fn create_cache_key(&self, file_path: &str) -> Result<String, Box<dyn std::error::Error>> {
        let metadata = fs::metadata(file_path)?;
        let modified = metadata.modified()?;
        let modified_secs = modified.duration_since(std::time::UNIX_EPOCH)?.as_secs();
        Ok(format!("{}:{}", file_path, modified_secs))
    }

    fn extract_from_executable(&self, exe_path: &str, preferred_size: u32) -> Result<ExtractedIcon, Box<dyn std::error::Error>> {
        // Use the windows-icons crate to extract icon from executable
        let base64_data = get_icon_base64_by_path(exe_path)?;
        
        Ok(ExtractedIcon {
            data: format!("data:image/png;base64,{}", base64_data),
            format: "png".to_string(),
            size: preferred_size, // The windows-icons crate handles size selection internally
            source: exe_path.to_string(),
        })
    }

    fn extract_from_ico_file(&self, ico_path: &str, preferred_size: u32) -> Result<ExtractedIcon, Box<dyn std::error::Error>> {
        // Use the windows-icons crate to extract icon from .ico file
        let base64_data = get_icon_base64_by_path(ico_path)?;
        
        Ok(ExtractedIcon {
            data: format!("data:image/png;base64,{}", base64_data),
            format: "png".to_string(),
            size: preferred_size,
            source: ico_path.to_string(),
        })
    }


    fn save_cache(&self) -> Result<(), Box<dyn std::error::Error>> {
        self.cache.save_to_file(&self.cache_path)
    }

    pub fn clear_cache(&mut self) -> Result<(), Box<dyn std::error::Error>> {
        self.cache = IconCache::new();
        if Path::new(&self.cache_path).exists() {
            fs::remove_file(&self.cache_path)?;
        }
        Ok(())
    }

    pub fn get_cache_stats(&self) -> (usize, String) {
        (self.cache.icons.len(), self.cache.last_updated.clone())
    }
}

// Helper function to find executable path from registry icon path
pub fn resolve_icon_path(icon_path: &str) -> Option<String> {
    if icon_path.is_empty() {
        return None;
    }

    // Handle different icon path formats
    let path = if icon_path.contains(',') {
        // Format: "C:\path\to\file.exe,0" or "C:\path\to\file.exe,1"
        icon_path.split(',').next().unwrap_or("").trim()
    } else {
        icon_path.trim()
    };

    // Remove quotes if present
    let path = path.trim_matches('"');

    // Check if it's an absolute path
    if Path::new(path).is_absolute() {
        if Path::new(path).exists() {
            return Some(path.to_string());
        }
    }

    // Try to find the file in common locations
    let common_paths = [
        r"C:\Program Files",
        r"C:\Program Files (x86)",
        r"C:\Windows\System32",
        r"C:\Windows",
    ];

    for base_path in &common_paths {
        if let Some(found_path) = find_file_recursive(base_path, &Path::new(path).file_name()?.to_str()?) {
            return Some(found_path);
        }
    }

    None
}

fn find_file_recursive(base_path: &str, filename: &str) -> Option<String> {
    for entry in WalkDir::new(base_path).max_depth(3) {
        if let Ok(entry) = entry {
            if entry.file_name().to_str() == Some(filename) {
                return Some(entry.path().to_string_lossy().to_string());
            }
        }
    }
    None
}
