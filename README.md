# Software Scope

A modern Windows software management tool built with Tauri, React, and Rust. Provides detailed insights into installed programs and their registry information.

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
  - **VF Company Filter** - Filter applications by deployment status (All/VF Deployed/Non-VF)
  - Customizable sorting

- 📊 Detailed Program Information
  - Basic program details
  - Installation information
  - Registry paths and data
  - System integration details
  - **VF deployment status** with visual indicators

### Performance & UI Features
- ⚡ **Performance Optimized**
  - Lazy loading for program icons (80-90% faster initial load)
  - Intelligent icon caching system (24-hour local, 7-day fallback)
  - Debounced search for smooth user experience
  - Intersection Observer for efficient rendering

- 🎨 **Enhanced Visual Experience**
  - Program icons with smart fallback system
  - CDN-based icons for popular applications (50+ apps supported)
  - Generic icons based on program type
  - Professional appearance with official brand icons

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
- **Performance Optimization**: Lazy loading and icon caching system
- **Fallback Icon System**: 50+ popular applications with CDN icons
- **Enhanced UI**: Professional appearance with proper program icons

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

### Upcoming Features 🔮
- Remote computer scanning
- External drive support
- Full CLI implementation
- Batch processing capabilities
- Advanced analytics and reporting

## Documentation

Comprehensive documentation is available in the [`docs/`](./docs/) directory:

- **[Documentation Overview](./docs/README.md)** - Complete documentation index
- **[VF Log Viewer Guide](./docs/VF-Log-Viewer-Guide.md)** - Detailed guide for the VF log viewing feature
- **[Product Requirements](./docs/PRD.md)** - Product requirements and user stories
- **[Technical Architecture](./docs/SRS.md)** - System design and technical specifications
- **[Development Progress](./docs/Progress.md)** - Detailed progress tracking and completed features

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## License
[License Type] - see the LICENSE file for details