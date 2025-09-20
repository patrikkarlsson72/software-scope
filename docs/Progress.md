# Project Progress

## Day 1 (Completed)
### Completed
1. Project Structure Setup
   - Verified frontend (`src/`) structure
   - Verified backend (`src-tauri/`) structure
   - All necessary directories are in place

2. Documentation Organization
   - Created `docs/` directory
   - Organized documentation files

## Day 2 (Completed)
### Completed
1. Basic Program Information Retrieval
   - Implemented Windows Registry scanning in Rust
   - Created ProgramInfo type definitions
   - Set up Tauri commands for registry access

2. Basic UI Implementation
   - Created MainLayout component
   - Implemented ProgramList component
   - Added basic CSS styling

3. Search and Filter Implementation
   - Added sorting functionality
   - Implemented search with debouncing
   - Added filters:
     - Publisher filter
     - Installation date filter with custom range
     - Program type filter
   - Added result count display

4. Development Tools Setup
   - Configured ESLint for TypeScript and React
   - Set up Prettier for code formatting
   - Added lint and format scripts

## 2024-03-xx - Enhanced Program Details and Registry Information

### Added Features
1. Expanded Program Details Modal
   - Added collapsible sections using Accordion
   - Implemented Show More/Less functionality
   - Added advanced details section

2. Enhanced Registry Information Display
   - Added Display Icon path with copy functionality
   - Added Registry Name display
   - Improved path copying functionality for various fields

3. Added New Registry Fields
   - Registry Time
   - Install Source
   - Installer Name
   - MSI Filename
   - Estimated Size
   - Language
   - And many other registry-specific fields

4. UI Improvements
   - Organized information into logical sections:
     - Basic Information
     - Installation Details
     - Uninstall Information
     - Additional Information
     - Advanced Details (expandable)
   - Added copy buttons for important paths and commands
   - Improved modal layout with better spacing and organization

### Technical Improvements
1. Rust Backend
   - Enhanced registry scanning with more detailed information
   - Added icon path extraction functionality (WIP)
   - Improved error handling for registry values
   - Removed unused imports and fixed warnings

2. TypeScript/React Frontend
   - Updated ProgramInfo interface to match new registry data
   - Implemented collapsible UI components
   - Added proper typing for all new fields
   - Fixed various TypeScript warnings

### Known Issues/TODOs
1. Icon Display
   - Current icon extraction method needs improvement
   - PowerShell approach for icon extraction needs revision

2. Future Improvements
   - Consider alternative methods for icon extraction
   - Potential performance optimizations for large registry scans
   - Consider adding search/filter functionality in advanced details 

## 2024-12-19 - Phase 3: Advanced Features Implementation ✅

### Completed Features
1. **Smart Icon System** ✅
   - **Direct SVG Icons**: 15+ hardcoded base64-encoded SVG icons for popular applications
   - **Local Asset Database**: High-quality SVG files stored in `src/assets/icons/`
   - **Intelligent Matching**: Publisher-based and keyword-based icon matching
   - **ProgramIcon Component**: Reusable component with fallback handling
   - **Performance Optimized**: Base64-encoded icons for instant loading

2. **Dual-Layer Caching System** ✅
   - **Local Cache**: 24-hour TTL for frequently accessed icons
   - **Fallback Cache**: 7-day TTL for downloaded/processed icons
   - **Cache Management**: User-controllable cache clearing via Settings panel
   - **Cache Statistics**: Real-time cache performance monitoring
   - **Memory-Based**: All caching happens in application memory for speed

3. **Performance Optimizations** ✅
   - **Base64 Encoding**: SVG icons are base64-encoded for instant loading
   - **Lazy Loading**: Icons load only when components are visible
   - **Intelligent Matching**: Publisher and keyword-based matching reduces lookup time
   - **Fallback Hierarchy**: Graceful degradation from specific to generic icons
   - **Error Handling**: Robust error handling for missing or corrupted icons

4. **UI Enhancements** ✅
   - **Settings Integration**: Cache management in Settings panel
   - **Cache Statistics**: Real-time display of cache performance
   - **Icon Debugger**: Development tool for troubleshooting icon issues
   - **Consistent Display**: Uniform icon sizing and fallback behavior
   - **Visual Feedback**: Loading states and error handling for icon display

