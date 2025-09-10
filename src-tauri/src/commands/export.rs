use serde::{Serialize, Deserialize};
use crate::commands::registry::ProgramInfo;
use std::error::Error;
use std::fs::File;
use std::path::Path;
use std::io::Write;

#[derive(Debug, Serialize, Deserialize)]
pub enum ExportFormat {
    CSV,
    HTML,
    XML,
    TXT
}

fn export_to_csv(programs: &[ProgramInfo], file_path: &str) -> Result<(), Box<dyn Error>> {
    let file = File::create(Path::new(file_path))?;
    let mut writer = csv::Writer::from_writer(file);

    // Write header with all available fields
    writer.write_record(&[
        "Name",
        "Registry Name",
        "Publisher",
        "Version",
        "Registry Time",
        "Install Date",
        "Installed For",
        "Install Location",
        "Install Source",
        "Uninstall String",
        "Change Install String",
        "Quiet Uninstall String",
        "Comments",
        "About URL",
        "Update Info URL",
        "Help Link",
        "Install Source Path",
        "Installer Name",
        "Release Type",
        "Icon Path",
        "MSI Filename",
        "Estimated Size",
        "Attributes",
        "Language",
        "Parent Key Name",
        "Registry Path",
        "Program Type",
        "Is Windows Installer",
        "Architecture",
        "Installation Source",
        "Is VF Managed",
    ])?;

    // Write data
    for program in programs {
        writer.write_record(&[
            &program.name,
            &program.registry_name,
            program.publisher.as_deref().unwrap_or(""),
            program.version.as_deref().unwrap_or(""),
            program.registry_time.as_deref().unwrap_or(""),
            program.install_date.as_deref().unwrap_or(""),
            program.installed_for.as_deref().unwrap_or(""),
            program.install_location.as_deref().unwrap_or(""),
            program.install_source.as_deref().unwrap_or(""),
            program.uninstall_string.as_deref().unwrap_or(""),
            program.change_install_string.as_deref().unwrap_or(""),
            program.quiet_uninstall_string.as_deref().unwrap_or(""),
            program.comments.as_deref().unwrap_or(""),
            program.about_url.as_deref().unwrap_or(""),
            program.update_info_url.as_deref().unwrap_or(""),
            program.help_link.as_deref().unwrap_or(""),
            program.install_source_path.as_deref().unwrap_or(""),
            program.installer_name.as_deref().unwrap_or(""),
            program.release_type.as_deref().unwrap_or(""),
            program.icon_path.as_deref().unwrap_or(""),
            program.msi_filename.as_deref().unwrap_or(""),
            program.estimated_size.map(|s| s.to_string()).as_deref().unwrap_or(""),
            program.attributes.as_deref().unwrap_or(""),
            program.language.as_deref().unwrap_or(""),
            program.parent_key_name.as_deref().unwrap_or(""),
            &program.registry_path,
            &program.program_type,
            &program.is_windows_installer.to_string(),
            &program.architecture,
            &program.installation_source,
            &program.is_vf_deployed.to_string(),
        ])?;
    }

    writer.flush()?;
    Ok(())
}

