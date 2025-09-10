# VF Company Filter Feature Documentation

## Overview
The VF Company Filter is a specialized feature that allows IT administrators to identify and filter applications that have been deployed by VF (the company). This feature integrates with the Windows Registry to detect VF-deployed applications and provides filtering capabilities in the user interface.

## Technical Implementation

### Backend (Rust)
- **APPID Detection**: Scans Comments field in uninstall registry keys for "APPID:" pattern
- **Detection Logic**: Identifies VF-deployed applications by presence of APPID in Comments field
- **Data Structure**: Added `is_vf_deployed: bool` field to `ProgramInfo` struct
- **Integration**: VF detection runs after all other program scanning to mark existing programs

### Frontend (React/TypeScript)
- **Filter UI**: Dropdown with three options:
  - "All Applications" (default)
  - "VF Deployed" (shows only VF-deployed applications)
  - "Non-VF" (shows only non-VF applications)
- **Visual Indicators**: Purple "VF Deployed" badges on program cards
- **Type Safety**: Added `VFDeployment` type definition

## Detection Method
The feature uses the "Programs and Features" approach by scanning the Comments field in uninstall registry keys for the "APPID:" pattern. This method:

1. Scans all programs discovered from the standard uninstall registry keys
2. Checks the Comments field for the presence of "APPID:" text
3. Marks programs with APPID comments as VF-deployed (`is_vf_deployed = true`)

This approach is more reliable and comprehensive than the previous registry-based method, as it uses the same data source that Windows "Programs and Features" uses.

## User Interface

### Filter Dropdown
Located in the main program list interface, the VF filter dropdown provides:
- **All Applications**: Shows all programs (default behavior)
- **VF Deployed**: Shows only applications deployed by VF
- **Non-VF**: Shows only applications not deployed by VF

### Visual Indicators
- **Purple Badge**: "VF Deployed" badge appears on program cards for VF-deployed applications
- **Program Details**: VF deployment status is displayed in the program details modal

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

## Conclusion
The VF Company Filter provides a powerful tool for IT administrators to manage and identify company-deployed applications. The feature integrates seamlessly with the existing SoftwareScope application while providing specialized functionality for VF-specific use cases.