### Technical Improvements
1. **Rust Backend**
   - **Icon Service**: Tauri commands for icon processing (`get_icon_as_base64`, `download_icon_from_url`)
   - **Error Handling**: Robust error handling for icon path extraction
   - **Performance**: Optimized icon loading and caching
   - **Scan Progress**: Added scan progress tracking structure

2. **React Frontend**
   - **ProgramIcon Component**: Main icon display component with fallback handling
   - **IconService**: Service class for icon loading and caching
   - **IconDatabase**: Application-to-icon mapping database
   - **useIconCache Hook**: React hook for icon caching management
   - **IconDebugger**: Development tool for troubleshooting icon issues

3. **Icon System Architecture**
   - **Multi-Layer System**: Direct SVG → Local Assets → Publisher Matching → Generic Fallback
   - **Base64 Encoding**: SVG icons encoded for instant loading
   - **Intelligent Matching**: Publisher and keyword-based icon matching
   - **Dual Caching**: Local cache (24h) + Fallback cache (7d)
   - **Performance**: Memory-based caching with TTL and statistics

## 2024-12-19 - Phase 4: Alternative Installation Support ✅

### Completed Features
1. **Enhanced Registry Scanning** ✅
   - Added HKEY_CURRENT_USER registry scanning for user-installed programs
   - Implemented support for user-specific installations (no admin rights required)
   - Enhanced environment variable expansion for AppData paths

2. **Filesystem Scanning** ✅
   - Added scanning of alternative installation locations:
     - %APPDATA%\Roaming (user-specific applications)
     - %APPDATA%\Local (local user applications)
     - Common portable application directories
   - Implemented executable detection patterns for portable applications
   - Added support for programs like Obsidian, Discord, Spotify, etc.

3. **Enhanced Program Information** ✅
   - Added `installation_source` field to distinguish between:
     - System: Traditional Program Files installations
     - User: User registry installations
     - Filesystem: Portable/alternative location installations
   - Updated UI to display installation source with color-coded badges
   - Added installation source filter in the main interface

4. **UI Improvements** ✅
   - Added installation source badges to program cards and details modal
   - Implemented installation source filter dropdown
   - Enhanced program type support for "Portable Application"
   - Updated architecture types to include "User" and "Unknown"

### Technical Improvements
1. **Rust Backend**
   - Enhanced `ProgramInfo` struct with installation source tracking
   - Implemented `scan_alternative_locations()` function
   - Added `scan_directory_for_programs()` for filesystem scanning
   - Created test command `test_alternative_locations()` for debugging

2. **TypeScript Frontend**
   - Updated `ProgramInfo` interface with new fields
   - Enhanced filtering logic to support installation source filtering
   - Added color-coded badges for different installation sources
   - Improved program card display with installation source information

## 2024-12-19 - Phase 5: VF Company Filter Implementation ✅

### Completed Features
1. **VF Company Detection** ✅
   - Added `is_vf_deployed` field to ProgramInfo struct in Rust backend
   - Implemented registry scanning for `HKLM/SOFTWARE/Atea/Applications`
   - Created `scan_vf_deployed_applications()` function to identify VF-deployed applications
   - Integrated VF detection with existing program scanning workflow

2. **VF Filter UI** ✅
   - Added VF deployment filter dropdown with three options:
     - "All Applications" (default)
     - "VF Deployed" (shows only VF-deployed applications)
     - "Non-VF" (shows only non-VF applications)
   - Updated filtering logic to support VF deployment filtering
   - Added VF deployment filter to dependency array for proper reactivity

3. **Visual Indicators** ✅
   - Added purple "VF Deployed" badges to program cards for easy identification
   - Integrated VF deployment status into program details modal
   - Enhanced program card display with VF deployment information

4. **TypeScript Integration** ✅
   - Updated ProgramInfo interface to include `is_vf_deployed: boolean` field
   - Added VFDeployment type definition for filter options
   - Fixed TypeScript compilation errors and unused imports

### Technical Improvements
1. **Rust Backend**
   - Enhanced ProgramInfo struct with VF deployment tracking
   - Implemented efficient registry scanning for Atea applications
   - Added proper error handling for VF registry access
   - Maintained backward compatibility with existing functionality

