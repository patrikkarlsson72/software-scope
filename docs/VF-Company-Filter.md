# VF Company Filter Feature Documentation

## Overview
The VF Company Filter is a specialized feature that allows IT administrators to identify and filter applications that have been managed by VF (the company). This feature uses the Windows "Programs and Features" interface to detect VF-managed applications by looking for APPID patterns in the Comments field, providing filtering capabilities in the user interface.

## Technical Implementation

### Backend (Rust)
- **APPID Detection**: Scans Comments field in uninstall registry keys for "APPID:" pattern
- **Detection Logic**: Identifies VF-managed applications by presence of APPID in Comments field
- **Data Structure**: Added `is_vf_deployed: bool` field to `ProgramInfo` struct
- **Integration**: VF detection runs after all other program scanning to mark existing programs

### Frontend (React/TypeScript)
- **Filter UI**: Dropdown with three options:
  - "All Applications" (default)
  - "VF Managed" (shows only VF-managed applications)
  - "Other Apps" (shows only non-VF applications)
- **Visual Indicators**: Purple "VF Managed" badges on program cards with enhanced styling
- **System Info**: Check OS button to open Windows version dialog
- **Quick Stats**: VF Managed counter displayed prominently in top-left
- **Type Safety**: Added `VFDeployment` type definition

## Detection Method
The feature uses the "Programs and Features" approach by scanning the Comments field in uninstall registry keys for the "APPID:" pattern. This method:

1. Scans all programs discovered from the standard uninstall registry keys
2. Checks the Comments field for the presence of "APPID:" text
3. Marks programs with APPID comments as VF-managed (`is_vf_deployed = true`)

This approach is more reliable and comprehensive than the previous registry-based method, as it uses the same data source that Windows "Programs and Features" uses.

## User Interface Enhancements

### System Information
- **Check OS Button**: Replaces Windows version text with an interactive button
- **Windows Version Dialog**: Clicking the button opens the official Windows version dialog
- **Clean Design**: Blue outline button with computer icon and smooth hover animations

### VF Managed Counter
- **Prominent Display**: Purple card with border and shadow in top-left area
- **Real-time Updates**: Counter updates dynamically as filters are applied
- **Visual Hierarchy**: Positioned below Check OS button for logical flow

## User Interface

### Filter Dropdown
Located in the main program list interface, the VF filter dropdown provides:
- **All Applications**: Shows all programs (default behavior)
- **VF Managed**: Shows only applications managed by VF
- **Other Apps**: Shows only applications not managed by VF

### Visual Indicators
- **Purple Badge**: "VF Managed" badge appears on program cards for VF-managed applications
- **Enhanced Styling**: Bold, solid purple badges with improved visibility
- **Card Highlighting**: VF-managed programs have purple left border and light background
- **Program Details**: VF management status is displayed in the program details modal

## Usage Scenarios

### IT Administrator Use Cases
1. **Software Auditing**: Quickly identify which applications were deployed by the company
2. **Compliance Checking**: Ensure only approved applications are installed
3. **Troubleshooting**: Focus on company-deployed applications when investigating issues
4. **Inventory Management**: Generate reports of company-deployed software

### Filter Combinations
The VF filter works in combination with other filters:
- Publisher filter + VF filter
- Installation date filter + VF filter
- Program type filter + VF filter
- Search term + VF filter

## Technical Details

### Performance Considerations
- VF registry scanning is performed once during application startup
- No performance impact on filtering operations
- Efficient matching algorithm using DisplayName comparison

### Error Handling
- Graceful handling of registry access errors
- Applications continue to be listed even if VF registry is inaccessible
- No impact on core functionality if VF detection fails

### Data Flow
1. Application starts and scans standard Windows registry locations
2. VF registry scanning is performed
3. Matching applications are marked as VF-deployed
4. UI displays all applications with VF deployment status
5. User can filter by VF deployment status

## Future Enhancements

### Planned Features
- VF deployment log viewer integration
- Enhanced VF application management
- VF-specific export templates
- Batch operations on VF-deployed applications

### Potential Improvements
- Support for multiple VF registry locations
- Custom VF deployment detection rules
- VF deployment history tracking
- Integration with VF deployment systems

## Configuration

### Registry Requirements
- Requires access to `HKLM/SOFTWARE/Atea/Applications`
- Standard user permissions sufficient for reading registry
- No additional configuration required

### Settings Integration
The feature integrates with the existing settings system and can be extended with:
- Custom VF registry paths
- VF deployment detection rules
- Visual customization options

## Troubleshooting

### Common Issues
1. **No VF Applications Detected**
   - Verify `HKLM/SOFTWARE/Atea/Applications` registry key exists
   - Check registry permissions
   - Ensure applications are properly registered

2. **Filter Not Working**
   - Verify TypeScript compilation
   - Check browser console for errors
   - Ensure filter state is properly managed

3. **Performance Issues**
   - VF scanning is performed once at startup
   - No ongoing performance impact
   - Consider registry size if issues persist

## API Reference

### Rust Backend
```rust
// ProgramInfo struct
pub struct ProgramInfo {
    // ... existing fields
    pub is_vf_deployed: bool,
}

// VF scanning function
fn scan_vf_deployed_applications(programs: &mut Vec<ProgramInfo>)
```

### TypeScript Frontend
```typescript
// Filter type
type VFDeployment = 'all' | 'vf-deployed' | 'non-vf';

// ProgramInfo interface
interface ProgramInfo {
    // ... existing fields
    is_vf_deployed: boolean;
}
```

## Testing

### Test Scenarios
1. **Registry Access**: Verify VF registry can be read
2. **Application Matching**: Test DisplayName matching logic
3. **Filter Functionality**: Test all three filter options
4. **Visual Indicators**: Verify badges appear correctly
5. **Performance**: Ensure no performance degradation

### Test Data
- Create test entries in `HKLM/SOFTWARE/Atea/Applications`
- Use applications with known DisplayNames
- Test with various registry structures

## Security Considerations

### Registry Access
- Read-only access to registry keys
- No modification of registry data
- Standard Windows security model applies

### Data Privacy
- No external data transmission
- All processing performed locally
- No logging of sensitive information

## Recent Updates (v1.1.5)

### VF Managed Application Display Fixes
**Issue Resolved**: VF Managed applications were not displaying complete information in the details panel, specifically missing "Install Location" and "Shortcuts" information.

**Technical Solution**:
- Enhanced install location detection to handle empty or invalid registry paths
- Implemented specialized detection methods for VF Managed applications
- Added flexible folder matching patterns for better application identification
- Improved shortcut scanning for all applications

**Files Modified**:
- `src-tauri/src/commands/registry.rs` - Enhanced detection logic
- Added `detect_vf_managed_location()` function for specialized VF app detection
- Added `is_likely_vf_managed_folder()` for permissive verification

**Result**: VF Managed applications now properly display:
- Install Location (detected from Program Files)
- Shortcuts (scanned from common locations)
- All other application details

## Conclusion
The VF Company Filter provides a powerful tool for IT administrators to manage and identify company-deployed applications. The feature integrates seamlessly with the existing SoftwareScope application while providing specialized functionality for VF-specific use cases. With the recent fixes in v1.1.5, VF Managed applications now display complete information including install locations and shortcuts.
