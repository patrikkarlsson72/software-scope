import { invoke } from '@tauri-apps/api/tauri';
import { findIconForProgram, getGenericIconForType, IconInfo } from '../data/iconDatabase';

export interface FallbackIconCache {
  [key: string]: {
    data: string;
    timestamp: number;
    source: 'cdn' | 'generic';
  };
}

const FALLBACK_CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days for fallback icons

class IconService {
  private fallbackCache: FallbackIconCache = {};

  // Get cached fallback icon
  getCachedFallbackIcon(iconUrl: string): string | null {
    const cached = this.fallbackCache[iconUrl];
    if (cached && Date.now() - cached.timestamp < FALLBACK_CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  // Set cached fallback icon
  setCachedFallbackIcon(iconUrl: string, iconData: string, source: 'cdn' | 'generic') {
    this.fallbackCache[iconUrl] = {
      data: iconData,
      timestamp: Date.now(),
      source
    };
  }

  // Download icon from URL and convert to base64
  async downloadIconFromUrl(url: string): Promise<string> {
    try {
      // Check cache first
      const cached = this.getCachedFallbackIcon(url);
      if (cached) {
        return cached;
      }

      // Use Tauri command to download and convert to base64
      const base64Data: string = await invoke('download_icon_from_url', { url });
      
      // Cache the result
      this.setCachedFallbackIcon(url, base64Data, 'cdn');
      
      return base64Data;
    } catch (error) {
      console.error(`Failed to download icon from ${url}:`, error);
      throw error;
    }
  }

  // Get fallback icon for a program
  async getFallbackIcon(programName: string, publisher?: string, programType?: string): Promise<string | null> {
    try {
      console.log(`🔍 Looking for icon: "${programName}" (Publisher: "${publisher}", Type: "${programType}")`);
      
      // Try to find a specific icon for this program
      const iconInfo = findIconForProgram(programName, publisher);
      
      if (iconInfo) {
        console.log(`✅ Found specific icon for ${programName}: ${iconInfo.iconUrl}`);
        return await this.downloadIconFromUrl(iconInfo.iconUrl);
      }

      // Fall back to generic icon based on program type
      if (programType) {
        const genericIconUrl = getGenericIconForType(programType);
        console.log(`🔄 Using generic icon for ${programName} (${programType}): ${genericIconUrl}`);
        return await this.downloadIconFromUrl(genericIconUrl);
      }

      console.log(`❌ No icon found for ${programName}`);
      return null;
    } catch (error) {
      console.error(`❌ Failed to get fallback icon for ${programName}:`, error);
      return null;
    }
  }

  // Clear fallback cache
  clearFallbackCache() {
    this.fallbackCache = {};
  }

  // Get fallback cache statistics
  getFallbackCacheStats() {
    const now = Date.now();
    const validEntries = Object.values(this.fallbackCache).filter(
      entry => now - entry.timestamp < FALLBACK_CACHE_DURATION
    ).length;
    
    return {
      totalEntries: Object.keys(this.fallbackCache).length,
      validEntries,
      expiredEntries: Object.keys(this.fallbackCache).length - validEntries,
      cdnEntries: Object.values(this.fallbackCache).filter(e => e.source === 'cdn').length,
      genericEntries: Object.values(this.fallbackCache).filter(e => e.source === 'generic').length
    };
  }
}

// Export singleton instance
export const iconService = new IconService();
