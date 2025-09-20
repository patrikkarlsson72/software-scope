import React, { useState } from 'react';
import {
  Box,
  Button,
  Text,
  VStack,
  HStack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Switch,
  FormControl,
  FormLabel,
  FormHelperText,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Select,
  Divider,
  Badge,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Input,
} from '@chakra-ui/react';
import { invoke } from '@tauri-apps/api/tauri';
import { useIconCache } from '../../hooks/useIconCache';
import { iconService } from '../../services/iconService';
import { IconDebugger } from './IconDebugger';
import { CLIPanel } from './CLIPanel';
import { HelpPanel } from './HelpPanel';
import { useSettings } from '../../contexts/SettingsContext';


export const SettingsPanel: React.FC = () => {
  const { clearCache, cacheStats } = useIconCache();
  const { settings, updateSetting, resetSettings } = useSettings();
  const toast = useToast();
  const [fallbackStats, setFallbackStats] = useState(() => iconService.getFallbackCacheStats());

  const handleClearCache = () => {
    clearCache();
    iconService.clearFallbackCache();
    setFallbackStats(iconService.getFallbackCacheStats());
    toast({
      title: 'Cache Cleared',
      description: 'All icon caches have been cleared successfully',
      status: 'success',
      duration: 2000,
    });
  };

  const handleRefreshStats = () => {
    setFallbackStats(iconService.getFallbackCacheStats());
  };

  const handleSettingChange = (key: keyof typeof settings, value: any) => {
    updateSetting(key, value);
  };

  const resetToDefaults = () => {
    resetSettings();
    toast({
      title: 'Settings Reset',
      description: 'All settings have been reset to default values',
      status: 'info',
      duration: 2000,
    });
  };

  return (
    <Box p={4} borderWidth="1px" borderRadius="lg" bg="white" shadow="sm">
      <Tabs>
        <TabList>
          <Tab>Cache & Performance</Tab>
          <Tab>Display</Tab>
          <Tab>Custom Icons</Tab>
          <Tab>Export</Tab>
          <Tab>VF Logs</Tab>
          <Tab>CLI</Tab>
          <Tab>Help</Tab>
          <Tab>Advanced</Tab>
        </TabList>

        <TabPanels>
          {/* Cache & Performance Tab */}
          <TabPanel>
            <VStack spacing={6} align="stretch">
              <Text fontSize="lg" fontWeight="bold">Icon Cache Manager</Text>
              
              <Box p={4} borderWidth="1px" borderRadius="md" bg="gray.50">
                <Text fontSize="md" fontWeight="semibold" color="blue.600" mb={3}>Local Icons</Text>
                <HStack spacing={6}>
                  <Stat>
                    <StatLabel>Total Entries</StatLabel>
                    <StatNumber>{cacheStats.totalEntries}</StatNumber>
                    <StatHelpText>Total cached icons</StatHelpText>
                  </Stat>
                  
                  <Stat>
                    <StatLabel>Valid Entries</StatLabel>
                    <StatNumber>{cacheStats.validEntries}</StatNumber>
                    <StatHelpText>Non-expired entries</StatHelpText>
                  </Stat>
                  
                  <Stat>
                    <StatLabel>Expired Entries</StatLabel>
                    <StatNumber>{cacheStats.expiredEntries}</StatNumber>
                    <StatHelpText>Expired cache entries</StatHelpText>
                  </Stat>
                </HStack>
              </Box>

              <Box p={4} borderWidth="1px" borderRadius="md" bg="gray.50">
                <Text fontSize="md" fontWeight="semibold" color="green.600" mb={3}>Fallback Icons</Text>
                <HStack spacing={6}>
                  <Stat>
                    <StatLabel>Total Fallback</StatLabel>
                    <StatNumber>{fallbackStats.totalEntries}</StatNumber>
                    <StatHelpText>Downloaded fallback icons</StatHelpText>
                  </Stat>
                  
                  <Stat>
                    <StatLabel>CDN Icons</StatLabel>
                    <StatNumber>{fallbackStats.cdnEntries}</StatNumber>
                    <StatHelpText>From CDN sources</StatHelpText>
                  </Stat>
                  
                  <Stat>
                    <StatLabel>Generic Icons</StatLabel>
                    <StatNumber>{fallbackStats.genericEntries}</StatNumber>
                    <StatHelpText>Generic type icons</StatHelpText>
                  </Stat>
                </HStack>
              </Box>
              
              <HStack spacing={3}>
                <Button onClick={handleClearCache} colorScheme="red" size="sm">
                  Clear All Caches
                </Button>
                <Button onClick={handleRefreshStats} size="sm">
                  Refresh Stats
                </Button>
              </HStack>

              <Divider />

              <Text fontSize="lg" fontWeight="bold">Performance Settings</Text>
              
              <FormControl>
                <FormLabel>Enable Lazy Loading</FormLabel>
                <Switch
                  isChecked={settings.enableLazyLoading}
                  onChange={(e) => handleSettingChange('enableLazyLoading', e.target.checked)}
                />
                <FormHelperText>Load icons only when they become visible (recommended for better performance)</FormHelperText>
              </FormControl>

              <FormControl>
                <FormLabel>Enable Fallback Icons</FormLabel>
                <Switch
                  isChecked={settings.enableFallbackIcons}
                  onChange={(e) => handleSettingChange('enableFallbackIcons', e.target.checked)}
                />
                <FormHelperText>Download icons from CDN when local icons are not available</FormHelperText>
              </FormControl>

              <HStack spacing={4}>
                <FormControl>
                  <FormLabel>Icon Cache Duration (hours)</FormLabel>
                  <NumberInput
                    value={settings.iconCacheDuration}
                    onChange={(_, value) => handleSettingChange('iconCacheDuration', value)}
                    min={1}
                    max={168}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <FormControl>
                  <FormLabel>Fallback Cache Duration (days)</FormLabel>
                  <NumberInput
                    value={settings.fallbackCacheDuration}
                    onChange={(_, value) => handleSettingChange('fallbackCacheDuration', value)}
                    min={1}
                    max={30}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
              </HStack>

              <IconDebugger />
            </VStack>
          </TabPanel>

          {/* Display Tab */}
          <TabPanel>
            <VStack spacing={6} align="stretch">
              <Text fontSize="lg" fontWeight="bold">Display Settings</Text>
              
              <FormControl>
                <FormLabel>Default View</FormLabel>
                <Select
                  value={settings.defaultView}
                  onChange={(e) => handleSettingChange('defaultView', e.target.value)}
                >
                  <option value="grid">Grid View</option>
                  <option value="list">List View</option>
                </Select>
                <FormHelperText>Default view when the application starts</FormHelperText>
              </FormControl>

              <FormControl>
                <FormLabel>Items Per Page</FormLabel>
                <NumberInput
                  value={settings.itemsPerPage}
                  onChange={(_, value) => handleSettingChange('itemsPerPage', value)}
                  min={10}
                  max={200}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <FormHelperText>Number of programs to display per page</FormHelperText>
              </FormControl>

              <HStack spacing={6}>
                <FormControl>
                  <FormLabel>Show Architecture</FormLabel>
                  <Switch
                    isChecked={settings.showArchitecture}
                    onChange={(e) => handleSettingChange('showArchitecture', e.target.checked)}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Show Install Date</FormLabel>
                  <Switch
                    isChecked={settings.showInstallDate}
                    onChange={(e) => handleSettingChange('showInstallDate', e.target.checked)}
                  />
                </FormControl>
              </HStack>
            </VStack>
          </TabPanel>

          {/* Custom Icons Tab */}
          <TabPanel>
            <VStack spacing={6} align="stretch">
              <Text fontSize="lg" fontWeight="bold">Custom Icon Management</Text>
              
              <Alert status="info">
                <AlertIcon />
                <Box>
                  <AlertTitle>Custom Icons</AlertTitle>
                  <AlertDescription>
                    Add your own icons for applications when automatic detection fails or you want to override the default icon.
                  </AlertDescription>
                </Box>
              </Alert>

              <FormControl>
                <FormLabel>Enable Custom Icons</FormLabel>
                <Switch
                  isChecked={settings.enableCustomIcons}
                  onChange={(e) => handleSettingChange('enableCustomIcons', e.target.checked)}
                />
                <FormHelperText>Allow custom icons to override automatically detected icons</FormHelperText>
              </FormControl>

              <FormControl>
                <FormLabel>Custom Icons Directory</FormLabel>
                <Input
                  value={settings.customIconDirectory}
                  onChange={(e) => handleSettingChange('customIconDirectory', e.target.value)}
                  placeholder="custom_icons"
                />
                <FormHelperText>Directory where custom icons are stored (relative to app data directory)</FormHelperText>
              </FormControl>

              <Box p={4} borderWidth="1px" borderRadius="md" bg="blue.50">
                <Text fontSize="sm" color="blue.700">
                  <strong>How to use Custom Icons:</strong>
                  <br />• Right-click on any program in the list and select "Set Custom Icon"
                  <br />• Supported formats: PNG, ICO, SVG
                  <br />• Icons will be automatically resized to fit the display
                  <br />• Custom icons take priority over automatically detected icons
                </Text>
              </Box>

              <HStack spacing={3}>
                <Button 
                  onClick={() => {
                    invoke('open_custom_icons_directory')
                      .then(() => {
                        toast({
                          title: 'Directory Opened',
                          description: 'Custom icons directory opened in file explorer',
                          status: 'success',
                          duration: 2000,
                        });
                      })
                      .catch((error) => {
                        toast({
                          title: 'Error',
                          description: `Failed to open directory: ${error}`,
                          status: 'error',
                          duration: 3000,
                        });
                      });
                  }}
                  colorScheme="blue"
                  size="sm"
                >
                  Open Icons Directory
                </Button>
                <Button 
                  onClick={() => {
                    // TODO: Implement refresh custom icons list
                    toast({
                      title: 'Refresh',
                      description: 'Custom icons list refreshed',
                      status: 'info',
                      duration: 2000,
                    });
                  }}
                  size="sm"
                >
                  Refresh List
                </Button>
              </HStack>
            </VStack>
          </TabPanel>

          {/* Export Tab */}
          <TabPanel>
            <VStack spacing={6} align="stretch">
              <Text fontSize="lg" fontWeight="bold">Export Settings</Text>
              
              <FormControl>
                <FormLabel>Default Export Format</FormLabel>
                <Select
                  value={settings.defaultExportFormat}
                  onChange={(e) => handleSettingChange('defaultExportFormat', e.target.value)}
                >
                  <option value="CSV">CSV</option>
                  <option value="HTML">HTML</option>
                  <option value="XML">XML</option>
                  <option value="TXT">Text</option>
                </Select>
                <FormHelperText>Default format for program list exports</FormHelperText>
              </FormControl>

              <FormControl>
                <FormLabel>Include Advanced Details</FormLabel>
                <Switch
                  isChecked={settings.includeAdvancedDetails}
                  onChange={(e) => handleSettingChange('includeAdvancedDetails', e.target.checked)}
                />
                <FormHelperText>Include registry details and advanced information in exports</FormHelperText>
              </FormControl>
            </VStack>
          </TabPanel>

          {/* VF Logs Tab */}
          <TabPanel>
            <VStack spacing={6} align="stretch">
              <Text fontSize="lg" fontWeight="bold">VF Deployment Logs</Text>
              
              <Alert status="info">
                <AlertIcon />
                <Box>
                  <AlertTitle>VF Log Viewer</AlertTitle>
                  <AlertDescription>
                    Configure settings for viewing VF deployment logs directly in the application.
                  </AlertDescription>
                </Box>
              </Alert>

              <FormControl>
                <FormLabel>Enable VF Log Viewer</FormLabel>
                <Switch
                  isChecked={settings.enableVfLogViewer}
                  onChange={(e) => handleSettingChange('enableVfLogViewer', e.target.checked)}
                />
                <FormHelperText>Enable viewing of VF deployment logs in program details</FormHelperText>
              </FormControl>

              <FormControl>
                <FormLabel>VF Log Directory Path</FormLabel>
                <Input
                  value={settings.vfLogPath}
                  onChange={(e) => handleSettingChange('vfLogPath', e.target.value)}
                  placeholder="C:\Windows\VCLogs"
                />
                <FormHelperText>Directory path where VF deployment logs are stored</FormHelperText>
              </FormControl>

              <FormControl>
                <FormLabel>Maximum Log File Size (MB)</FormLabel>
                <NumberInput
                  value={settings.logViewerMaxFileSize}
                  onChange={(_, value) => handleSettingChange('logViewerMaxFileSize', value)}
                  min={1}
                  max={100}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <FormHelperText>Maximum file size to load in the log viewer (larger files will show a warning)</FormHelperText>
              </FormControl>

              <Box p={4} borderWidth="1px" borderRadius="md" bg="blue.50">
                <Text fontSize="sm" color="blue.700">
                  <strong>Note:</strong> The VF log viewer will automatically detect and display log files 
                  for VF-deployed applications. Log files are typically named with the application 
                  identifier and timestamp.
                </Text>
              </Box>
            </VStack>
          </TabPanel>

          {/* CLI Tab */}
          <TabPanel>
            <CLIPanel />
          </TabPanel>

          {/* Help Tab */}
          <TabPanel>
            <HelpPanel />
          </TabPanel>

          {/* Advanced Tab */}
          <TabPanel>
            <VStack spacing={6} align="stretch">
              <Text fontSize="lg" fontWeight="bold">Advanced Features</Text>
              
              <Alert status="info">
                <AlertIcon />
                <Box>
                  <AlertTitle>Coming Soon!</AlertTitle>
                  <AlertDescription>
                    These features are planned for future releases. Enable them to see preview options.
                  </AlertDescription>
                </Box>
              </Alert>

              <FormControl>
                <FormLabel>
                  Remote Computer Scanning
                  <Badge ml={2} colorScheme="blue" variant="outline">Planned</Badge>
                </FormLabel>
                <Switch
                  isChecked={settings.enableRemoteScanning}
                  onChange={(e) => handleSettingChange('enableRemoteScanning', e.target.checked)}
                  isDisabled
                />
                <FormHelperText>Scan programs on remote computers over the network</FormHelperText>
              </FormControl>

              <FormControl>
                <FormLabel>
                  External Drive Scanning
                  <Badge ml={2} colorScheme="blue" variant="outline">Planned</Badge>
                </FormLabel>
                <Switch
                  isChecked={settings.enableExternalDrives}
                  onChange={(e) => handleSettingChange('enableExternalDrives', e.target.checked)}
                  isDisabled
                />
                <FormHelperText>Scan programs on external drives and USB devices</FormHelperText>
              </FormControl>

              <FormControl>
                <FormLabel>
                  Command Line Interface
                  <Badge ml={2} colorScheme="blue" variant="outline">Planned</Badge>
                </FormLabel>
                <Switch
                  isChecked={settings.enableCLI}
                  onChange={(e) => handleSettingChange('enableCLI', e.target.checked)}
                  isDisabled
                />
                <FormHelperText>Enable command-line interface for automation and scripting</FormHelperText>
              </FormControl>

              <Divider />

              <HStack spacing={3}>
                <Button onClick={resetToDefaults} colorScheme="orange" size="sm">
                  Reset to Defaults
                </Button>
                <Button 
                  onClick={() => {
                    const settingsJson = JSON.stringify(settings, null, 2);
                    navigator.clipboard.writeText(settingsJson);
                    toast({
                      title: 'Settings Copied',
                      description: 'Current settings have been copied to clipboard',
                      status: 'success',
                      duration: 2000,
                    });
                  }} 
                  size="sm"
                >
                  Copy Settings
                </Button>
              </HStack>
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};