2. **React Frontend**
   - Created modular VF filter component
   - Implemented proper state management for VF filtering
   - Added visual feedback with color-coded badges
   - Enhanced user experience with intuitive filter options

3. **Registry Integration**
   - Scans `HKLM/SOFTWARE/Atea/Applications` registry key as requested
   - Matches VF-deployed applications by DisplayName
   - Efficiently marks existing programs as VF-deployed
   - Handles registry access errors gracefully

## 2024-12-19 - Phase 6: VF Log Viewer Integration ✅ ⭐ **NEW**

### Completed Features
1. **VF Log Viewer System** ✅
   - Created comprehensive log viewer component with modal interface
   - Implemented log file scanning from `C:\Windows\VCLogs` directory
   - Added smart program name extraction from log filenames
   - Integrated log viewer into program details modal for VF-deployed applications

2. **Backend Log Management** ✅
   - Created `logs.rs` module with three new Tauri commands:
     - `scan_vf_log_directory()` - Scans and lists log files with metadata
     - `read_log_file()` - Reads log file content with line limits
     - `get_log_file_info()` - Gets detailed file metadata
   - Implemented intelligent log file detection (`.log`, `.txt` files)
   - Added VF log file identification and program name extraction

3. **Settings Integration** ✅
   - Added VF log viewer configuration to settings context
   - Created dedicated "VF Logs" tab in settings panel
   - Added configurable log directory path (defaults to `C:\Windows\VCLogs`)
   - Implemented enable/disable toggle and file size limits
   - Added user-friendly configuration options

4. **Advanced Log Viewer Features** ✅
   - File list with filtering and sorting capabilities
   - Real-time search functionality for log files
   - Syntax highlighting for log content display
   - File size and modification date information
   - Download and external editor integration options
   - Performance optimized with line limits (last 1000 lines)

5. **UI Integration** ✅
   - Added "View VF Deployment Logs" button in program details for VF-deployed apps
   - Added "VF Logs" quick access button in main header
   - Integrated VF deployment status badges and indicators
   - Enhanced program details modal with log viewer integration

### Technical Improvements
1. **Rust Backend**
   - Created comprehensive log file scanning system
   - Implemented smart filename parsing for program name extraction
   - Added proper error handling for file system operations
   - Created efficient log file metadata collection
   - Added file size limits and performance optimizations

2. **React Frontend**
   - Built modular LogViewer component with advanced features
   - Implemented file filtering, sorting, and search functionality
   - Added syntax highlighting and professional log display
   - Created responsive modal interface with proper state management
   - Integrated with existing settings and program details systems

3. **User Experience**
   - Eliminated dependency on cmtrace for log viewing
   - Created intuitive file browser interface
   - Added comprehensive filtering and search capabilities
   - Implemented performance optimizations for large log files
   - Added proper error handling and user feedback

## 2024-12-19 - Phase 7: Comprehensive Installation Information ✅ ⭐ **NEW**

### Completed Features
1. **Enhanced Installation Information Display** ✅
   - **Installation Information Section**: Comprehensive display of install location, size, installer details, and source paths
   - **Folder Information Section**: Shows folder creation/modification dates and ownership details
   - **Enhanced Uninstall Information**: Displays uninstall, modify, and quiet uninstall commands with action buttons
   - **Human-Readable File Sizes**: Automatic conversion from KB to MB/GB with proper formatting
   - **Improved Program Cards**: Enhanced list view with size display and install location preview

2. **UninstallView-Style Features** ✅
   - **Action Buttons**: Uninstall and Modify buttons with confirmation dialogs
   - **Command Display**: Shows all uninstall-related commands with copy functionality
   - **Installation Details**: Comprehensive installation information similar to UninstallView
   - **Folder Metadata**: Creation/modification dates and ownership information
   - **Size Formatting**: Human-readable file sizes with automatic unit conversion

3. **UI Enhancements** ✅
   - **Enhanced Program Details Modal**: Better organization with Installation Information and Folder Information sections
   - **Improved Program List Cards**: Added size display and install location preview with folder icon
   - **Better Visual Hierarchy**: Improved color coding, spacing, and information organization
   - **Copy Functionality**: Enhanced copy buttons for all paths and commands
   - **Responsive Design**: Better handling of long paths and information display

