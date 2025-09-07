# Export Functionality Testing Guide

## Overview
This document outlines the testing procedures for the SoftwareScope export functionality, which supports CSV, HTML, XML, and TXT formats.

## Test Environment Setup
1. Ensure the application is running (`npm run tauri dev`)
2. Load some program data by opening the application
3. Use the test script (`test-export.js`) for automated testing if needed

## Test Cases

### 1. CSV Export Testing
**Objective**: Verify CSV export includes all program fields with proper formatting

**Test Steps**:
1. Click the Export button in the main interface
2. Select "Export as CSV"
3. Choose a save location and filename
4. Open the exported CSV file

**Expected Results**:
- File contains header row with all field names
- All program data is properly formatted
- Special characters are handled correctly
- No data truncation or corruption

**Fields to Verify**:
- Name, Registry Name, Publisher, Version
- Registry Time, Install Date, Installed For
- Install Location, Install Source
- Uninstall String, Change Install String, Quiet Uninstall String
- Comments, About URL, Update Info URL, Help Link
- Install Source Path, Installer Name, Release Type
- Icon Path, MSI Filename, Estimated Size
- Attributes, Language, Parent Key Name
- Registry Path, Program Type, Is Windows Installer, Architecture

### 2. HTML Export Testing
**Objective**: Verify HTML export creates a well-formatted, styled report

**Test Steps**:
1. Click the Export button in the main interface
2. Select "Export as HTML"
3. Choose a save location and filename
4. Open the exported HTML file in a web browser

**Expected Results**:
- Professional styling with proper CSS
- Summary section showing program counts by type
- Responsive table layout
- Color-coded program types
- Hover effects on table rows
- Proper HTML escaping of special characters

**Visual Elements to Check**:
- Header with application title
- Summary box with statistics
- Styled table with alternating row colors
- Program type badges with appropriate colors
- File size formatting (KB, MB)

### 3. XML Export Testing
**Objective**: Verify XML export creates valid, well-structured XML

**Test Steps**:
1. Click the Export button in the main interface
2. Select "Export as XML"
3. Choose a save location and filename
4. Open the exported XML file

**Expected Results**:
- Valid XML structure with proper declaration
- Root element with generation timestamp and total count
- Individual Program elements with all fields
- Proper XML escaping of special characters
- Well-formatted indentation

**Structure to Verify**:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<InstalledPrograms generated="..." total="...">
    <Program>
        <Name>...</Name>
        <RegistryName>...</RegistryName>
        <!-- All other fields -->
    </Program>
</InstalledPrograms>
```

### 4. TXT Export Testing
**Objective**: Verify TXT export creates a readable, well-formatted text report

**Test Steps**:
1. Click the Export button in the main interface
2. Select "Export as Text"
3. Choose a save location and filename
4. Open the exported TXT file

**Expected Results**:
- Clear header with generation timestamp
- Program count summary
- Each program clearly separated with dividers
- All available fields displayed
- Proper text formatting and spacing

**Format to Verify**:
```
Software Scope - Installed Programs Report
Generated on: [timestamp]
Total Programs: [count]
========================================

Program #1: [name]
Registry Name: [name]
Publisher: [publisher]
Version: [version]
...
==================================================
```

## Error Handling Tests

### 1. File Permission Errors
- Test exporting to a read-only directory
- Test exporting to a non-existent directory
- Verify appropriate error messages

### 2. Large Dataset Tests
- Test with a large number of programs (1000+)
- Verify export performance and memory usage
- Check for timeout issues

### 3. Special Character Handling
- Test programs with special characters in names
- Test programs with Unicode characters
- Test programs with very long names/paths

## Performance Tests

### 1. Export Speed
- Measure export time for different dataset sizes
- Compare performance across different formats
- Verify acceptable performance for typical use cases

### 2. Memory Usage
- Monitor memory usage during large exports
- Verify no memory leaks during export operations

## Integration Tests

### 1. Filter Integration
- Test export with active search filters
- Test export with active date filters
- Test export with active publisher filters
- Verify only filtered results are exported

### 2. Sort Integration
- Test export with different sort orders
- Verify exported data maintains sort order

## Automated Testing

Use the provided `test-export.js` script for automated testing:

```javascript
// Test individual formats
testExport("CSV");
testExport("HTML");
testExport("XML");
testExport("TXT");
```

## Test Data Requirements

Ensure test environment has:
- Programs with various publishers
- Programs with different installation dates
- Programs with missing optional fields
- Programs with special characters in names
- Mix of 32-bit and 64-bit programs
- Mix of Application, SystemComponent, and Update types

## Success Criteria

All tests pass when:
- ✅ All export formats work without errors
- ✅ All program data is included in exports
- ✅ Special characters are properly handled
- ✅ File formats are valid and well-structured
- ✅ Performance is acceptable for typical datasets
- ✅ Error handling works correctly
- ✅ Integration with filters and sorting works
- ✅ UI provides appropriate feedback

## Known Issues and Limitations

- Large exports (>10,000 programs) may take significant time
- Some programs may have missing optional fields
- File size limits may apply to very large exports

## Future Enhancements

- Progress indicators for large exports
- Export scheduling and automation
- Custom field selection for exports
- Export templates and formatting options
