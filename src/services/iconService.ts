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

  // Load icon from URL or local path and convert to base64
  async downloadIconFromUrl(url: string): Promise<string> {
    try {
      // Check cache first
      const cached = this.getCachedFallbackIcon(url);
      if (cached) {
        return cached;
      }

      let base64Data: string;

      // Check if it's a local asset path
      if (url.startsWith('/src/assets/')) {
        // For local assets, we need to read the file directly
        // Convert the path to a proper file path
        const filePath = url.replace('/src/assets/', 'src/assets/');
        try {
          base64Data = await invoke('get_icon_as_base64', { iconPath: filePath });
          this.setCachedFallbackIcon(url, base64Data, 'generic');
        } catch (localError) {
          // Fall back to a simple data URL for SVG content
          const svgContent = await this.getSvgContent(url);
          if (svgContent) {
            base64Data = `data:image/svg+xml;base64,${btoa(svgContent)}`;
            this.setCachedFallbackIcon(url, base64Data, 'generic');
          } else {
            throw localError;
          }
        }
      } else {
        // Use Tauri command to download and convert to base64
        base64Data = await invoke('download_icon_from_url', { url });
        this.setCachedFallbackIcon(url, base64Data, 'cdn');
      }
      
      return base64Data;
    } catch (error) {
      console.error(`Failed to load icon from ${url}:`, error);
      throw error;
    }
  }

  // Get fallback icon for a program
  async getFallbackIcon(programName: string, publisher?: string, programType?: string): Promise<string | null> {
    try {
      // Try to find a specific icon for this program
      const iconInfo = findIconForProgram(programName, publisher);
      
      if (iconInfo) {
        return await this.downloadIconFromUrl(iconInfo.iconUrl);
      }

      // Fall back to generic icon based on program type
      if (programType) {
        const genericIconUrl = getGenericIconForType(programType);
        return await this.downloadIconFromUrl(genericIconUrl);
      }

      return null;
    } catch (error) {
      console.error(`❌ Failed to get fallback icon for ${programName}:`, error);
      return null;
    }
  }

  // Get SVG content for local assets
  private async getSvgContent(url: string): Promise<string | null> {
    try {
      // Map of local asset paths to their SVG content
      const svgAssets: { [key: string]: string } = {
        '/src/assets/icons/hp.svg': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#0096D6"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>',
        '/src/assets/icons/microsoft.svg': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#F25022"><path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z"/></svg>',
        '/src/assets/icons/brave.svg': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FB542B"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>',
        '/src/assets/icons/git.svg': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#F05032"><path d="M23.546 10.93L13.067.452c-.604-.603-1.582-.603-2.188 0L8.708 2.627l2.76 2.76c.645-.215 1.379-.07 1.889.441.516.515.658 1.258.438 1.9l2.658 2.66c.645-.223 1.387-.078 1.9.435.721.72.721 1.884 0 2.604-.719.719-1.881.719-2.6 0-.539-.541-.674-1.337-.404-1.996L12.86 8.955v6.525c.176.086.342.203.488.348.713.721.713 1.883 0 2.6-.719.721-1.889.721-2.609 0-.719-.719-.719-1.879 0-2.598.182-.18.387-.316.605-.406V8.835c-.218-.091-.423-.222-.6-.401-.545-.545-.676-1.342-.396-2.009L7.636 3.7.45 10.881c-.6.605-.6 1.584 0 2.189l10.48 10.477c.604.604 1.582.604 2.186 0l10.43-10.43c.605-.603.605-1.582 0-2.187"/></svg>',
        '/src/assets/icons/chrome.svg': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#4285F4"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>',
        '/src/assets/icons/firefox.svg': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FF7139"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>',
        '/src/assets/icons/edge.svg': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#0078D4"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>',
        '/src/assets/icons/teams.svg': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#6264A7"><path d="M20.5 14.26a1 1 0 0 0-1 0l-6.5 3.75a1 1 0 0 1-1 0L5.5 14.26a1 1 0 0 0-1 0l-1.5.87a1 1 0 0 1-1.5-.87V6.38a1 1 0 0 1 .5-.87l1.5-.87a1 1 0 0 1 1 0l6.5 3.75a1 1 0 0 0 1 0l6.5-3.75a1 1 0 0 1 1 0l1.5.87a1 1 0 0 1 .5.87v8.88a1 1 0 0 1-.5.87l-1.5.87z"/></svg>',
        '/src/assets/icons/onedrive.svg': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#0078D4"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>',
        '/src/assets/icons/vscode.svg': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#007ACC"><path d="M23.15 2.587L18.21.21a1.494 1.494 0 0 0-1.705.29l-9.46 8.63-4.12-3.128a.999.999 0 0 0-1.276.057L.327 7.261A1 1 0 0 0 .326 8.74L3.899 12 .326 15.26a1 1 0 0 0 .001 1.479L1.65 17.94a.999.999 0 0 0 1.276.057l4.12-3.128 9.46 8.63a1.492 1.492 0 0 0 1.704.29l4.942-2.377A1.5 1.5 0 0 0 24 20.06V3.939a1.5 1.5 0 0 0-.85-1.352zm-5.146 14.861L10.826 12l7.178-5.448v10.896z"/></svg>',
        '/src/assets/icons/office.svg': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#D83B01"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>',
        '/src/assets/icons/adobe.svg': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FF0000"><path d="M13.966 22.624l-1.69-4.281H8.122l-1.69 4.281H4.281L9.49 1.376h2.02l5.208 21.248h-2.752zm-2.4-6.18l-2.04-5.168-2.04 5.168h4.08z"/></svg>',
        '/src/assets/icons/steam.svg': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#171a21"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>',
        '/src/assets/icons/discord.svg': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#5865F2"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>',
        '/src/assets/icons/windows.svg': '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#0078D4"><path d="M3 12V6.75l6-1.32v6.48L3 12zm17-9v8.75l-10 .15V5.21L20 3zM3 13l6 .09v6.81l-6-1.15V13zm17 .25V22l-10-1.91v-6.75l10 .15z"/></svg>'
      };
      
      return svgAssets[url] || null;
    } catch (error) {
      console.error(`Failed to get SVG content for ${url}:`, error);
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