fn export_to_txt(programs: &[ProgramInfo], file_path: &str) -> Result<(), Box<dyn Error>> {
    let mut file = File::create(Path::new(file_path))?;
    
    writeln!(file, "Software Scope - Installed Programs Report")?;
    writeln!(file, "Generated on: {}", chrono::Utc::now().format("%Y-%m-%d %H:%M:%S UTC"))?;
    writeln!(file, "Total Programs: {}", programs.len())?;
    writeln!(file, "========================================\n")?;
    
    for (index, program) in programs.iter().enumerate() {
        writeln!(file, "Program #{}: {}", index + 1, program.name)?;
        writeln!(file, "Registry Name: {}", program.registry_name)?;
        if let Some(publisher) = &program.publisher {
            writeln!(file, "Publisher: {}", publisher)?;
        }
        if let Some(version) = &program.version {
            writeln!(file, "Version: {}", version)?;
        }
        if let Some(registry_time) = &program.registry_time {
            writeln!(file, "Registry Time: {}", registry_time)?;
        }
        if let Some(install_date) = &program.install_date {
            writeln!(file, "Install Date: {}", install_date)?;
        }
        if let Some(installed_for) = &program.installed_for {
            writeln!(file, "Installed For: {}", installed_for)?;
        }
        if let Some(location) = &program.install_location {
            writeln!(file, "Install Location: {}", location)?;
        }
        if let Some(install_source) = &program.install_source {
            writeln!(file, "Install Source: {}", install_source)?;
        }
        if let Some(uninstall_string) = &program.uninstall_string {
            writeln!(file, "Uninstall String: {}", uninstall_string)?;
        }
        if let Some(quiet_uninstall_string) = &program.quiet_uninstall_string {
            writeln!(file, "Quiet Uninstall String: {}", quiet_uninstall_string)?;
        }
        if let Some(comments) = &program.comments {
            writeln!(file, "Comments: {}", comments)?;
        }
        if let Some(icon_path) = &program.icon_path {
            writeln!(file, "Icon Path: {}", icon_path)?;
        }
        if let Some(estimated_size) = &program.estimated_size {
            writeln!(file, "Estimated Size: {} bytes", estimated_size)?;
        }
        if let Some(language) = &program.language {
            writeln!(file, "Language: {}", language)?;
        }
        writeln!(file, "Architecture: {}", program.architecture)?;
        writeln!(file, "Program Type: {}", program.program_type)?;
        writeln!(file, "Is Windows Installer: {}", program.is_windows_installer)?;
        writeln!(file, "Installation Source: {}", program.installation_source)?;
        writeln!(file, "Is VF Managed: {}", program.is_vf_deployed)?;
        writeln!(file, "Registry Path: {}", program.registry_path)?;
        writeln!(file, "\n{}", "=".repeat(50))?;
        writeln!(file)?;
    }
    
    Ok(())
}

