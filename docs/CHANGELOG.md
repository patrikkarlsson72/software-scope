# Changelog

All notable changes to Software Scope will be documented in this file.

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
