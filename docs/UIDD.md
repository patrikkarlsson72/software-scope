# User Interface Design Document (UIDD) - SoftwareScope

## Layout Structure
- **Header Bar**  
  - Left: Application title *Software Scope*  
  - Right: Settings button  
- **Main Content**  
  - Title: "Installed Programs"  
  - **Clean Search Interface** ⭐ **NEW**
    - Single search bar with flexible width
    - Collapsible "Filters" button with active filter count badge
    - Results counter display
  - **Advanced Filter Panel** ⭐ **NEW** (Hidden by default)
    - Business Filters: Publisher, VF Deployment
    - Technical Filters: Program Type, Architecture
    - Installation Filters: Source, Date Range
    - Active filter chips with one-click removal
  - Sorting options (Name, Publisher, Version)  
  - Export menu (CSV, HTML, XML, Text)  
  - Program display area: Grid of program cards  
- **Program Card** ⭐ **UPDATED v1.1.7**
  - Icon (cached or fallback)  
  - Program name  
  - **Publisher** (in preview)
  - **Version** (in preview)
  - **Install date** (in preview)
  - **File size** (human-readable format) (in preview)
  - **APPID** (for VF Managed programs only) (in preview)
  - Architecture (32/64-bit) (badge)
  - VF deployment badge (purple) when applicable
  - **Note**: Install location moved to detailed view only for cleaner preview

## Core Components
- **Search Bar**: Real-time filtering of program list with flexible width.  
- **Collapsible Filter Panel** ⭐ **NEW**: 
  - Hidden by default for clean interface
  - Smart grouping into Business, Technical, and Installation categories
  - Active filter count badge on toggle button
- **Filter Chips** ⭐ **NEW**: 
  - Visual indicators for active filters
  - One-click removal for individual filters
  - "Clear All" functionality (preserves VF Managed default)
- **Sorting Controls**: Buttons for common sort keys.  
- **Program Cards**: Primary unit of display, each representing a program with VF deployment indicators.  
- **Export Button**: Dropdown with export format choices.  
- **Settings Panel**: Accessible from header.

## Program Details Modal ⭐ **ENHANCED v1.1.9**
- **Basic Information**: Program name, publisher, version, install date, installation source
- **Atea Information** ⭐ **NEW v1.1.7** (VF Managed programs only):
  - APPID, APP Reference, Script Author, App Update
  - Architecture, Date Time, Language, Manufacturer
  - Name, Revision, Version
  - Loading states and error handling
  - Copy buttons for important fields
- **Installation Information** ⭐ **ENHANCED v1.1.7**:
  - Install location with **"Open" button** for Program Files access
  - File size in human-readable format (KB/MB/GB)
  - Installer details and MSI information
  - Release type and language information
  - **Quick Access**: Opens correct Program Files folder (64-bit → C:\Program Files, 32-bit → C:\Program Files (x86))
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
- **Draggable Modal** ⭐ **NEW v1.1.8**:
  - Entire header area is draggable for repositioning
  - Visual cursor feedback (grab/move cursors)
  - Viewport constraints to keep modal accessible
  - Always starts centered when opened
  - Smooth animations when not dragging  

## Interaction Patterns
- **Search**: Typing in the search bar instantly filters results.  
- **Filter Management** ⭐ **NEW**: 
  - Click "Filters" button to expand/collapse advanced filter panel
  - Active filters display as removable chips below search bar
  - Individual filter removal via chip close buttons
  - "Clear All" button resets filters (preserves VF Managed default)
- **Filter/Sort**: Selecting filter or sort options refreshes the program grid.  
- **VF Filter**: Dropdown with options (All Applications, VF Managed, Other Apps) for company-specific filtering.  
- **Program Card Click**: Opens modal with detailed program information (collapsible sections).  
- **Modal Dragging** ⭐ **NEW v1.1.9**:
  - Click and drag anywhere on the modal header to reposition
  - Cursor changes to "grab" on hover, "move" while dragging
  - Modal constrained to stay within viewport boundaries
  - Always returns to center when reopened
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
- **Mobile/Web**: Enhanced responsive design ⭐ **NEW**
  - Filter panel stacks vertically on smaller screens
  - Flexible grid layout adapts to screen size
  - Wrapped filter elements prevent horizontal overflow
  - Touch-friendly filter chip interactions  

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