fn export_to_html(programs: &[ProgramInfo], file_path: &str) -> Result<(), Box<dyn Error>> {
    let mut file = File::create(Path::new(file_path))?;
    
    // Write HTML header with improved styling
    write!(file, r#"<!DOCTYPE html>
<html>
<head>
    <title>Software Scope - Installed Programs Report</title>
    <meta charset="UTF-8">
    <style>
        body {{ 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 20px; 
            background-color: #f5f5f5;
        }}
        .container {{
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }}
        h1 {{ 
            color: #2c3e50; 
            border-bottom: 3px solid #3498db; 
            padding-bottom: 10px;
        }}
        .summary {{
            background-color: #ecf0f1;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
        }}
        table {{ 
            border-collapse: collapse; 
            width: 100%; 
            margin-top: 20px;
        }}
        th, td {{ 
            border: 1px solid #ddd; 
            padding: 12px; 
            text-align: left; 
        }}
        th {{ 
            background-color: #3498db; 
            color: white;
            font-weight: bold;
        }}
        tr:nth-child(even) {{ 
            background-color: #f9f9f9; 
        }}
        tr:hover {{
            background-color: #e8f4f8;
        }}
        .program-type {{
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8em;
            font-weight: bold;
        }}
        .type-application {{ background-color: #2ecc71; color: white; }}
        .type-system {{ background-color: #e74c3c; color: white; }}
        .type-update {{ background-color: #f39c12; color: white; }}
        .type-unknown {{ background-color: #95a5a6; color: white; }}
    </style>
</head>
<body>
    <div class="container">
        <h1>Software Scope - Installed Programs Report</h1>
        <div class="summary">
            <strong>Generated:</strong> {}<br>
            <strong>Total Programs:</strong> {}<br>
            <strong>Applications:</strong> {}<br>
            <strong>System Components:</strong> {}<br>
            <strong>Updates:</strong> {}
        </div>
        <table>
            <tr>
                <th>Name</th>
                <th>Publisher</th>
                <th>Version</th>
                <th>Install Date</th>
                <th>Install Location</th>
                <th>Architecture</th>
                <th>Type</th>
                <th>Installation Source</th>
                <th>VF Managed</th>
                <th>Size</th>
            </tr>"#,
        chrono::Utc::now().format("%Y-%m-%d %H:%M:%S UTC"),
        programs.len(),
        programs.iter().filter(|p| p.program_type == "Application").count(),
        programs.iter().filter(|p| p.program_type == "SystemComponent").count(),
        programs.iter().filter(|p| p.program_type == "Update").count()
    )?;

    // Write program data
    for program in programs {
        let type_class = match program.program_type.as_str() {
            "Application" => "type-application",
            "SystemComponent" => "type-system", 
            "Update" => "type-update",
            _ => "type-unknown"
        };
        
        let size_display = if let Some(size) = program.estimated_size {
            if size > 1024 * 1024 {
                format!("{:.1} MB", size as f64 / (1024.0 * 1024.0))
            } else if size > 1024 {
                format!("{:.1} KB", size as f64 / 1024.0)
            } else {
                format!("{} B", size)
            }
        } else {
            "Unknown".to_string()
        };

        let vf_deployed_display = if program.is_vf_deployed {
            "<span style=\"color: #8B5CF6; font-weight: bold;\">Yes</span>"
        } else {
            "No"
        };

        write!(file, r#"
        <tr>
            <td><strong>{}</strong></td>
            <td>{}</td>
            <td>{}</td>
            <td>{}</td>
            <td>{}</td>
            <td>{}</td>
            <td><span class="program-type {}">{}</span></td>
            <td>{}</td>
            <td>{}</td>
            <td>{}</td>
        </tr>"#,
            escape_html(&program.name),
            escape_html(program.publisher.as_deref().unwrap_or("")),
            escape_html(program.version.as_deref().unwrap_or("")),
            escape_html(program.install_date.as_deref().unwrap_or("")),
            escape_html(program.install_location.as_deref().unwrap_or("")),
            program.architecture,
            type_class,
            program.program_type,
            program.installation_source,
            vf_deployed_display,
            size_display
        )?;
    }

    // Close HTML tags
    write!(file, r#"
        </table>
    </div>
</body>
</html>"#)?;
    
    Ok(())
}

fn export_to_xml(programs: &[ProgramInfo], file_path: &str) -> Result<(), Box<dyn Error>> {
    let mut file = File::create(Path::new(file_path))?;
    
    writeln!(file, r#"<?xml version="1.0" encoding="UTF-8"?>"#)?;
    writeln!(file, r#"<InstalledPrograms generated="{}" total="{}">"#, 
        chrono::Utc::now().format("%Y-%m-%d %H:%M:%S UTC"), programs.len())?;
    
    for program in programs {
        writeln!(file, r#"    <Program>"#)?;
        writeln!(file, r#"        <Name>{}</Name>"#, escape_xml(&program.name))?;
        writeln!(file, r#"        <RegistryName>{}</RegistryName>"#, escape_xml(&program.registry_name))?;
        if let Some(publisher) = &program.publisher {
            writeln!(file, r#"        <Publisher>{}</Publisher>"#, escape_xml(publisher))?;
        }
        if let Some(version) = &program.version {
            writeln!(file, r#"        <Version>{}</Version>"#, escape_xml(version))?;
        }
        if let Some(registry_time) = &program.registry_time {
            writeln!(file, r#"        <RegistryTime>{}</RegistryTime>"#, escape_xml(registry_time))?;
        }
        if let Some(install_date) = &program.install_date {
            writeln!(file, r#"        <InstallDate>{}</InstallDate>"#, escape_xml(install_date))?;
        }
        if let Some(installed_for) = &program.installed_for {
            writeln!(file, r#"        <InstalledFor>{}</InstalledFor>"#, escape_xml(installed_for))?;
        }
        if let Some(location) = &program.install_location {
            writeln!(file, r#"        <InstallLocation>{}</InstallLocation>"#, escape_xml(location))?;
        }
        if let Some(install_source) = &program.install_source {
            writeln!(file, r#"        <InstallSource>{}</InstallSource>"#, escape_xml(install_source))?;
        }
        if let Some(uninstall_string) = &program.uninstall_string {
            writeln!(file, r#"        <UninstallString>{}</UninstallString>"#, escape_xml(uninstall_string))?;
        }
        if let Some(change_install_string) = &program.change_install_string {
            writeln!(file, r#"        <ChangeInstallString>{}</ChangeInstallString>"#, escape_xml(change_install_string))?;
        }
        if let Some(quiet_uninstall_string) = &program.quiet_uninstall_string {
            writeln!(file, r#"        <QuietUninstallString>{}</QuietUninstallString>"#, escape_xml(quiet_uninstall_string))?;
        }
        if let Some(comments) = &program.comments {
            writeln!(file, r#"        <Comments>{}</Comments>"#, escape_xml(comments))?;
        }
        if let Some(about_url) = &program.about_url {
            writeln!(file, r#"        <AboutURL>{}</AboutURL>"#, escape_xml(about_url))?;
        }
        if let Some(update_info_url) = &program.update_info_url {
            writeln!(file, r#"        <UpdateInfoURL>{}</UpdateInfoURL>"#, escape_xml(update_info_url))?;
        }
        if let Some(help_link) = &program.help_link {
            writeln!(file, r#"        <HelpLink>{}</HelpLink>"#, escape_xml(help_link))?;
        }
        if let Some(install_source_path) = &program.install_source_path {
            writeln!(file, r#"        <InstallSourcePath>{}</InstallSourcePath>"#, escape_xml(install_source_path))?;
        }
        if let Some(installer_name) = &program.installer_name {
            writeln!(file, r#"        <InstallerName>{}</InstallerName>"#, escape_xml(installer_name))?;
        }
        if let Some(release_type) = &program.release_type {
            writeln!(file, r#"        <ReleaseType>{}</ReleaseType>"#, escape_xml(release_type))?;
        }
        if let Some(icon_path) = &program.icon_path {
            writeln!(file, r#"        <IconPath>{}</IconPath>"#, escape_xml(icon_path))?;
        }
        if let Some(msi_filename) = &program.msi_filename {
            writeln!(file, r#"        <MSIFilename>{}</MSIFilename>"#, escape_xml(msi_filename))?;
        }
        if let Some(estimated_size) = &program.estimated_size {
            writeln!(file, r#"        <EstimatedSize>{}</EstimatedSize>"#, estimated_size)?;
        }
        if let Some(attributes) = &program.attributes {
            writeln!(file, r#"        <Attributes>{}</Attributes>"#, escape_xml(attributes))?;
        }
        if let Some(language) = &program.language {
            writeln!(file, r#"        <Language>{}</Language>"#, escape_xml(language))?;
        }
        if let Some(parent_key_name) = &program.parent_key_name {
            writeln!(file, r#"        <ParentKeyName>{}</ParentKeyName>"#, escape_xml(parent_key_name))?;
        }
        writeln!(file, r#"        <Architecture>{}</Architecture>"#, escape_xml(&program.architecture))?;
        writeln!(file, r#"        <ProgramType>{}</ProgramType>"#, escape_xml(&program.program_type))?;
        writeln!(file, r#"        <IsWindowsInstaller>{}</IsWindowsInstaller>"#, program.is_windows_installer)?;
        writeln!(file, r#"        <InstallationSource>{}</InstallationSource>"#, escape_xml(&program.installation_source))?;
        writeln!(file, r#"        <IsVFDeployed>{}</IsVFDeployed>"#, program.is_vf_deployed)?;
        writeln!(file, r#"        <RegistryPath>{}</RegistryPath>"#, escape_xml(&program.registry_path))?;
        writeln!(file, r#"    </Program>"#)?;
    }
    
    writeln!(file, r#"</InstalledPrograms>"#)?;
    Ok(())
}

// Helper function for XML escaping
fn escape_xml(s: &str) -> String {
    s.replace("&", "&amp;")
     .replace("\"", "&quot;")
     .replace("'", "&apos;")
     .replace("<", "&lt;")
     .replace(">", "&gt;")
}

// Helper function for HTML escaping
fn escape_html(s: &str) -> String {
    s.replace("&", "&amp;")
     .replace("\"", "&quot;")
     .replace("'", "&#x27;")
     .replace("<", "&lt;")
     .replace(">", "&gt;")
}

#[tauri::command]
pub async fn export_programs(
    programs: Vec<ProgramInfo>,
    format: ExportFormat,
    file_path: String
) -> Result<(), String> {
    match format {
        ExportFormat::CSV => export_to_csv(&programs, &file_path),
        ExportFormat::HTML => export_to_html(&programs, &file_path),
        ExportFormat::XML => export_to_xml(&programs, &file_path),
        ExportFormat::TXT => export_to_txt(&programs, &file_path),
    }.map_err(|e| e.to_string())
} 