// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod services;
use commands::registry::*;
use commands::export::*;
use commands::cli::*;
use commands::logs::*;
use commands::icon_extraction::*;
use services::icon_extractor::IconExtractor;

fn main() {
    tauri::Builder::default()
        .manage(IconExtractorState::new(IconExtractor::new()))
        .invoke_handler(tauri::generate_handler![
            get_system_info,
            open_winver,
            debug_windows_version,
            get_installed_programs,
            export_programs,
            get_scan_progress,
            debug_icon_paths,
            debug_vf_apps,
            debug_vf_icons_to_file,
            extract_icon_from_path_vf,
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
            open_file_with_editor,
            extract_icon_from_path,
            extract_icon_from_exe,
            extract_icon_from_ico,
            get_icon_cache_stats,
            clear_icon_cache,
            resolve_icon_path_command,
            get_atea_information,
            open_program_files_folder
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
