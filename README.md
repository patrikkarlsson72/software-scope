# Software Scope

A modern Windows software management tool built with Tauri, React, and Rust. Provides detailed insights into installed programs and their registry information.

**Current Version: 1.2.1** - Latest update includes professional header design with logo integration, grid/list view modes, and enhanced filter functionality.

## Features

### Core Features
- 📦 Comprehensive software inventory scanning
  - 32-bit and 64-bit program detection
  - Detailed installation information
  - Registry data collection

- 🔍 Advanced search and filtering
  - Real-time search functionality
  - Publisher filtering
  - Installation date filtering
  - Program type filtering (Application/Update/System Component)
  - **VF Company Filter** - Filter applications by management status (All/VF Managed/Other Apps)
  - Customizable sorting

- 📊 Detailed Program Information
  - Basic program details (name, publisher, version, install date)
  - **Comprehensive Installation Information** ⭐ **NEW**
    - Install location and source paths
    - File size in human-readable format (KB/MB/GB)
    - Installer details and MSI information
    - Folder creation/modification dates and ownership
    - Release type and language information
  - Registry paths and data
  - System integration details
  - **VF deployment status** with visual indicators
  - **Uninstall Actions** ⭐ **NEW**
    - Uninstall, Modify, and Quiet Uninstall commands
    - Action buttons with confirmation dialogs
    - Copy functionality for all commands

### Performance & UI Features
- ⚡ **Performance Optimized**
  - Lazy loading for program icons (80-90% faster initial load)
  - Intelligent icon caching system (24-hour local, 7-day fallback)
  - Debounced search for smooth user experience
  - Intersection Observer for efficient rendering

- 🎨 **Enhanced Visual Experience**
  - **Professional Header Design**: Clean white header with integrated logo for enterprise environments
  - **Grid/List View Modes**: Toggle between card-based grid view and compact list view
  - **Smart Icon System**: Direct SVG-based icons for 15+ popular applications
  - **Intelligent Fallback**: Publisher-based matching for HP, Microsoft, and other major vendors
  - **Local Asset Icons**: High-quality SVG icons stored locally for reliability
  - **Generic Fallback**: Default window icon for unrecognized applications
  - **Performance Optimized**: Base64-encoded SVG icons for instant loading

### Export & Management
- 📤 **Multiple Export Formats**
  - CSV, HTML, XML, and Text export options
  - Quick export with default format
  - Advanced details inclusion option
  - Filtered results export

- ⚙️ **Comprehensive Settings**
  - Performance tuning options
  - Display preferences
  - Export configuration
  - Cache management with statistics

### Advanced Features
- 🖥️ **Command Line Interface (Preview)**
  - CLI foundation with mock commands
  - Future automation capabilities
  - Batch processing preparation

- 📚 **Built-in Help System**
  - Comprehensive documentation
  - Troubleshooting guides
  - Feature explanations
  - Future roadmap information

- ℹ️ **About Section** ⭐ **NEW**
  - Accessible from header with dedicated About button
  - Displays app version, build date, and technology stack
  - Dynamic version reading from package.json
  - Copyright notice and project information

- 📋 **VF Log Viewer** ⭐ **NEW**
  - Integrated VF deployment log viewer
  - Direct access to `C:\Windows\VCLogs` directory
  - Smart log file detection and program name extraction
  - Advanced filtering and search capabilities
  - Syntax highlighting for log content
  - No more dependency on cmtrace!

### Additional Features
- 📋 Copy functionality for paths and commands
- 🎯 Collapsible information sections
- 📁 Advanced program details view
- 💻 Architecture detection (32/64-bit)
- 🔧 Icon debugging and cache management tools

## Getting Started

### Prerequisites
- Node.js (v16 or later)
- Rust (latest stable)
- Windows OS

### Installation
1. Clone the repository
git clone https://github.com/yourusername/software-scope.git
cd software-scope


2. Install dependencies
npm install

3. Run the development server
npm run tauri dev


## Development

### Tech Stack
- Frontend: React, TypeScript, Chakra UI
- Backend: Rust, Tauri
- Build: Vite

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build production version
- `npm run tauri dev` - Start Tauri development
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier

## Current Status
The project is in active development. Recent major updates include:

### Phase 3 Completed ✅
- **Smart Icon System**: Direct SVG-based icons for popular applications
- **Local Asset Management**: 15+ high-quality SVG icons stored locally
- **Intelligent Matching**: Publisher-based and keyword-based icon matching
- **Performance Optimization**: Base64-encoded icons with caching system

