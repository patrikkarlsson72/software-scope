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

    // Write header
    writer.write_record(&[
        "Name",
        "Publisher",
        "Version",
        "Install Date",
        "Install Location",
        "Architecture",
        "Program Type",
        "Registry Path",
    ])?;

    // Write data
    for program in programs {
        writer.write_record(&[
            &program.name,
            program.publisher.as_deref().unwrap_or(""),
            program.version.as_deref().unwrap_or(""),
            program.install_date.as_deref().unwrap_or(""),
            program.install_location.as_deref().unwrap_or(""),
            &program.architecture,
            &program.program_type,
            &program.registry_path,
        ])?;
    }

    writer.flush()?;
    Ok(())
}

fn export_to_txt(programs: &[ProgramInfo], file_path: &str) -> Result<(), Box<dyn Error>> {
    let mut file = File::create(Path::new(file_path))?;
    
    writeln!(file, "Software Scope - Installed Programs Report")?;
    writeln!(file, "----------------------------------------\n")?;
    
    for program in programs {
        writeln!(file, "Program: {}", program.name)?;
        if let Some(publisher) = &program.publisher {
            writeln!(file, "Publisher: {}", publisher)?;
        }
        if let Some(version) = &program.version {
            writeln!(file, "Version: {}", version)?;
        }
        if let Some(install_date) = &program.install_date {
            writeln!(file, "Install Date: {}", install_date)?;
        }
        if let Some(location) = &program.install_location {
            writeln!(file, "Install Location: {}", location)?;
        }
        writeln!(file, "Architecture: {}", program.architecture)?;
        writeln!(file, "Type: {}", program.program_type)?;
        writeln!(file, "Registry Path: {}", program.registry_path)?;
        writeln!(file, "\n")?;
    }
    
    Ok(())
}

fn export_to_html(programs: &[ProgramInfo], file_path: &str) -> Result<(), Box<dyn Error>> {
    let mut file = File::create(Path::new(file_path))?;
    
    // Write HTML header
    write!(file, r#"<!DOCTYPE html>
<html>
<head>
    <title>Software Scope - Installed Programs</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 20px; }}
        table {{ border-collapse: collapse; width: 100%; }}
        th, td {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}
        th {{ background-color: #f2f2f2; }}
        tr:nth-child(even) {{ background-color: #f9f9f9; }}
    </style>
</head>
<body>
    <h1>Installed Programs Report</h1>
    <table>
        <tr>
            <th>Name</th>
            <th>Publisher</th>
            <th>Version</th>
            <th>Install Date</th>
            <th>Location</th>
            <th>Architecture</th>
            <th>Type</th>
        </tr>"#)?;

    // Write program data
    for program in programs {
        write!(file, r#"
        <tr>
            <td>{}</td>
            <td>{}</td>
            <td>{}</td>
            <td>{}</td>
            <td>{}</td>
            <td>{}</td>
            <td>{}</td>
        </tr>"#,
            program.name,
            program.publisher.as_deref().unwrap_or(""),
            program.version.as_deref().unwrap_or(""),
            program.install_date.as_deref().unwrap_or(""),
            program.install_location.as_deref().unwrap_or(""),
            program.architecture,
            program.program_type
        )?;
    }

    // Close HTML tags
    write!(file, r#"
    </table>
</body>
</html>"#)?;
    
    Ok(())
}

fn export_to_xml(programs: &[ProgramInfo], file_path: &str) -> Result<(), Box<dyn Error>> {
    let mut file = File::create(Path::new(file_path))?;
    
    writeln!(file, r#"<?xml version="1.0" encoding="UTF-8"?>"#)?;
    writeln!(file, r#"<InstalledPrograms>"#)?;
    
    for program in programs {
        writeln!(file, r#"    <Program>"#)?;
        writeln!(file, r#"        <Name>{}</Name>"#, escape_xml(&program.name))?;
        if let Some(publisher) = &program.publisher {
            writeln!(file, r#"        <Publisher>{}</Publisher>"#, escape_xml(publisher))?;
        }
        if let Some(version) = &program.version {
            writeln!(file, r#"        <Version>{}</Version>"#, escape_xml(version))?;
        }
        if let Some(install_date) = &program.install_date {
            writeln!(file, r#"        <InstallDate>{}</InstallDate>"#, install_date)?;
        }
        if let Some(location) = &program.install_location {
            writeln!(file, r#"        <InstallLocation>{}</InstallLocation>"#, escape_xml(location))?;
        }
        writeln!(file, r#"        <Architecture>{}</Architecture>"#, program.architecture)?;
        writeln!(file, r#"        <Type>{}</Type>"#, program.program_type)?;
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