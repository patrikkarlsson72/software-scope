# Product Requirements Document (PRD) - SoftwareScope

## 1. Elevator Pitch
SoftwareScope is a modern Windows software management tool designed for IT administrators. Inspired by NirSoft’s UninstallView, it provides a clear overview of all installed applications, enriched with detailed information such as registry data, uninstall commands, and custom log file paths. The goal is to simplify software auditing, troubleshooting, and program lifecycle management in enterprise environments.

## 2. Who is this app for
- **IT Administrators** who need to quickly identify installed applications across systems.
- **Support Engineers** who troubleshoot installations and require access to log files and registry details.
- **Forensics/Compliance Teams** who need detailed and exportable records of installed software.
- **Advanced Users** who want more control over their Windows environment.

## 3. Functional Requirements
- List all installed programs, updates, and system components.
- Display detailed information including:
  - Program name, publisher, version, install date, folder path
  - **Comprehensive Installation Information** ⭐ **NEW**
    - Install location and source paths
    - File size in human-readable format (KB/MB/GB)
    - Installer details and MSI information
    - Folder creation/modification dates and ownership
    - Release type and language information
  - Registry keys and associated values
  - Uninstall, modify, and quiet uninstall commands with action buttons
  - Architecture (32-bit/64-bit)
- Advanced search and filtering (publisher, date range, program type, VF deployment status).
- Export results (CSV, HTML, XML, Text).
- Support for silent/unattended uninstallation.
- Program icon display with caching.
- Add custom search paths for installation logs (user-defined folders).
- VF company filter for identifying company-deployed applications.
- **VF Log Viewer** - Integrated log viewing for VF deployment logs from `C:\Windows\VCLogs`.
- Remote scanning (planned).
- External drive scanning (planned).
- Command-line interface for automation (planned).

## 4. User Stories
- **As an IT admin**, I want to search and filter installed software so that I can quickly identify suspicious or outdated programs.
- **As an IT admin**, I want to copy uninstall strings and registry paths so that I can use them in scripts.
- **As a support engineer**, I want to define custom log folders so that I can directly access installation logs for troubleshooting.
- **As a compliance officer**, I want to export software inventories so that I can provide audit documentation.
- **As an advanced user**, I want to see both 32-bit and 64-bit applications so that I understand my system's full software footprint.
- **As a VF IT administrator**, I want to filter applications by deployment status so that I can quickly identify which applications were deployed by our company.
- **As a support engineer**, I want to view VF deployment logs directly in the application so that I can troubleshoot installations without opening cmtrace.
- **As an IT administrator**, I want to see comprehensive installation information similar to UninstallView so that I can quickly assess program details and perform management actions.
- **As a support engineer**, I want to see file sizes and installation details in a human-readable format so that I can better understand program installations.

## 5. User Interface
- **Current Layout** (to be preserved):  
  - Main program list view with icons, program details, and search/filter controls.  
  - Program details modal with collapsible sections:  
    - Basic Information  
    - **Installation Information** ⭐ **NEW** (install location, size, installer details, source paths)
    - **Folder Information** ⭐ **NEW** (creation/modification dates, ownership)
    - **Uninstall Information** (enhanced with action buttons)
    - Additional Information  
    - Advanced Details (expandable)
    - **VF Log Viewer** (for VF-deployed applications)
    - **Action Buttons** ⭐ **NEW** (Uninstall, Modify with confirmation dialogs)  
- **Design Philosophy**: Clean, modern, consistent styling using Chakra UI and React components.
- **Navigation**: Simple, with minimal menus. Primary workflow is through the searchable/filterable list of installed programs.
