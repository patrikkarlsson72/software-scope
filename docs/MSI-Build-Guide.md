# MSI Build Guide

## Overview
This guide explains how to create a new MSI installer version for the Software Scope application.

## Prerequisites
- Node.js and npm installed
- Rust and Cargo installed
- Tauri CLI installed (`npm install -g @tauri-apps/cli`)

## Step-by-Step Process

### 1. Update Version Numbers
Before building, update the version in **three** files:

#### `src-tauri/Cargo.toml`
```toml
[package]
name = "app"
version = "1.1.6"  # Update this version
```

#### `package.json`
```json
{
  "name": "software-scope",
  "version": "1.1.6",  // Update this version
  ...
}
```

#### `src-tauri/tauri.conf.json`
```json
{
  "package": {
    "productName": "software-scope",
    "version": "1.1.6"  // Update this version
  }
}
```

### 2. Build the Application
Run the build command from the project root:

```bash
npm run tauri build
```

This will:
- Build the React frontend
- Compile the Rust backend
- Create both MSI and NSIS installers

### 3. Locate the Generated Files
After successful build, the installers will be created in:

- **MSI Installer**: `src-tauri/target/release/bundle/msi/software-scope_[version]_x64_en-US.msi`
- **NSIS Installer**: `src-tauri/target/release/bundle/nsis/software-scope_[version]_x64-setup.exe`

## Important Notes

### Version Consistency
- **Always update all three version numbers** to match
- Use semantic versioning (e.g., 1.1.6, 1.2.0, 2.0.0)
- The version in the filename will match the `tauri.conf.json` version

### Build Process
- The build process compiles both frontend and backend
- MSI installer is created using WiX Toolset
- NSIS installer is created using NSIS
- Both installers are 64-bit Windows executables

### Troubleshooting

#### File Access Errors
If you get "file access denied" errors:
- Close any running instances of the application
- Check for processes using the executable
- Try running the command again

#### Build Failures
- Ensure all dependencies are installed
- Check that all version numbers match
- Verify the project structure is intact

## Version History
- **1.1.5**: Fixed VF Managed applications not showing install location and shortcuts
- **1.1.4**: Previous stable version
- **1.1.3**: Previous version
- **1.1.2**: Previous version
- **1.1.1**: Previous version
- **1.1.0**: Previous version

## Best Practices

### Before Building
1. Test the application in development mode first
2. Ensure all changes are committed to git
3. Update version numbers consistently
4. Check that no critical files are missing

### After Building
1. Test the MSI installer on a clean system
2. Verify all features work as expected
3. Keep a backup of working versions
4. Document any new features or fixes

### File Management
- **Never run `cargo clean`** without explicit permission - it deletes all build artifacts
- Preserve previous MSI versions for rollback purposes
- Keep track of which version includes which fixes

## Quick Reference

### Update Version (All Files)
```bash
# Update Cargo.toml
# Update package.json  
# Update tauri.conf.json
```

### Build Command
```bash
npm run tauri build
```

### Output Location
```
src-tauri/target/release/bundle/
├── msi/
│   └── software-scope_[version]_x64_en-US.msi
└── nsis/
    └── software-scope_[version]_x64-setup.exe
```

## Support
If you encounter issues during the build process, check:
1. All version numbers are consistent
2. No processes are using the executable
3. All dependencies are properly installed
4. The project structure is intact
