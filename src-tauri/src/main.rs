// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
use commands::registry::*;
use commands::export::*;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_installed_programs,
            export_programs,
            get_scan_progress,
            debug_icon_paths,
            get_icon_as_base64,
            download_icon_from_url
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
