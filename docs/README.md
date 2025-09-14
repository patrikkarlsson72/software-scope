# Software Scope Documentation

Welcome to the Software Scope documentation. This directory contains comprehensive documentation for the Software Scope application, a modern Windows software management tool designed for IT administrators.

## 📚 Documentation Overview

### Core Documentation
- **[Product Requirements Document (PRD)](./PRD.md)** - High-level product requirements and user stories
- **[Software Requirements Specification (SRS)](./SRS.md)** - Technical architecture and system design
- **[Project Plan](./ProjectPlan.md)** - Development roadmap and milestones
- **[Progress](./Progress.md)** - Detailed development progress and completed features

### Feature Documentation
- **[Icon System Guide](./Icon-System-Guide.md)** - Comprehensive guide for the icon system architecture and usage
- **[VF Log Viewer Guide](./VF-Log-Viewer-Guide.md)** - Comprehensive guide for the VF log viewing feature
- **[Export Testing Guide](./Export-Testing-Guide.md)** - Testing procedures for export functionality
- **[User Interface Design Document (UIDD)](./UIDD.md)** - UI/UX design specifications

### Feature Specifications
- **[Wanted Features](./WantedFeatures.md)** - Complete list of planned and implemented features

## 🚀 Quick Start

### For Users
1. **Getting Started**: See the main [README](../README.md) for installation and basic usage
2. **VF Log Viewer**: Check the [VF Log Viewer Guide](./VF-Log-Viewer-Guide.md) for detailed log viewing instructions
3. **Settings**: Configure the application through the Settings panel

### For Developers
1. **Architecture**: Review the [SRS](./SRS.md) for system design and technical stack
2. **Development**: Check [Progress](./Progress.md) for current development status
3. **Features**: See [Wanted Features](./WantedFeatures.md) for planned functionality

## 📋 Current Status

### ✅ Completed Phases
- **Phase 1**: Basic program scanning and UI
- **Phase 2**: Enhanced program details and registry information
- **Phase 3**: Icon support and performance optimization
- **Phase 4**: Alternative installation support (portable apps, user installations)
- **Phase 5**: VF company filter and deployment status detection
- **Phase 6**: VF Log Viewer integration ⭐ **NEW**
- **Phase 7**: Comprehensive Installation Information ⭐ **NEW**

### 🚧 In Progress
- **Phase 8**: Advanced features (remote scanning, CLI implementation)

### 🔮 Planned Features
- Remote computer scanning
- External drive support
- Full CLI implementation
- Advanced export features
- Enhanced VF-specific functionality

## 🎯 Key Features

### Core Functionality
- **Comprehensive Software Inventory**: Scan and list all installed programs
- **Advanced Filtering**: Filter by publisher, date, type, and VF deployment status
- **Dual View Modes** ⭐ **NEW**: Toggle between Grid and List views for different use cases
- **Detailed Program Information**: Registry data, installation details, uninstall commands
- **Comprehensive Installation Information** ⭐ **NEW**: Install location, size, installer details, folder metadata
- **UninstallView-Style Interface** ⭐ **NEW**: Action buttons, command display, comprehensive installation details
- **Export Capabilities**: Multiple format support (CSV, HTML, XML, Text)

### VF-Specific Features
- **VF Deployment Detection**: Automatically identify VF-deployed applications
- **VF Log Viewer**: Integrated log viewing for deployment troubleshooting
- **Company Filter**: Filter applications by deployment status
- **Visual Indicators**: Clear badges and indicators for VF-deployed programs

### Performance & UI
- **Optimized Performance**: Lazy loading, icon caching, efficient rendering
- **Professional UI**: Modern design with Chakra UI components
- **Dual View Modes** ⭐ **NEW**:
  - **Grid View**: Card-based layout for detailed information browsing
  - **List View**: Compact horizontal layout for efficient scanning
  - Instant switching between view modes
  - Settings integration for default view preference
- **Responsive Design**: Works across different screen sizes
- **Accessibility**: Keyboard navigation and screen reader support

## 🛠️ Technical Stack

### Frontend
- **React** with TypeScript
- **Chakra UI** for components and styling
- **Vite** for build system
- **React Query** for data fetching and caching

### Backend
- **Rust** for system-level operations
- **Tauri** for desktop application framework
- **Windows Registry** integration
- **File system** operations

### Platform
- **Windows 10/11** (x64 and ARM64 support planned)
- **Desktop application** (no web server required)

## 📖 Documentation Structure

```
docs/
├── README.md                    # This file - documentation overview
├── PRD.md                       # Product Requirements Document
├── SRS.md                       # Software Requirements Specification
├── ProjectPlan.md               # Development roadmap
├── Progress.md                  # Development progress tracking
├── Icon-System-Guide.md         # Icon system architecture and usage guide
├── VF-Log-Viewer-Guide.md       # VF Log Viewer user guide
├── Export-Testing-Guide.md      # Export functionality testing
├── UIDD.md                      # User Interface Design Document
└── WantedFeatures.md            # Feature specifications
```

## 🔧 Development

### Building the Application
```bash
# Install dependencies
npm install

# Development mode
npm run tauri dev

# Production build
npm run build
```

### Code Quality
```bash
# Linting
npm run lint

# Formatting
npm run format

# Type checking
npm run type-check
```

## 📞 Support

### Documentation Issues
If you find issues with the documentation:
1. Check if the information is outdated
2. Verify against the current codebase
3. Update the relevant documentation file

### Feature Requests
For new features or improvements:
1. Check [Wanted Features](./WantedFeatures.md) for existing plans
2. Review the [Project Plan](./ProjectPlan.md) for roadmap
3. Consider the technical feasibility in [SRS](./SRS.md)

### Bug Reports
For bugs or issues:
1. Check the [Progress](./Progress.md) for known issues
2. Review the [VF Log Viewer Guide](./VF-Log-Viewer-Guide.md) for troubleshooting
3. Verify your configuration and settings

## 📝 Contributing

When contributing to the project:
1. **Read the Documentation**: Understand the architecture and requirements
2. **Follow the Progress**: Check what's already implemented
3. **Update Documentation**: Keep documentation current with changes
4. **Test Thoroughly**: Use the testing guides for validation

## 📄 License

See the main [README](../README.md) for license information.

---

**Last Updated**: December 19, 2024  
**Version**: Phase 7 Complete (Comprehensive Installation Information)  
**Status**: Active Development
