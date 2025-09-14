// Debug script specifically for VF managed app icon issues
const { invoke } = require('@tauri-apps/api/tauri');

async function debugVFIconIssues() {
    try {
        console.log('🔍 VF Icon Debug Tool Starting...\n');
        
        // First, get all installed programs to find VF managed ones
        console.log('📋 Getting all installed programs...');
        const programs = await invoke('get_installed_programs');
        
        // Filter for VF managed apps
        const vfApps = programs.filter(p => p.is_vf_deployed);
        console.log(`\n🎯 Found ${vfApps.length} VF managed apps:`);
        
        vfApps.forEach((app, index) => {
            console.log(`${index + 1}. ${app.name}`);
            console.log(`   Publisher: ${app.publisher || 'N/A'}`);
            console.log(`   Icon Path: ${app.icon_path || 'N/A'}`);
            console.log(`   Install Location: ${app.install_location || 'N/A'}`);
            console.log(`   Registry Path: ${app.registry_path || 'N/A'}`);
            console.log('');
        });
        
        // Test icon extraction for each VF app
        console.log('\n🔧 Testing icon extraction for VF apps...\n');
        
        for (const app of vfApps.slice(0, 5)) { // Test first 5 VF apps
            console.log(`\n📱 Testing: ${app.name}`);
            console.log(`   VF Deployed: ${app.is_vf_deployed}`);
            console.log(`   Icon Path: ${app.icon_path || 'None'}`);
            console.log(`   Publisher: ${app.publisher || 'None'}`);
            
            try {
                // Test VF icon extraction
                const vfResult = await invoke('extract_icon_from_path_vf', {
                    request: {
                        icon_path: app.icon_path || '',
                        program_name: app.name,
                        publisher: app.publisher,
                        is_vf_deployed: app.is_vf_deployed,
                        preferred_size: 32
                    }
                });
                
                console.log(`   VF Extraction Result:`);
                console.log(`     Success: ${vfResult.success}`);
                if (vfResult.icon) {
                    console.log(`     Icon Size: ${vfResult.icon.size}x${vfResult.icon.size}`);
                    console.log(`     Icon Source: ${vfResult.icon.source}`);
                    console.log(`     Icon Data Length: ${vfResult.icon.data.length} chars`);
                } else {
                    console.log(`     Error: ${vfResult.error || 'No icon data'}`);
                }
                
                // Also test standard extraction for comparison
                if (app.icon_path) {
                    const standardResult = await invoke('extract_icon_from_path', {
                        request: {
                            icon_path: app.icon_path,
                            preferred_size: 32
                        }
                    });
                    
                    console.log(`   Standard Extraction Result:`);
                    console.log(`     Success: ${standardResult.success}`);
                    if (standardResult.icon) {
                        console.log(`     Icon Size: ${standardResult.icon.size}x${standardResult.icon.size}`);
                        console.log(`     Icon Source: ${standardResult.icon.source}`);
                    } else {
                        console.log(`     Error: ${standardResult.error || 'No icon data'}`);
                    }
                }
                
            } catch (error) {
                console.error(`   ❌ Error testing ${app.name}:`, error);
            }
        }
        
        // Test Program Files scanning for a specific VF app
        console.log('\n🔍 Testing Program Files scanning...\n');
        
        if (vfApps.length > 0) {
            const testApp = vfApps[0];
            console.log(`Testing Program Files scan for: ${testApp.name}`);
            
            // This would require a new command, but let's see what we can debug
            console.log('Note: Program Files scanning happens in the Rust backend');
            console.log('Check the console output for VF scanning debug messages');
        }
        
    } catch (error) {
        console.error('💥 Debug failed:', error);
    }
}

// Run the debug function
debugVFIconIssues();
