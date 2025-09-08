# Software Requirements Specification (SRS) - SoftwareScope

## System Design
- Desktop application built with Tauri for Windows.  
- Hybrid architecture: React/TypeScript frontend + Rust backend.  
- Local-first design: All program data is retrieved from Windows Registry and local filesystem.  
- No external servers required for core functionality.  

## Architecture Pattern
- **Frontend**: Component-based architecture (React).  
- **Backend**: Modular service-based structure (Rust).  
- **Integration**: Tauri bridge (commands) for communication between UI and system layer.  
- **Pattern**: MVVM-inspired (UI bound to state, backend provides data).  

## State Management
- React hooks and Context API for global state.  
- React Query for async data fetching, caching, and invalidation.  
- **Icon System**: Multi-layered icon handling with local SVG assets, intelligent matching, and fallback mechanisms.
- **Caching System**: Dual-layer caching (24-hour local cache, 7-day fallback cache) for performance optimization.  

## Data Flow
1. **Backend** scans Windows Registry and filesystem.  
2. **Rust Service** structures data into `ProgramInfo` objects.  
3. **Tauri Bridge** passes data to React frontend.  
4. **Frontend State** stores results, enables filtering, searching, sorting.  
5. **User Actions** (search/filter/export) update the state and trigger backend queries as needed.  

## Technical Stack
- **Frontend**:  
  - React + TypeScript  
  - Chakra UI (styling + components)  
  - React Query (data fetching/cache)  
  - Vite (build system)  
- **Backend**:  
  - Rust  
  - Tauri (system bridge)  
  - Windows Registry crate  
  - Serde (serialization)  
- **Platform**: Windows 10/11 (x64 and ARM64 future support).  

## Authentication Process
- None required for local use.  
- App runs with current user’s permissions.  
- Potential future enhancement: elevated mode for accessing system-wide installations.  

## Route Design
- **Main Route**: Installed Programs view.  
- **Modal Routes** (UI overlays):  
  - Program Details Modal (collapsible sections).  
  - Settings Panel (cache management, log path configuration).
  - VF Log Viewer Modal (log file browsing and viewing).  
- Navigation is shallow; no multi-page routing required.  

## API Design
- **Tauri Commands** (Rust → JS bridge):  
  - `get_installed_programs()` → Returns list of installed programs with VF deployment status.  
  - `get_program_details(id)` → Returns extended details.  
  - `export_programs(format)` → Exports current results (CSV/HTML/XML/Text).  
  - `clear_icon_cache()` → Clears cached icons.
  - `get_icon_as_base64(iconPath)` → Converts local SVG assets to base64.
  - `download_icon_from_url(url)` → Downloads and converts external icons to base64.  
  - `scan_vf_log_directory(config)` → Scans VF log directory for log files.
  - `read_log_file(file_path, max_lines)` → Reads log file content.
  - `get_log_file_info(file_path)` → Gets log file metadata.
  - Future: `scan_remote(host)` → Retrieve data from remote machine.  

## Database Design ERD
Currently no external database. Data is runtime-only.  
Planned structure for persistence (if added later):  

[Program] -------------------------+
| id (PK) |
| name |
| publisher |
| version |
| install_date |
| install_path |
| uninstall_string |
| quiet_uninstall_string |
| registry_key |
| architecture (32/64-bit) |
| is_vf_deployed (boolean) |
+----------------------------------+
|
| 1..N
|
[LogPath]
| id (PK)
| program_id (FK)
| path
| created_at
+----------------------------------+


- `Program` holds discovered software data.  
- `LogPath` stores custom or system log file locations.  

## Icon System Architecture

### Overview
The application uses a sophisticated multi-layered icon system designed for performance, reliability, and visual consistency.

### Icon Sources (Priority Order)
1. **Direct SVG Mapping**: Hardcoded base64-encoded SVG icons for popular applications
2. **Local Asset Database**: 15+ SVG files stored in `src/assets/icons/`
3. **Publisher-Based Matching**: Generic icons based on publisher (HP, Microsoft, etc.)
4. **Generic Fallback**: Default window icon for unrecognized applications

### Supported Applications
**Direct SVG Icons** (15 applications):
- Microsoft (Office, Edge, Teams, OneDrive, VS Code)
- Google (Chrome)
- Adobe (Photoshop, Acrobat, Illustrator, Premiere Pro)
- Development Tools (Git, Python)
- Browsers (Firefox, Brave)
- Communication (Discord)
- Gaming (Steam)
- Operating System (Windows)

### Technical Implementation
- **Component**: `ProgramIcon.tsx` - Main icon display component
- **Service**: `iconService.ts` - Icon loading and caching service
- **Database**: `iconDatabase.ts` - Application-to-icon mapping database
- **Cache Hook**: `useIconCache.ts` - React hook for icon caching
- **Debug Tool**: `IconDebugger.tsx` - Development debugging component

### Caching Strategy
- **Local Cache**: 24-hour TTL for frequently accessed icons
- **Fallback Cache**: 7-day TTL for downloaded/processed icons
- **Memory-Based**: All caching happens in application memory
- **Cache Management**: User-controllable cache clearing via Settings panel

### Performance Optimizations
- **Base64 Encoding**: SVG icons are base64-encoded for instant loading
- **Lazy Loading**: Icons load only when components are visible
- **Intelligent Matching**: Publisher and keyword-based matching reduces lookup time
- **Fallback Hierarchy**: Graceful degradation from specific to generic icons