### Phase 4 Completed ✅
- **VF Company Filter**: Filter applications by deployment status with visual indicators
- **Registry Integration**: Scans HKLM/SOFTWARE/Atea/Applications for VF-deployed applications
- **Enhanced UI**: Purple badges for VF-deployed applications, integrated filter system

### Phase 5 Completed ✅
- **Comprehensive Settings Panel**: Performance, display, export, and CLI settings
- **CLI Foundation**: Command-line interface preview with mock commands
- **Help System**: Built-in documentation and troubleshooting guides
- **Settings Integration**: Application-wide settings management

### Phase 6 Completed ✅ ⭐ **NEW**
- **VF Log Viewer Integration**: Complete log viewing solution for VF deployments
- **Log File Management**: Smart scanning and filtering of VF deployment logs
- **Enhanced Program Details**: Direct log access from program information
- **Performance Optimized**: Efficient handling of large log files

### Phase 7 Completed ✅ ⭐ **NEW**
- **Comprehensive Installation Information**: Enhanced program details similar to UninstallView
- **Installation Information Section**: Shows install location, size, installer details, and source paths
- **Folder Information**: Displays folder creation/modification dates and ownership details
- **Enhanced Uninstall Actions**: Uninstall, Modify, and Quiet Uninstall buttons with confirmation dialogs
- **Human-Readable File Sizes**: Automatic conversion from KB to MB/GB with proper formatting
- **Improved Program Cards**: Enhanced list view with size display and install location preview

### Upcoming Features 🔮
- Remote computer scanning
- External drive support
- Full CLI implementation
- Batch processing capabilities
- Advanced analytics and reporting

## Documentation

## Recent Updates

### Version 1.2.1 (Latest)
- **Professional Header Design with Logo Integration**
  - Clean white header background for enterprise environments
  - Integrated Software Scope logo with proper contrast
  - Updated button styling for new header theme
  - Enhanced professional appearance for IT administrators

- **Grid/List View Modes**
  - Toggle between card-based grid view and compact list view
  - Grid view: Traditional card layout with detailed information
  - List view: Compact horizontal layout for efficient scanning
  - View mode preference integration with settings

- **Enhanced Filter Functionality**
  - Fixed "Clear All" button to properly clear all filters including VF deployment
  - Improved filter chip management and removal
  - Consistent filter clearing behavior across all filter types

### Version 1.2.0
- **Added comprehensive About section with dynamic version display**
- About dialog accessible from header with app information
- Dynamic version reading from package.json at build time
- Updated copyright year to 2025
- Fixed TypeScript build errors for MSI generation

### Version 1.1.9
- **Added draggable modal functionality for program details**
- Fixed VF Log Viewer mouse wheel scrolling issues
- Enhanced modal positioning and viewport constraints
- Improved user experience with visual cursor feedback

### Version 1.1.5
- **Fixed VF Managed applications not showing install location and shortcuts**
- Enhanced install location detection with flexible matching patterns
- Added specialized VF Managed application detection methods
- Improved shortcut scanning for all applications
- Added comprehensive debug logging for troubleshooting

### Previous Versions
- **1.1.4**: Previous stable version
- **1.1.3**: Previous version
- **1.1.2**: Previous version
- **1.1.1**: Previous version
- **1.1.0**: Previous version

## Documentation

Comprehensive documentation is available in the [`docs/`](./docs/) directory:

- **[Documentation Overview](./docs/README.md)** - Complete documentation index
- **[MSI Build Guide](./docs/MSI-Build-Guide.md)** - Step-by-step guide for creating new MSI versions
- **[Icon System Guide](./docs/Icon-System-Guide.md)** - Comprehensive guide for the icon system architecture and usage
- **[VF Log Viewer Guide](./docs/VF-Log-Viewer-Guide.md)** - Detailed guide for the VF log viewing feature
- **[VF Company Filter](./docs/VF-Company-Filter.md)** - VF-specific application filtering and management
- **[Product Requirements](./docs/PRD.md)** - Product requirements and user stories
- **[Technical Architecture](./docs/SRS.md)** - System design and technical specifications
- **[Development Progress](./docs/Progress.md)** - Detailed progress tracking and completed features

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## License
[License Type] - see the LICENSE file for details