4. **Technical Improvements** ✅
   - **File Size Formatting**: Utility function for converting KB to human-readable MB/GB format
   - **Enhanced Type Safety**: Updated TypeScript interfaces and proper error handling
   - **Performance Optimization**: Efficient rendering of installation information
   - **Code Organization**: Better separation of concerns and reusable utility functions

### Technical Implementation
1. **React Frontend**
   - Enhanced `ProgramDetails.tsx` with comprehensive installation information sections
   - Updated `ProgramList.tsx` with improved program cards showing size and location
   - Added `formatFileSize` utility function for human-readable size display
   - Implemented action buttons with confirmation dialogs for uninstall/modify operations
   - Enhanced UI components with better visual hierarchy and information organization

2. **User Experience**
   - **UninstallView-Style Interface**: Similar information display and functionality to UninstallView
   - **Comprehensive Information**: All installation details in one organized view
   - **Action Capabilities**: Direct uninstall and modify actions with confirmation
   - **Enhanced Filtering**: Better program list display with size and location information
   - **Professional Appearance**: Clean, organized interface with proper information hierarchy

### Next Phase Priorities
1. **Phase 8: Advanced Features**
   - Remote computer scanning
   - External drive scanning
   - Scan profiles and configuration
   - Full Command Line Interface (CLI) implementation

2. **Export Features**
   - HTML, XML, CSV, and Text export formats
   - Batch processing capabilities
   - Report generation with log file integration

3. **Enhanced VF Features**
   - Log file correlation with deployment events
   - Enhanced VF application management
   - VF-specific export templates with log integration
   - **Fixed VF Managed applications not showing install location and shortcuts** (v1.1.5)

## Recent Updates (v1.2.0) ⭐ **NEW**

### About Section Implementation
- **New Feature**: Added comprehensive About section accessible from header
- **Key Features**:
  - **About Button**: Added InfoIcon button in header next to Settings
  - **Modal Dialog**: Clean modal interface showing app information
  - **Dynamic Version**: Version automatically reads from package.json at build time
  - **App Information**: Displays version, build date, technology stack, and copyright
  - **UI Integration**: Seamlessly integrated with existing MainLayout design
- **Technical Implementation**:
  - Created AboutPanel component with modal interface
  - Configured Vite to inject version from package.json using define
  - Added TypeScript declaration for __APP_VERSION__ global
  - Updated MainLayout with About button and modal integration
  - Fixed TypeScript build errors for MSI generation

## Recent Updates (v1.1.9) ⭐ **NEW**

### Draggable Modal Functionality
- **New Feature**: Added draggable functionality to application card modal
- **Key Features**:
  - **Entire Header Draggable**: Click and drag anywhere on the modal header to reposition
  - **Visual Feedback**: Cursor changes to "grab" on hover and "move" while dragging
  - **Viewport Constraints**: Modal stays within screen boundaries (keeps at least 50px visible)
  - **Always Centered**: Modal always starts centered when opened
  - **Smooth Animations**: Disabled during drag for direct mouse following, enabled otherwise
- **Technical Implementation**:
  - Added drag state management with `useState` and `useRef`
  - Implemented mouse event handlers (`onMouseDown`, `onMouseMove`, `onMouseUp`)
  - Added viewport boundary detection and constraint logic
  - Proper event cleanup to prevent memory leaks
  - Global mouse event listeners with proper cleanup

### VF Log Viewer Mouse Wheel Scrolling Fix
- **Issue Fixed**: Mouse wheel scrolling didn't work in VF Log Viewer when opened from application card
- **Root Cause**: Nested modal context caused mouse wheel events to be captured by parent modal
- **Solution**: Added explicit `onWheel` event handlers to all scrollable areas
- **Technical Implementation**:
  - Added `onWheel` handlers to log content area, file list, and main content container
  - Used `e.stopPropagation()` to prevent parent modal from capturing events
  - Implemented direct `scrollTop` manipulation for consistent behavior
  - Applied to all scrollable areas for uniform experience
- **Result**: Mouse wheel scrolling now works consistently in both contexts

## Recent Updates (v1.1.7) ⭐ **NEW**

