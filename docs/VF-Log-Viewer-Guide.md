# VF Log Viewer Guide

## Overview

The VF Log Viewer is a comprehensive log viewing solution integrated directly into Software Scope, designed to eliminate the need for external tools like cmtrace when troubleshooting VF deployments.

## Features

### 🎯 Core Functionality
- **Direct Log Access**: View VF deployment logs directly from `C:\Windows\VCLogs`
- **Smart File Detection**: Automatically identifies log files (`.log`, `.txt`)
- **Program Name Extraction**: Intelligently extracts program names from log filenames
- **Performance Optimized**: Handles large log files efficiently with line limits

### 🔍 Advanced Features
- **File Filtering**: Filter by VF logs, program logs, or all files
- **Search Functionality**: Real-time search by filename or program name
- **Sorting Options**: Sort by name, date, or file size
- **Syntax Highlighting**: Professional log content display
- **File Metadata**: View file size, creation, and modification dates

### 🎨 User Interface
- **Modal Interface**: Clean, responsive log viewer modal
- **File Browser**: Intuitive file list with metadata display
- **Content Viewer**: Syntax-highlighted log content display
- **Quick Actions**: Download logs or open in external editor

## Configuration

### Settings Panel
Access the VF Log Viewer settings through:
1. Click **Settings** in the main header
2. Navigate to the **VF Logs** tab
3. Configure the following options:

#### Available Settings
- **Enable VF Log Viewer**: Toggle the feature on/off
- **VF Log Directory Path**: Set the log directory (default: `C:\Windows\VCLogs`)
- **Maximum Log File Size**: Set size limit for log files (default: 10MB)

### Default Configuration
```json
{
  "vfLogPath": "C:\\Windows\\VCLogs",
  "enableVfLogViewer": true,
  "logViewerMaxFileSize": 10
}
```

## Usage

### Accessing the Log Viewer

#### Method 1: From Program Details
1. Open any VF-deployed application in the program list
2. Click on the program to open details modal
3. Look for the **"View VF Deployment Logs"** button
4. Click to open the log viewer filtered for that specific program

#### Method 2: From Main Header
1. Click the **"VF Logs"** button in the main header
2. Opens the log viewer showing all available log files
3. Use filters and search to find specific logs

### Using the Log Viewer Interface

#### File List Panel (Left Side)
- **File List**: Shows all detected log files
- **Metadata**: Displays file size, modification date, and program name
- **Badges**: 
  - 🟢 **VF** - Identified as VF log file
  - 🔵 **App** - Associated with a specific program
- **Click**: Click any file to view its contents

#### Content Panel (Right Side)
- **Log Content**: Displays the selected log file content
- **Syntax Highlighting**: Professional formatting for log entries
- **Line Limit**: Shows last 1000 lines for performance
- **Actions**: Download or open in external editor

#### Controls
- **Search**: Filter files by name or program
- **Filter**: Show all files, VF logs only, or program logs only
- **Sort**: Sort by name, date, or file size
- **Refresh**: Reload the log directory

## File Detection

### Supported File Types
- `.log` files
- `.txt` files
- Files containing "log" in the filename

### Program Name Extraction
The system intelligently extracts program names from log filenames using these patterns:

#### Common Patterns
- `AppName_YYYYMMDD_HHMMSS.log`
- `AppName-Install.log`
- `AppName.log`
- `VF_AppName_Install.log`

#### Processing Rules
1. Remove `VF_` prefix if present
2. Remove file extensions (`.log`, `.txt`)
3. Remove timestamp patterns (e.g., `_20241219_143022`)
4. Remove common suffixes (`-install`, `-uninstall`, `-update`)

### Example Transformations
```
VF_Office365_20241219_143022.log → Office365
Chrome-Install.log → Chrome
MyApp.log → MyApp
```

## Performance Considerations

### File Size Limits
- Default maximum file size: 10MB
- Files larger than the limit are skipped during scanning
- Configurable in settings panel

