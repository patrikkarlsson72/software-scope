# Changelog

All notable changes to Software Scope will be documented in this file.

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
