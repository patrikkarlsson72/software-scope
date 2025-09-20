# Changelog

All notable changes to Software Scope will be documented in this file.

## [1.2.7] - 2025-01-03

### Fixed
- **Icon Path Resolution System** ⭐ **MAJOR IMPROVEMENT**
  - **Expanded Search Scope**: Enhanced icon path resolution to search beyond basic Program Files directories
  - **Comprehensive Directory Coverage**: Now searches in ProgramData, Users\Public, Common Files, Microsoft Office directories, and SysWOW64
  - **Increased Search Depth**: Extended recursive search from 3 to 5 levels to handle complex application structures
  - **Enhanced Environment Variable Support**: Added support for %SystemDirectory%, %CommonProgramFiles%, %PUBLIC%, %ALLUSERSPROFILE% and more
  - **Improved VF App Detection**: Made VF app executable finding more precise and less permissive
  - **Enhanced Debugging**: Added comprehensive logging to diagnose icon path resolution issues
  - **Microsoft 365 Apps Support**: Significantly improved icon detection for Microsoft 365 Apps in different locales
  - **Better Error Handling**: Enhanced error reporting and path validation throughout the icon system
  - **Intelligent Executable Selection**: Fixed 7-Zip and similar applications showing wrong icons by prioritizing GUI executables over command-line tools
  - **ICO File Support**: Added automatic detection and prioritization of dedicated .ico files (e.g., Texmaker)
  - **Complex Name Handling**: Enhanced support for applications with complex names like MiKTeX and AppDisco
  - **Publisher Prefix Matching**: Added support for executables with publisher prefixes (e.g., "Atea.Tools.AppDisco.exe")
  - **Automatic Fallback**: System now automatically tries alternative sources if primary source has no icon

### Technical Changes
- **Backend Enhancements**
  - Modified `resolve_icon_path()` function in `src-tauri/src/services/icon_extractor.rs`
  - Enhanced `find_file_recursive()` with increased depth and better debugging
  - Improved `expand_environment_path()` in `src-tauri/src/commands/registry.rs`
  - Refined VF app executable matching logic for better accuracy
  - Added comprehensive debug logging throughout icon resolution process
  - Implemented intelligent icon source selection with priority-based ranking
  - Added automatic fallback to alternative sources when primary has no icon
  - Created `calculate_executable_priority()` function for smart executable selection
  - Enhanced `find_executable_in_folder()` to detect and prioritize .ico files
  - Added `find_alternative_executable_with_icon()` for comprehensive fallback mechanism
  - Added .ico file detection and matching logic for dedicated icon files
  - Enhanced complex name handling for applications with parentheses and commas
  - Added publisher prefix matching for executables with namespace prefixes
  - Implemented application-specific priority rules for MiKTeX and AppDisco
  - Added special debugging for known problematic applications

- **Icon Resolution Improvements**
  - Expanded search paths from 4 to 11 common Windows directories
  - Increased recursive search depth from 3 to 5 levels
  - Enhanced environment variable expansion with 8 additional variables
  - Improved executable matching criteria for VF-managed applications
  - Added detailed logging for troubleshooting icon path issues

### Performance
- **Icon Detection**: Significantly improved success rate for finding application icons
- **VF Applications**: Better icon detection for VF-managed applications with more precise matching
- **Complex Applications**: Enhanced support for applications with deeper directory structures
- **Microsoft Office**: Improved icon resolution for Microsoft 365 Apps across different locales
- **Multi-Executable Applications**: Fixed icon display for applications like 7-Zip with multiple executables
- **GUI Preference**: System now correctly prioritizes GUI executables over command-line tools for better icon quality
- **ICO File Applications**: Fixed icon display for applications like Texmaker with dedicated .ico files
- **Complex Name Applications**: Fixed icon display for applications like MiKTeX with complex multi-component names
- **Publisher-Prefixed Applications**: Fixed icon display for applications like AppDisco with publisher namespace prefixes
- **Comprehensive Icon Sources**: System now checks both .ico files and executables for optimal icon quality

## [1.2.1] - 2025-01-02

### Added
- **Professional Header Design**
  - Clean white header background for enterprise environments
  - Integrated Software Scope logo with proper contrast and visibility (40px height)
  - Professional button styling with hover effects and consistent theming
  - Enterprise-focused appearance suitable for IT administrator environments

- **Grid/List View Modes** ⭐ **NEW**
  - Toggle between card-based grid view and compact list view
  - Grid View: Traditional card layout with detailed information display
  - List View: Compact horizontal layout for efficient scanning
  - Visual toggle buttons with active state indicators in action bar
  - View mode preference integration with settings system
  - Instant switching between view modes without page reload
  - Responsive design for both view modes across different screen sizes

