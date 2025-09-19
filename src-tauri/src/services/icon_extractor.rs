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
    println!("🔍 resolve_icon_path called with: '{}'", icon_path);
    
    if icon_path.is_empty() {
        println!("❌ Empty icon path provided");
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
    println!("🔍 Processed path: '{}'", path);

    // Check if it's an absolute path
    if Path::new(path).is_absolute() {
        println!("🔍 Path is absolute, checking if exists: {}", path);
        if Path::new(path).exists() {
            println!("✅ Absolute path exists: {}", path);
            return Some(path.to_string());
        } else {
            println!("❌ Absolute path does not exist: {}", path);
        }
    } else {
        println!("🔍 Path is not absolute, will search in common locations");
    }

    // Try to find the file in common locations
    let common_paths = [
        r"C:\Program Files",
        r"C:\Program Files (x86)",
        r"C:\ProgramData",
        r"C:\Users\Public",
        r"C:\Windows\System32",
        r"C:\Windows",
        r"C:\Windows\SysWOW64",
        r"C:\Program Files\Common Files",
        r"C:\Program Files (x86)\Common Files",
        r"C:\Program Files\Microsoft Office",
        r"C:\Program Files (x86)\Microsoft Office",
    ];

    for base_path in &common_paths {
        if let Some(found_path) = find_file_recursive(base_path, &Path::new(path).file_name()?.to_str()?) {
            return Some(found_path);
        }
    }

    None
}

// Enhanced function to resolve icon path with VF managed app fallback
pub fn resolve_icon_path_with_vf_fallback(icon_path: &str, program_name: &str, publisher: Option<&str>, is_vf_deployed: bool) -> Option<String> {
    println!("🔍 resolve_icon_path_with_vf_fallback called for: '{}', VF: {}, icon_path: '{}'", program_name, is_vf_deployed, icon_path);
    
    // If this is a VF managed app, try Program Files scanning first (even if no registry icon path)
    if is_vf_deployed {
        println!("🔍 VF managed app '{}', scanning Program Files...", program_name);
        
        if let Some(program_files_path) = find_vf_app_executable(program_name, publisher) {
            println!("✅ Found VF app executable in Program Files: {}", program_files_path);
            return Some(program_files_path);
        } else {
            println!("❌ No VF app executable found in Program Files for: {}", program_name);
        }
    }
    
    // If we have an icon path, try standard resolution
    if !icon_path.is_empty() {
        if let Some(resolved_path) = resolve_icon_path(icon_path) {
            println!("✅ Standard resolution succeeded: {}", resolved_path);
            return Some(resolved_path);
        } else {
            println!("❌ Standard resolution failed for: {}", icon_path);
        }
    } else {
        println!("ℹ️ No icon path provided");
    }

    // If standard resolution failed and this is a VF managed app, try Program Files scanning
    if is_vf_deployed {
        println!("🔍 Registry icon path failed for VF managed app '{}', scanning Program Files...", program_name);
        
        if let Some(program_files_path) = find_vf_app_executable(program_name, publisher) {
            println!("✅ Found VF app executable in Program Files: {}", program_files_path);
            return Some(program_files_path);
        } else {
            println!("❌ No VF app executable found in Program Files for: {}", program_name);
        }
    } else {
        println!("ℹ️ Not a VF managed app, skipping Program Files scan");
    }

    None
}

