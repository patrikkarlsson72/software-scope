import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface AppSettings {
  // Icon Settings
  enableLazyLoading: boolean;
  iconCacheDuration: number; // in hours
  fallbackCacheDuration: number; // in days
  enableFallbackIcons: boolean;
  
  // Custom Icon Settings
  enableCustomIcons: boolean;
  customIconDirectory: string;
  
  // Display Settings
  defaultView: 'grid' | 'list';
  itemsPerPage: number;
  showArchitecture: boolean;
  showInstallDate: boolean;
  
  // Performance Settings
  enableVirtualization: boolean;
  scanTimeout: number; // in seconds
  maxConcurrentScans: number;
  
  // Export Settings
  defaultExportFormat: 'CSV' | 'HTML' | 'XML' | 'TXT';
  includeAdvancedDetails: boolean;
  
  // Log File Settings
  vfLogPath: string;
  enableVfLogViewer: boolean;
  logViewerMaxFileSize: number; // in MB
  
  // Future Features (placeholders)
  enableRemoteScanning: boolean;
  enableExternalDrives: boolean;
  enableCLI: boolean;
}

const defaultSettings: AppSettings = {
  enableLazyLoading: true,
  iconCacheDuration: 24,
  fallbackCacheDuration: 7,
  enableFallbackIcons: true,
  enableCustomIcons: true,
  customIconDirectory: 'custom_icons',
  defaultView: 'grid',
  itemsPerPage: 50,
  showArchitecture: true,
  showInstallDate: true,
  enableVirtualization: false,
  scanTimeout: 30,
  maxConcurrentScans: 5,
  defaultExportFormat: 'CSV',
  includeAdvancedDetails: false,
  vfLogPath: 'C:\\Windows\\VCLogs',
  enableVfLogViewer: true,
  logViewerMaxFileSize: 10, // 10MB default
  enableRemoteScanning: false,
  enableExternalDrives: false,
  enableCLI: false,
};

interface SettingsContextType {
  settings: AppSettings;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  resetSettings: () => void;
  isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings from localStorage on mount
  useEffect(() => {
    const loadSettings = () => {
      try {
        const savedSettings = localStorage.getItem('software-scope-settings');
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          setSettings({ ...defaultSettings, ...parsed });
        }
      } catch (error) {
        console.error('Failed to parse saved settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('software-scope-settings', JSON.stringify(settings));
    }
  }, [settings, isLoading]);

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, resetSettings, isLoading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