### Fixed
- **Filter Management**
  - Fixed "Clear All" button to properly clear all filters including VF deployment
  - Improved filter chip management and removal behavior
  - Consistent filter clearing across all filter types
  - Enhanced user experience with predictable filter behavior

### Technical Changes
- **Header Redesign**
  - Updated theme colors in `src/theme/index.ts` for professional appearance
  - Modified `MainLayout.tsx` with logo import and header styling
  - Enhanced button color schemes for new light header theme
  - Added proper asset import handling for logo integration

- **View Mode System**
  - Added `viewMode` state management in `ProgramList.tsx`
  - Implemented conditional rendering for grid vs list layouts
  - Created responsive design for both view modes
  - Added view mode toggle button group with visual feedback
  - Added `useEffect` to sync view mode with settings changes
  - Enhanced logo display with 40px height for better visibility
  - Added TypeScript declarations for image file imports

- **Filter System Enhancement**
  - Updated `clearAllFilters()` function to reset VF deployment filter
  - Improved filter consistency and state management
  - Enhanced filter chip removal behavior

### UI/UX Improvements
- **Professional Appearance**
  - Clean white header replacing dark blue theme
  - Integrated logo with proper contrast against white background
  - Consistent button styling throughout application
  - Enterprise-ready visual design for IT environments

- **Flexible Display Options**
  - Dual view mode system for different use cases
  - Grid view for detailed information browsing
  - List view for quick scanning and comparison
  - Visual indicators for active view mode

## [1.2.0] - 2025-01-02

### Added
- **About Section**
  - Added comprehensive About dialog accessible from header
  - Displays app version, build date, and technology information
  - Shows copyright notice and description
  - Dynamic version reading from package.json at build time
  - Clean modal interface matching existing UI design

### Technical Changes
- **Dynamic Version System**
  - Configured Vite to inject version from package.json at build time
  - Added TypeScript declaration for __APP_VERSION__ global
  - Version now updates automatically on rebuild without manual changes
  - Updated AboutPanel component to use dynamic version instead of hardcoded value

- **UI Enhancements**
  - Added About button to header with InfoIcon
  - Integrated About modal with MainLayout using useDisclosure hook
  - Maintained consistent styling with existing components
  - Updated copyright year to 2025

### Bug Fixes
- Fixed unused Link import in AboutPanel causing TypeScript build errors
- Resolved MSI build process issues

## [1.1.9] - 2025-01-02

### Added
- **Draggable Modal Functionality**
  - Entire header area of application card modal is now draggable
  - Visual cursor feedback (grab/move cursors) for better UX
  - Viewport constraints to keep modal accessible (50px minimum visibility)
  - Always starts centered when opened for consistent behavior
  - Smooth animations disabled during drag for direct mouse following

### Fixed
- **VF Log Viewer Mouse Wheel Scrolling**
  - Fixed mouse wheel scrolling not working when opened from application card
  - Added explicit `onWheel` event handlers to all scrollable areas
  - Prevents parent modal from capturing wheel events in nested modal context
  - Mouse wheel scrolling now works consistently in both contexts

### Technical Changes
- **ProgramDetails.tsx**
  - Added drag state management with `useState` and `useRef`
  - Implemented mouse event handlers with proper cleanup
  - Added viewport boundary detection and constraint logic
  - Enhanced modal positioning with fixed positioning and transform controls

- **LogViewer.tsx**
  - Added `onWheel` event handlers to log content area, file list, and main container
  - Implemented `e.stopPropagation()` to prevent event capture by parent modal
  - Added direct `scrollTop` manipulation for consistent scrolling behavior

## [1.1.7] - 2025-09-11

### Enhanced
- **Program Card Preview Improvements**
  - Removed install location from card preview for cleaner interface
  - Added APPID display for VF Managed programs in card preview
  - Fixed duplicate "APPID" text issue in preview display
  - Simplified card preview to show only: Publisher, Version, Installed date, Size, and APPID

- **Atea Information Integration**
  - Added new "Atea Information" section for VF Managed programs
  - Fetches data from `HKEY_LOCAL_MACHINE\SOFTWARE\Atea\Applications` registry
  - Displays all Atea registry fields: APPID, APP Reference, Script Author, App Update, Architecture, Date Time, Language, Manufacturer, Name, Revision, Version
  - Only appears for VF Managed programs with valid APPID
  - Includes loading states and error handling

- **Quick Access to Program Files**
  - Added "Open" button next to Install Location in detailed view
  - Automatically opens correct Program Files folder based on architecture:
    - 64-bit programs → `C:\Program Files`
    - 32-bit programs → `C:\Program Files (x86)`
  - Only shows for programs with valid install location and architecture
  - Includes folder existence validation before opening