### Program Card Preview Improvements
- **Issue**: Card preview was cluttered with too much information including install location
- **Solution**: Streamlined card preview to show only essential information
- **Key Improvements**:
  - **Removed install location** from card preview for cleaner interface
  - **Added APPID display** for VF Managed programs in card preview
  - **Fixed duplicate "APPID" text** issue in preview display
  - **Simplified card preview** to show only: Publisher, Version, Installed date, Size, and APPID
  - **Moved install location** to detailed view only

### Atea Information Integration
- **New Feature**: Added comprehensive Atea Information section for VF Managed programs
- **Key Features**:
  - **Registry Integration**: Fetches data from `HKEY_LOCAL_MACHINE\SOFTWARE\Atea\Applications`
  - **Complete Field Display**: Shows all Atea registry fields (APPID, APP Reference, Script Author, App Update, Architecture, Date Time, Language, Manufacturer, Name, Revision, Version)
  - **Smart Display Logic**: Only appears for VF Managed programs with valid APPID
  - **Loading States**: Includes loading spinner and error handling
  - **Positioned Correctly**: Appears below Basic Information as requested

### Quick Access to Program Files
- **New Feature**: Added "Open" button next to Install Location in detailed view
- **Smart Architecture Detection**:
  - **64-bit programs** → Opens `C:\Program Files`
  - **32-bit programs** → Opens `C:\Program Files (x86)`
  - **User/Unknown architecture** → No button shown
- **Validation**: Only shows for programs with valid install location and architecture
- **Folder Existence Check**: Validates folder exists before showing button

### UI/UX Enhancements
- **Card Layout Optimization**: Moved install location to detailed view only
- **Button Improvements**: Added folder emoji (📁) and increased button size to prevent text overlap
- **Atea Information Section**: Collapsible section with clean key-value display and copy buttons
- **Error Handling**: Proper error messages and loading states throughout

### Technical Implementation
- **Backend Enhancements**:
  - Added `get_atea_information` Tauri command for registry data fetching
  - Added `open_program_files_folder` command for Windows Explorer integration
  - Enhanced registry scanning with APPID-based Atea data lookup
  - Added `AteaInformation` struct with all registry fields
- **Frontend Updates**:
  - Updated `ProgramDetails.tsx` with Atea Information section
  - Modified `ProgramList.tsx` for improved card preview
  - Added proper error handling and loading states
  - Fixed icon import issues causing app crashes

### Bug Fixes
- Fixed duplicate "APPID" text in card preview
- Resolved app loading issues caused by non-existent icon imports
- Fixed button text overlap in Install Location section
- Removed unused `IconButton` import causing build errors

## Recent Updates (v1.1.6) ⭐ **NEW**

### Complete Filter System Redesign
- **Issue**: Cluttered interface with too many horizontal filter dropdowns taking up excessive space
- **Solution**: Implemented clean, modern filter system with smart organization
- **Key Improvements**:
  - **75% reduction in horizontal space usage** - replaced 7 filter dropdowns with collapsible panel
  - **Smart filter grouping** - organized filters into Business, Technical, and Installation categories
  - **Active filter chips** - visual indicators with one-click removal functionality
  - **Preserved VF Managed default** - maintained user's preferred default filter setting
  - **Enhanced responsive design** - improved mobile/tablet compatibility

### UI/UX Enhancements
- **Collapsible Filter Panel**: Hidden by default for clean interface, expandable when needed
- **Filter Chip System**: Visual indicators for active filters with individual removal buttons
- **Smart Badge**: Shows active filter count on the "Filters" button
- **Responsive Layout**: Flexible grid that adapts to screen size with wrapped elements
- **Smooth Animations**: Expand/collapse functionality with proper transitions

### Technical Implementation
- Enhanced `ProgramList.tsx` with new filter architecture using `useDisclosure` hook
- Implemented helper functions: `getActiveFiltersCount()`, `getFilterChips()`, `clearAllFilters()`
- Added responsive components: `SimpleGrid`, `Wrap`, `Collapse`, `Tag` with proper styling
- Fixed `FilterIcon` import error that was causing blank app screen
- Improved component structure with better separation of concerns

## Recent Updates (v1.2.7) ⭐ **LATEST**

