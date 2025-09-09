// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
use commands::registry::*;
use commands::export::*;
use commands::cli::*;
use commands::logs::*;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_installed_programs,
            export_programs,
            get_scan_progress,
            debug_icon_paths,
            get_icon_as_base64,
            download_icon_from_url,
            test_alternative_locations,
            execute_cli_command,
            get_cli_version,
            is_cli_enabled,
            scan_vf_log_directory,
            read_log_file,
            get_log_file_info,
            copy_file_to_temp,
            open_file_with_editor
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
