import { invoke } from '@tauri-apps/api/tauri';

export interface IconCache {
  [key: string]: {
    data: string;
    timestamp: number;
  };
}

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

class IconService {
  private cache: IconCache = {};

  // Get cached icon
  private getCachedIcon(key: string): string | null {
    const cached = this.cache[key];
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  // Set cached icon
  private setCachedIcon(key: string, iconData: string) {
    this.cache[key] = {
      data: iconData,
      timestamp: Date.now()
    };
  }

  // Extract icon from executable file
  async extractIconFromExecutable(iconPath: string, preferredSize: number = 32): Promise<string | null> {
    try {
      console.log(`🔍 Extracting icon from executable: ${iconPath}`);
      
      const response = await invoke('extract_icon_from_path', {
        request: {
          icon_path: iconPath,
          preferred_size: preferredSize
        }
      }) as { success: boolean; icon?: { data: string; format: string; size: number; source: string }; error?: string };

      if (response.success && response.icon) {
        console.log(`✅ Successfully extracted icon from ${iconPath}`);
        return response.icon.data;
      } else {
        console.warn(`❌ Failed to extract icon from ${iconPath}:`, response.error);
        return null;
      }
    } catch (error) {
      console.error(`💥 Error extracting icon from ${iconPath}:`, error);
      return null;
    }
  }

  // Main method to get icon from executable with caching
  async getIconFromExecutable(
    programName: string, 
    publisher?: string, 
    iconPath?: string,
    isVfDeployed: boolean = false
  ): Promise<string | null> {
    try {
      console.log(`🔍 Getting icon for: ${programName} (VF: ${isVfDeployed})`);
      
      // Create cache key
      const cacheKey = `${programName}-${publisher || 'unknown'}-${iconPath || 'no-path'}`;
      
      // Check cache first
      const cachedIcon = this.getCachedIcon(cacheKey);
      if (cachedIcon) {
        console.log(`✅ Using cached icon for ${programName}`);
        return cachedIcon;
      }

      // Check for custom icon first (highest priority)
      const customIcon = await this.getCustomIcon(programName);
      if (customIcon) {
        console.log(`✅ Using custom icon for ${programName}`);
        this.setCachedIcon(cacheKey, customIcon);
        return customIcon;
      }

      // If we have an icon path, try to extract from it
      if (iconPath) {
        const extractedIcon = await this.extractIconFromExecutable(iconPath, 32);
        if (extractedIcon) {
          this.setCachedIcon(cacheKey, extractedIcon);
          return extractedIcon;
        }
      }

      // For VF managed apps, try to find executable in Program Files
      if (isVfDeployed) {
        console.log(`🔍 VF managed app, trying Program Files scan for: ${programName}`);
        const vfIcon = await this.findVfAppIcon(programName, publisher);
        if (vfIcon) {
          this.setCachedIcon(cacheKey, vfIcon);
          return vfIcon;
        }
      }

      console.log(`❌ No icon found for ${programName}`);
      return null;
    } catch (error) {
      console.error(`❌ Failed to get icon for ${programName}:`, error);
      return null;
    }
  }

  // Get custom icon for a program
  private async getCustomIcon(programName: string): Promise<string | null> {
    try {
      const response = await invoke('get_custom_icon', {
        programName: programName
      }) as { success: boolean; icon_info?: { icon_data: string; format: string; size: number; icon_path: string; created_at: string }; message: string };

      if (response.success && response.icon_info) {
        console.log(`✅ Found custom icon for: ${programName}`);
        return response.icon_info.icon_data;
      } else {
        console.log(`ℹ️ No custom icon found for: ${programName}`);
        return null;
      }
    } catch (error) {
      console.error(`❌ Error getting custom icon for ${programName}:`, error);
      return null;
    }
  }

  // Find VF app icon by scanning Program Files
  private async findVfAppIcon(programName: string, publisher?: string): Promise<string | null> {
    try {
      // Use the VF-aware extraction command
      const response = await invoke('extract_icon_from_path_vf', {
        request: {
          icon_path: "", // Empty path to trigger Program Files scan
          preferred_size: 32,
          program_name: programName,
          publisher: publisher,
          is_vf_deployed: true
        }
      }) as { success: boolean; icon?: { data: string; format: string; size: number; source: string }; error?: string };

      if (response.success && response.icon) {
        console.log(`✅ Found VF app icon: ${response.icon.source}`);
        return response.icon.data;
      } else {
        console.warn(`❌ No VF app icon found for ${programName}:`, response.error);
        return null;
      }
    } catch (error) {
      console.error(`💥 Error finding VF app icon for ${programName}:`, error);
      return null;
    }
  }

  // Get simple generic icon based on publisher
  getGenericIcon(programName: string, publisher?: string): string {
    const name = programName.toLowerCase();
    const pub = publisher?.toLowerCase() || '';

    // HP programs
    if (pub.includes('hp') || name.includes('hp')) {
      return 'data:image/svg+xml;base64,' + btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#0096D6">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
        </svg>
      `);
    }

    // Microsoft programs
    if (pub.includes('microsoft')) {
      return 'data:image/svg+xml;base64,' + btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <rect x="0" y="0" width="11.4" height="11.4" fill="#F25022"/>
          <rect x="12.6" y="0" width="11.4" height="11.4" fill="#7FBA00"/>
          <rect x="0" y="12.6" width="11.4" height="11.4" fill="#00A4EF"/>
          <rect x="12.6" y="12.6" width="11.4" height="11.4" fill="#FFB900"/>
        </svg>
      `);
    }

    // Adobe programs
    if (name.includes('adobe') || name.includes('photoshop') || name.includes('acrobat')) {
      return 'data:image/svg+xml;base64,' + btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FF0000">
          <path d="M13.966 22.624l-1.69-4.281H8.122l-1.69 4.281H4.281L9.49 1.376h2.02l5.208 21.248h-2.752zm-2.4-6.18l-2.04-5.168-2.04 5.168h4.08z"/>
        </svg>
      `);
    }

    // Google programs
    if (name.includes('chrome') || name.includes('google')) {
      return 'data:image/svg+xml;base64,' + btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#4285F4">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
        </svg>
      `);
    }

    // Default generic icon
    return 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#6B7280">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
      </svg>
    `);
  }

  // Clear cache
  clearCache() {
    this.cache = {};
  }

  // Get cache statistics
  getCacheStats() {
    const now = Date.now();
    const validEntries = Object.values(this.cache).filter(
      entry => now - entry.timestamp < CACHE_DURATION
    ).length;
    
    return {
      totalEntries: Object.keys(this.cache).length,
      validEntries,
      expiredEntries: Object.keys(this.cache).length - validEntries,
      cdnEntries: 0, // Legacy compatibility
      genericEntries: Object.keys(this.cache).length // All entries are now generic
    };
  }

  // Legacy methods for compatibility
  getFallbackCacheStats() {
    return this.getCacheStats();
  }

  clearFallbackCache() {
    this.clearCache();
  }
}

// Export singleton instance
export const iconService = new IconService();