### Icon Path Resolution System Enhancement
- **Major Improvement**: Comprehensive overhaul of icon path resolution system
- **Key Enhancements**:
  - **Expanded Search Scope**: Increased from 4 to 11 Windows directories for comprehensive icon detection
  - **Deep Recursive Search**: Extended search depth from 3 to 5 levels for complex application structures
  - **Enhanced Environment Variables**: Added support for 8 additional Windows environment variables
  - **Improved VF App Detection**: More precise and less permissive executable matching for VF-managed applications
  - **Comprehensive Debugging**: Added detailed logging throughout the icon resolution process
  - **Microsoft 365 Apps Support**: Significantly improved icon detection for Microsoft 365 Apps across different locales

- **Technical Implementation**:
  - Modified `resolve_icon_path()` function with expanded search paths and better debugging
  - Enhanced `find_file_recursive()` with increased depth and comprehensive logging
  - Improved `expand_environment_path()` with additional Windows environment variables
  - Refined VF app executable matching logic for better accuracy and fewer false positives
  - Added step-by-step debugging output for troubleshooting icon path issues

- **Performance Impact**:
  - **Icon Detection Success Rate**: Significantly improved success rate for finding application icons
  - **VF Applications**: Better icon detection for VF-managed applications with more precise matching
  - **Complex Applications**: Enhanced support for applications with deeper directory structures
  - **Microsoft Office**: Improved icon resolution for Microsoft 365 Apps across different locales

- **Search Directory Expansion**:
  - **Standard**: `C:\Program Files`, `C:\Program Files (x86)`, `C:\Windows\System32`, `C:\Windows`
  - **Enhanced**: `C:\ProgramData`, `C:\Users\Public`, `C:\Windows\SysWOW64`, `C:\Program Files\Common Files`, `C:\Program Files (x86)\Common Files`, `C:\Program Files\Microsoft Office`, `C:\Program Files (x86)\Microsoft Office`

- **Environment Variable Support**:
  - Added: `%SystemDirectory%`, `%SystemPath%`, `%CommonProgramFiles%`, `%CommonProgramFiles(x86)%`, `%PUBLIC%`, `%ALLUSERSPROFILE%`
  - Enhanced existing support for `%ProgramFiles%`, `%ProgramFiles(x86)%`, `%ProgramData%`, `%SystemRoot%`, `%windir%`

## Recent Updates (v1.2.1)

### Professional Header Design & Logo Integration
- **Enhancement**: Complete header redesign for enterprise environments
- **Key Improvements**:
  - **Clean white header background** replacing dark blue theme
  - **Integrated Software Scope logo** with proper contrast and visibility
  - **Professional button styling** with hover effects and consistent theming
  - **Enterprise-focused appearance** suitable for IT administrator environments
- **Technical Implementation**:
  - Updated theme colors in `src/theme/index.ts`
  - Modified `MainLayout.tsx` with logo import and header styling
  - Enhanced button color schemes for new light header theme

### Grid/List View Modes
- **Enhancement**: Dual view mode system for flexible program display
- **Key Features**:
  - **Grid View**: Traditional card-based layout with detailed information
  - **List View**: Compact horizontal layout for efficient scanning
  - **Visual toggle buttons** with active state indicators
  - **Settings integration** for view mode preferences
- **Technical Implementation**:
  - Added `viewMode` state management in `ProgramList.tsx`
  - Implemented conditional rendering for grid vs list layouts
  - Created responsive design for both view modes
  - Added view mode toggle button group with visual feedback

### Enhanced Filter Management
- **Issue**: "Clear All" button was not clearing VF deployment filter
- **Root Cause**: `clearAllFilters()` function intentionally preserved VF deployment setting
- **Solution**:
  - **Fixed Clear All functionality** to properly reset all filters including VF deployment
  - **Improved filter consistency** across all filter types
  - **Enhanced user experience** with predictable filter clearing behavior

## Previous Updates (v1.1.5)

### VF Managed Application Fixes
- **Issue**: VF Managed applications were not displaying "Install Location" and "Shortcuts" in the details panel
- **Root Cause**: Install location detection logic was too restrictive and only checked for `None` values, not empty or invalid paths
- **Solution**: 
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

## References
- Full feature list: [WantedFeatures.md](./WantedFeatures.md)
- MSI Build Guide: [MSI-Build-Guide.md](./MSI-Build-Guide.md) 