### UI/UX Improvements
- **Card Layout Optimization**
  - Moved install location to detailed view only
  - Improved card preview readability with focused information
  - Added folder emoji (📁) for visual clarity on Open button
  - Increased button size to prevent text overlap

- **Atea Information Section**
  - Collapsible section with clean key-value display
  - Copy buttons for important fields (APPID, APP Reference)
  - Loading spinner during data fetch
  - Error message display if Atea data unavailable
  - Positioned below Basic Information as requested

### Technical Changes
- **Backend Enhancements**
  - Added `get_atea_information` Tauri command for registry data fetching
  - Added `open_program_files_folder` command for Windows Explorer integration
  - Enhanced registry scanning with APPID-based Atea data lookup
  - Added `AteaInformation` struct with all registry fields

- **Frontend Updates**
  - Updated `ProgramDetails.tsx` with Atea Information section
  - Modified `ProgramList.tsx` for improved card preview
  - Added proper error handling and loading states
  - Fixed icon import issues causing app crashes

### Bug Fixes
- Fixed duplicate "APPID" text in card preview
- Resolved app loading issues caused by non-existent icon imports
- Fixed button text overlap in Install Location section
- Removed unused `IconButton` import causing build errors

## [1.1.6] - 2025-09-11

### Enhanced
- **Complete Filter System Redesign**
  - Replaced cluttered horizontal filter dropdowns with clean collapsible panel
  - Implemented smart filter grouping (Business, Technical, Installation filters)
  - Added active filter chips with one-click removal functionality
  - Reduced horizontal space usage by 75% for cleaner interface
  - Maintained VF Managed default filter setting as requested
  - Added responsive design for mobile/tablet compatibility

### UI/UX Improvements
- **Collapsible Filter Panel**
  - Hidden by default to keep interface clean
  - Smart badge showing active filter count
  - Organized filters into logical categories with clear labeling
  - Smooth animations for expand/collapse functionality

- **Filter Chip System**
  - Visual indicators for all active filters
  - Individual removal buttons for each filter
  - "Clear All" button (preserves VF Managed default)
  - Intuitive filter management workflow

### Technical Changes
- Enhanced `ProgramList.tsx` with new filter architecture
- Added `useDisclosure` hook for collapsible functionality
- Implemented `getActiveFiltersCount()` and `getFilterChips()` helper functions
- Added `clearAllFilters()` with VF deployment preservation
- Improved responsive design with `SimpleGrid` and `Wrap` components
- Fixed `FilterIcon` import error causing blank app screen

### Performance
- Optimized filter rendering with better component structure
- Reduced DOM complexity with grouped filter sections
- Improved mobile performance with responsive design

## [1.1.5] - 2025-09-11

### Fixed
- **VF Managed applications not showing install location and shortcuts**
  - Enhanced install location detection to check for empty/invalid paths
  - Added flexible folder matching for VF Managed applications
  - Implemented specialized VF Managed detection with broader search paths
  - Added comprehensive debug logging for troubleshooting
  - Improved shortcut detection for all applications

### Technical Changes
- Modified `scan_vf_deployed_applications()` function in `src-tauri/src/commands/registry.rs`
- Enhanced `detect_program_files_location()` with more flexible matching patterns
- Added `detect_vf_managed_location()` for specialized VF Managed app detection
- Added `is_likely_vf_managed_folder()` for permissive verification
- Updated version to 1.1.5 across all configuration files

### Documentation
- Added MSI Build Guide (`docs/MSI-Build-Guide.md`)
- Updated VF Company Filter documentation with fixes
- Updated Progress.md with v1.1.5 changes
- Added .cursor-rules for development safety

## [1.1.4] - Previous Version

### Features
- VF Company Filter implementation
- Enhanced application management
- Improved UI/UX

## [1.1.3] - Previous Version

### Features
- Export functionality improvements
- Performance optimizations

## [1.1.2] - Previous Version

### Features
- Icon system enhancements
- Bug fixes

## [1.1.1] - Previous Version

### Features
- Initial VF features
- UI improvements

## [1.1.0] - Previous Version

### Features
- Core application functionality
- Basic software inventory scanning
- Search and filtering capabilities

---

## Development Notes

### Version Numbering
- Follow semantic versioning (MAJOR.MINOR.PATCH)
- Update in three files: `Cargo.toml`, `package.json`, `tauri.conf.json`
- Always test before releasing

### Build Process
- Use `npm run tauri build` to create MSI installers
- Never run `cargo clean` without explicit permission
- Preserve previous versions for rollback purposes

### Documentation
- Update this changelog for each release
- Update Progress.md with new features
- Update relevant feature documentation