### Content Loading
- Only loads the last 1000 lines of log files
- Prevents memory issues with very large logs
- Maintains responsive user interface

### Caching
- File metadata is cached during the session
- Use the "Refresh" button to reload the directory
- No persistent caching to ensure up-to-date information

## Troubleshooting

### Common Issues

#### No Log Files Found
1. **Check Directory Path**: Verify the log directory path in settings
2. **Check Permissions**: Ensure the application has read access to the directory
3. **Check File Types**: Only `.log` and `.txt` files are detected
4. **Refresh**: Click the "Refresh" button to reload the directory

#### Log Viewer Not Available
1. **Check Settings**: Ensure "Enable VF Log Viewer" is enabled
2. **Check VF Status**: Only VF-deployed programs show the log viewer button
3. **Restart Application**: Restart if settings were recently changed

#### Large File Warnings
1. **Adjust Size Limit**: Increase the maximum file size in settings
2. **Use External Editor**: Click the external editor button for very large files
3. **Check File Size**: Verify the file isn't corrupted or unusually large

### Error Messages

#### "Log directory does not exist"
- The configured log directory path is invalid
- Check the path in settings and ensure it exists

#### "Failed to read log file"
- File access permission issue
- File may be locked by another process
- Try refreshing or restarting the application

## Integration Points

### Program Details Modal
- VF-deployed programs show "VF Deployed" badge
- "View VF Deployment Logs" button appears for VF programs
- Log viewer opens pre-filtered for the specific program

### Main Header
- "VF Logs" button provides quick access to all logs
- Only visible when VF Log Viewer is enabled in settings
- Opens full log viewer with all available files

### Settings Panel
- Dedicated "VF Logs" tab for configuration
- Integrated with application-wide settings system
- Settings persist across application restarts

## Future Enhancements

### Planned Features
- **Log Correlation**: Link log files to specific deployment events
- **Advanced Search**: Search within log content, not just filenames
- **Export Integration**: Include log files in program exports
- **Real-time Monitoring**: Watch for new log files as they're created
- **Log Analysis**: Basic error detection and highlighting

### Technical Improvements
- **Performance**: Optimize for very large log directories
- **Caching**: Implement intelligent file metadata caching
- **Search**: Add full-text search within log content
- **Filtering**: More advanced filtering options (date ranges, file sizes)

## API Reference

### Tauri Commands

#### `scan_vf_log_directory(config: LogViewerConfig)`
Scans the configured log directory and returns file metadata.

**Parameters:**
- `config.log_directory`: Path to log directory
- `config.max_file_size_mb`: Maximum file size in MB
- `config.enabled`: Whether the feature is enabled

**Returns:** Array of `LogFileInfo` objects

#### `read_log_file(file_path: string, max_lines?: number)`
Reads the content of a specific log file.

**Parameters:**
- `file_path`: Full path to the log file
- `max_lines`: Optional limit on number of lines (default: 1000)

**Returns:** String containing log file content

#### `get_log_file_info(file_path: string)`
Gets detailed metadata for a specific log file.

**Parameters:**
- `file_path`: Full path to the log file

**Returns:** `LogFileInfo` object with file metadata

### Data Structures

#### `LogFileInfo`
```typescript
interface LogFileInfo {
  filename: string;
  full_path: string;
  size: number;
  created: string;
  modified: string;
  program_name?: string;
  is_vf_log: boolean;
}
```

#### `LogViewerConfig`
```typescript
interface LogViewerConfig {
  log_directory: string;
  max_file_size_mb: number;
  enabled: boolean;
}
```

## Support

For issues or questions regarding the VF Log Viewer:
1. Check this documentation first
2. Verify your settings configuration
3. Check the application logs for error messages
4. Ensure proper file system permissions

The VF Log Viewer is designed to be a comprehensive replacement for cmtrace, providing a more integrated and user-friendly experience for viewing VF deployment logs.