// Find VF managed app executable in Program Files
fn find_vf_app_executable(program_name: &str, publisher: Option<&str>) -> Option<String> {
    println!("🔍 find_vf_app_executable called for: '{}', publisher: {:?}", program_name, publisher);
    
    let program_files_paths = vec![
        r"C:\Program Files",
        r"C:\Program Files (x86)",
    ];
    
    for program_files in program_files_paths {
        println!("🔍 Scanning directory: {}", program_files);
        if let Ok(entries) = std::fs::read_dir(program_files) {
            for entry in entries.flatten() {
                if let Some(folder_name) = entry.file_name().to_str() {
                    let folder_name_lower = folder_name.to_lowercase();
                    let program_name_lower = program_name.to_lowercase();
                    
                    // More precise matching for VF managed apps
                    let is_match = 
                        // Exact name match
                        folder_name_lower == program_name_lower ||
                        // Contains program name (but not too generic)
                        (folder_name_lower.contains(&program_name_lower) && program_name_lower.len() > 5) ||
                        // Program name contains folder name (for partial matches)
                        (program_name_lower.contains(&folder_name_lower) && folder_name_lower.len() > 5) ||
                        // Publisher match (more specific)
                        (publisher.is_some() && 
                         publisher.unwrap().len() > 3 && 
                         folder_name_lower.contains(&publisher.unwrap().to_lowercase())) ||
                        // Word-based matching (any significant word in program name matches folder)
                        program_name_lower.split_whitespace().any(|word| 
                            word.len() > 3 && folder_name_lower.contains(word) &&
                            !word.eq_ignore_ascii_case("for") &&
                            !word.eq_ignore_ascii_case("the") &&
                            !word.eq_ignore_ascii_case("and") &&
                            !word.eq_ignore_ascii_case("app") &&
                            !word.eq_ignore_ascii_case("apps")
                        );
                    
                    if is_match {
                        println!("✅ Found matching folder: {}", folder_name);
                        let full_path = entry.path().to_string_lossy().to_string();
                        
                        // Look for executable files in this folder
                        if let Some(executable_path) = find_executable_in_folder(&full_path, program_name) {
                            println!("✅ Found executable: {}", executable_path);
                            return Some(executable_path);
                        } else {
                            println!("❌ No executable found in folder: {}", full_path);
                        }
                    }
                }
            }
        } else {
            println!("❌ Failed to read directory: {}", program_files);
        }
    }
    
    println!("❌ No VF app executable found for: {}", program_name);
    None
}

// Find executable file in a folder
fn find_executable_in_folder(folder_path: &str, program_name: &str) -> Option<String> {
    println!("🔍 find_executable_in_folder called for: '{}' in '{}'", program_name, folder_path);
    
    if let Ok(entries) = std::fs::read_dir(folder_path) {
        for entry in entries.flatten() {
            if let Some(file_name) = entry.file_name().to_str() {
                let file_name_lower = file_name.to_lowercase();
                let program_name_lower = program_name.to_lowercase();
                
                // Look for executable files
                if file_name_lower.ends_with(".exe") {
                    println!("🔍 Found executable: {}", file_name);
                    
                    // More precise executable matching for VF apps
                    let is_main_executable = 
                        // Exact name match
                        file_name_lower == format!("{}.exe", program_name_lower) ||
                        // Contains program name (but not too generic)
                        (file_name_lower.contains(&program_name_lower) && program_name_lower.len() > 5) ||
                        // Word-based matching with significant words only
                        program_name_lower.split_whitespace().any(|word| 
                            word.len() > 3 && file_name_lower.contains(word) &&
                            !word.eq_ignore_ascii_case("for") &&
                            !word.eq_ignore_ascii_case("the") &&
                            !word.eq_ignore_ascii_case("and") &&
                            !word.eq_ignore_ascii_case("app") &&
                            !word.eq_ignore_ascii_case("apps")
                        ) ||
                        // Less permissive: exclude common non-main executables
                        (!file_name_lower.contains("uninstall") &&
                         !file_name_lower.contains("setup") &&
                         !file_name_lower.contains("install") &&
                         !file_name_lower.contains("update") &&
                         !file_name_lower.contains("helper") &&
                         !file_name_lower.contains("service") &&
                         !file_name_lower.contains("daemon") &&
                         !file_name_lower.contains("launcher") &&
                         !file_name_lower.contains("loader") &&
                         !file_name_lower.contains("crash") &&
                         !file_name_lower.contains("error") &&
                         !file_name_lower.contains("repair") &&
                         file_name_lower.len() > 5);
                    
                    if is_main_executable {
                        println!("✅ Found main executable: {}", file_name);
                        return Some(entry.path().to_string_lossy().to_string());
                    } else {
                        println!("ℹ️ Executable '{}' doesn't match criteria", file_name);
                    }
                }
            }
        }
    } else {
        println!("❌ Failed to read directory: {}", folder_path);
    }
    
    println!("❌ No suitable executable found in: {}", folder_path);
    None
}

fn find_file_recursive(base_path: &str, filename: &str) -> Option<String> {
    println!("🔍 Recursively searching for '{}' in '{}'", filename, base_path);
    for entry in WalkDir::new(base_path).max_depth(5) {  // Increased from 3 to 5
        if let Ok(entry) = entry {
            if entry.file_name().to_str() == Some(filename) {
                let found_path = entry.path().to_string_lossy().to_string();
                println!("✅ Found file: {}", found_path);
                return Some(found_path);
            }
        }
    }
    println!("❌ File '{}' not found in '{}'", filename, base_path);
    None
}