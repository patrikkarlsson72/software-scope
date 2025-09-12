// Debug script to test icon path resolution
const { invoke } = require('@tauri-apps/api/tauri');

async function debugIconPaths() {
    try {
        console.log('🔍 Testing icon path resolution...');
        
        // Test some specific programs that are showing generic icons
        const testPaths = [
            'C:\\Program Files\\7-Zip\\7zFM.exe',
            'C:\\Program Files\\AnyDesk\\AnyDesk.exe',
            'C:\\Program Files\\AppDisco\\AppDisco.exe',
            'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
        ];
        
        for (const path of testPaths) {
            console.log(`\n📁 Testing path: ${path}`);
            
            try {
                const resolved = await invoke('resolve_icon_path_command', { iconPath: path });
                console.log(`✅ Resolved: ${resolved}`);
                
                if (resolved) {
                    const extracted = await invoke('extract_icon_from_path', {
                        request: {
                            icon_path: path,
                            preferred_size: 32
                        }
                    });
                    console.log(`🎯 Extraction result:`, extracted);
                }
            } catch (error) {
                console.error(`❌ Error with ${path}:`, error);
            }
        }
        
    } catch (error) {
        console.error('💥 Debug failed:', error);
    }
}

// Run the debug function
debugIconPaths();
