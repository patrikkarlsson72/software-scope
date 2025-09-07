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
- Icon caching system with TTL for performance optimization.  

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
- Navigation is shallow; no multi-page routing required.  

## API Design
- **Tauri Commands** (Rust → JS bridge):  
  - `scan_registry()` → Returns list of installed programs.  
  - `get_program_details(id)` → Returns extended details.  
  - `export_data(format)` → Exports current results (CSV/HTML/XML/Text).  
  - `clear_icon_cache()` → Clears cached icons.  
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
