# User Interface Design Document (UIDD) - SoftwareScope

## Layout Structure
- **Header Bar**  
  - Left: Application title *Software Scope*  
  - Right: Settings button  
- **Main Content**  
  - Title: "Installed Programs"  
  - Search bar for program names  
  - Filter dropdowns (Publisher, Program Type, Time Range, VF Deployment)  
  - Sorting options (Name, Publisher, Version)  
  - Export menu (CSV, HTML, XML, Text)  
  - Program display area: Grid of program cards  
- **Program Card**  
  - Icon (cached or fallback)  
  - Program name  
  - Publisher  
  - Version  
  - Install date  
  - **File size** (human-readable format) ⭐ **NEW**
  - **Install location** (with folder icon) ⭐ **NEW**
  - Architecture (32/64-bit)
  - VF deployment badge (purple) when applicable

## Core Components
- **Search Bar**: Real-time filtering of program list.  
- **Filter Controls**: Dropdowns for publisher, type, time, and VF deployment status.  
- **Sorting Controls**: Buttons for common sort keys.  
- **Program Cards**: Primary unit of display, each representing a program with VF deployment indicators.  
- **Export Button**: Dropdown with export format choices.  
- **Settings Panel**: Accessible from header.

## Program Details Modal ⭐ **ENHANCED**
- **Basic Information**: Program name, publisher, version, install date, installation source
- **Installation Information** ⭐ **NEW**:
  - Install location and source paths
  - File size in human-readable format (KB/MB/GB)
  - Installer details and MSI information
  - Release type and language information
- **Folder Information** ⭐ **NEW**:
  - Folder creation and modification dates
  - Folder ownership information
- **Uninstall Information** ⭐ **ENHANCED**:
  - Uninstall, Modify, and Quiet Uninstall commands
  - Action buttons with confirmation dialogs
  - Copy functionality for all commands
- **Additional Information**: Comments, URLs, registry details
- **Advanced Details**: Expandable section with technical information
- **VF Log Viewer**: For VF-deployed applications
- **Action Buttons** ⭐ **NEW**: Uninstall and Modify buttons with confirmation dialogs  

## Interaction Patterns
- **Search**: Typing in the search bar instantly filters results.  
- **Filter/Sort**: Selecting filter or sort options refreshes the program grid.  
- **VF Filter**: Dropdown with options (All Applications, VF Managed, Other Apps) for company-specific filtering.  
- **Program Card Click**: Opens modal with detailed program information (collapsible sections).  
- **Export**: Clicking export menu prompts file download.  
- **Settings**: Opens configuration panel (e.g., cache, log folders).  

## Visual Design Elements & Color Scheme
- **Overall Style**: Clean, minimal, Windows-inspired.  
- **Color Palette**:  
  - Header: Dark/navy blue (Windows 11 style)  
  - Background: Light gray/white for contrast  
  - Cards: White with subtle shadow and rounded corners  
  - Buttons: Neutral gray with hover states  
  - Accent: Brighter blue for primary actions  
  - VF Badge: Purple for VF-deployed applications  
- **Icons**: Program icons displayed when available, fallback generic icon if missing.  

## Mobile, Web App, Desktop Considerations
- **Primary Platform**: Desktop (Windows).  
- **Desktop Focus**: Optimized for large program lists, responsive resizing of card grid.  
- **Mobile/Web**: Not prioritized but design is responsive; grid adapts to 1–2 cards per row.  

## Typography
- **Primary Font**: System font stack (Segoe UI for Windows).  
- **Headings**: Bold, slightly larger for hierarchy.  
- **Body Text**: Medium weight, standard size for readability.  
- **Consistency**: Clear distinction between headings, metadata, and values.  

## Accessibility
- **Keyboard Navigation**: Full navigation via tab and arrow keys.  
- **Color Contrast**: Meets WCAG AA standard (dark text on light backgrounds).  
- **Screen Reader Support**: Program cards and modals provide descriptive labels.  
- **Hover/Focus States**: Clear indication of interactivity.  
