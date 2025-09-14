import React, { useState } from 'react';
import {
  Box,
  VStack,
  Text,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Badge,
  Code,
  Divider,
  List,
  ListItem,
  ListIcon,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
} from '@chakra-ui/react';
import { CheckIcon } from '@chakra-ui/icons';
import { invoke } from '@tauri-apps/api/tauri';

export const HelpPanel: React.FC = () => {
  const [debugStatus, setDebugStatus] = useState<string>('');
  const [isDebugging, setIsDebugging] = useState(false);

  const runVFIconDebug = async () => {
    setIsDebugging(true);
    setDebugStatus('Running VF icon debug...');
    
    try {
      const result = await invoke('debug_vf_icons_to_file');
      setDebugStatus(`✅ ${result}`);
    } catch (error) {
      setDebugStatus(`❌ Debug failed: ${error}`);
    } finally {
      setIsDebugging(false);
    }
  };

  return (
    <Box p={4} borderWidth="1px" borderRadius="lg" bg="white" shadow="sm">
      <VStack spacing={6} align="stretch">
        <Text fontSize="xl" fontWeight="bold" textAlign="center">
          SoftwareScope Help & Documentation
        </Text>

        <Accordion allowMultiple>
          {/* Getting Started */}
          <AccordionItem>
            <h2>
              <AccordionButton>
                <Box flex="1" textAlign="left" fontWeight="semibold">
                  Getting Started
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <VStack spacing={4} align="stretch">
                <Text>
                  SoftwareScope is a comprehensive Windows program management tool that helps you 
                  discover, analyze, and manage installed software on your system.
                </Text>
                
                <Box>
                  <Text fontWeight="semibold" mb={2}>Key Features:</Text>
                  <List spacing={2}>
                    <ListItem>
                      <ListIcon as={CheckIcon} color="green.500" />
                      Complete program inventory with detailed information
                    </ListItem>
                    <ListItem>
                      <ListIcon as={CheckIcon} color="green.500" />
                      Advanced search and filtering capabilities
                    </ListItem>
                    <ListItem>
                      <ListIcon as={CheckIcon} color="green.500" />
                      Program icon display with fallback system
                    </ListItem>
                    <ListItem>
                      <ListIcon as={CheckIcon} color="green.500" />
                      Export functionality in multiple formats
                    </ListItem>
                    <ListItem>
                      <ListIcon as={CheckIcon} color="green.500" />
                      Performance-optimized with lazy loading
                    </ListItem>
                  </List>
                </Box>

                <Box>
                  <Text fontWeight="semibold" mb={2}>First Steps:</Text>
                  <List spacing={1}>
                    <ListItem>1. Launch the application - it will automatically scan your system</ListItem>
                    <ListItem>2. Use the search bar to find specific programs</ListItem>
                    <ListItem>3. Click on any program card to view detailed information</ListItem>
                    <ListItem>4. Use filters to narrow down results by publisher, date, or type</ListItem>
                    <ListItem>5. Export your program list using the Export button</ListItem>
                  </List>
                </Box>
              </VStack>
            </AccordionPanel>
          </AccordionItem>

          {/* Interface Guide */}
          <AccordionItem>
            <h2>
              <AccordionButton>
                <Box flex="1" textAlign="left" fontWeight="semibold">
                  Interface Guide
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <VStack spacing={4} align="stretch">
                <Box>
                  <Text fontWeight="semibold" mb={2}>Main Interface:</Text>
                  <List spacing={2}>
                    <ListItem><strong>Search Bar:</strong> Search programs by name, publisher, or version</ListItem>
                    <ListItem><strong>Filters:</strong> Filter by publisher, installation date, program type, and architecture</ListItem>
                    <ListItem><strong>Sort Controls:</strong> Sort by name, publisher, or version (ascending/descending)</ListItem>
                    <ListItem><strong>Program Grid:</strong> Displays programs in card format with icons and key information</ListItem>
                    <ListItem><strong>Export Options:</strong> Quick export or detailed export menu</ListItem>
                  </List>
                </Box>

                <Box>
                  <Text fontWeight="semibold" mb={2}>Program Details Modal:</Text>
                  <List spacing={2}>
                    <ListItem><strong>Basic Information:</strong> Name, publisher, version, installation date</ListItem>
                    <ListItem><strong>Installation Details:</strong> Install source, installer name, estimated size</ListItem>
                    <ListItem><strong>Uninstall Information:</strong> Uninstall commands and registry paths</ListItem>
                    <ListItem><strong>Advanced Details:</strong> Registry information, file paths, and system data</ListItem>
                  </List>
                </Box>

                <Box>
                  <Text fontWeight="semibold" mb={2}>Settings Panel:</Text>
                  <List spacing={2}>
                    <ListItem><strong>Cache & Performance:</strong> Icon caching, lazy loading, performance settings</ListItem>
                    <ListItem><strong>Display:</strong> View preferences, information display options</ListItem>
                    <ListItem><strong>Export:</strong> Default export format and advanced details</ListItem>
                    <ListItem><strong>CLI:</strong> Command-line interface (preview mode)</ListItem>
                    <ListItem><strong>Advanced:</strong> Future features and system settings</ListItem>
                  </List>
                </Box>
              </VStack>
            </AccordionPanel>
          </AccordionItem>

          {/* Search and Filtering */}
          <AccordionItem>
            <h2>
              <AccordionButton>
                <Box flex="1" textAlign="left" fontWeight="semibold">
                  Search and Filtering
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <VStack spacing={4} align="stretch">
                <Box>
                  <Text fontWeight="semibold" mb={2}>Search Tips:</Text>
                  <List spacing={2}>
                    <ListItem>• Use multiple words to narrow results (e.g., "Microsoft Office")</ListItem>
                    <ListItem>• Search is case-insensitive and matches partial text</ListItem>
                    <ListItem>• Searches across program name, publisher, and version</ListItem>
                    <ListItem>• Results update in real-time as you type</ListItem>
                  </List>
                </Box>

                <Box>
                  <Text fontWeight="semibold" mb={2}>Filter Options:</Text>
                  <List spacing={2}>
                    <ListItem><strong>Publisher:</strong> Filter by software publisher/company</ListItem>
                    <ListItem><strong>Installation Date:</strong> Last 7/30/90 days or custom range</ListItem>
                    <ListItem><strong>Program Type:</strong> Applications, System Components, or Updates</ListItem>
                    <ListItem><strong>Architecture:</strong> 32-bit or 64-bit programs</ListItem>
                  </List>
                </Box>

                <Box>
                  <Text fontWeight="semibold" mb={2}>Sorting:</Text>
                  <Text>Click on sort buttons to change the order. Click again to reverse direction.</Text>
                </Box>
              </VStack>
            </AccordionPanel>
          </AccordionItem>

          {/* Export Features */}
          <AccordionItem>
            <h2>
              <AccordionButton>
                <Box flex="1" textAlign="left" fontWeight="semibold">
                  Export Features
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <VStack spacing={4} align="stretch">
                <Box>
                  <Text fontWeight="semibold" mb={2}>Export Formats:</Text>
                  <List spacing={2}>
                    <ListItem><strong>CSV:</strong> Comma-separated values for Excel or database import</ListItem>
                    <ListItem><strong>HTML:</strong> Formatted web page with styling and icons</ListItem>
                    <ListItem><strong>XML:</strong> Structured data format for data exchange</ListItem>
                    <ListItem><strong>Text:</strong> Plain text format for simple documentation</ListItem>
                  </List>
                </Box>

                <Box>
                  <Text fontWeight="semibold" mb={2}>Export Options:</Text>
                  <List spacing={2}>
                    <ListItem>• Quick Export: Uses your default format setting</ListItem>
                    <ListItem>• Advanced Details: Include registry information and system data</ListItem>
                    <ListItem>• Filtered Results: Only exports currently visible/filtered programs</ListItem>
                  </List>
                </Box>

                <Box>
                  <Text fontWeight="semibold" mb={2}>Use Cases:</Text>
                  <List spacing={2}>
                    <ListItem>• IT documentation and software audits</ListItem>
                    <ListItem>• System migration planning</ListItem>
                    <ListItem>• Compliance reporting</ListItem>
                    <ListItem>• Software inventory management</ListItem>
                  </List>
                </Box>
              </VStack>
            </AccordionPanel>
          </AccordionItem>

          {/* Performance and Settings */}
          <AccordionItem>
            <h2>
              <AccordionButton>
                <Box flex="1" textAlign="left" fontWeight="semibold">
                  Performance and Settings
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <VStack spacing={4} align="stretch">
                <Box>
                  <Text fontWeight="semibold" mb={2}>Performance Features:</Text>
                  <List spacing={2}>
                    <ListItem><strong>Lazy Loading:</strong> Icons load only when visible (recommended)</ListItem>
                    <ListItem><strong>Icon Caching:</strong> 24-hour cache for local icons, 7-day for fallback icons</ListItem>
                    <ListItem><strong>Debounced Search:</strong> Reduces processing during typing</ListItem>
                    <ListItem><strong>Optimized Scanning:</strong> Efficient registry access and data processing</ListItem>
                  </List>
                </Box>

                <Box>
                  <Text fontWeight="semibold" mb={2}>Icon System:</Text>
                  <List spacing={2}>
                    <ListItem>• First tries to load the program's local icon</ListItem>
                    <ListItem>• Falls back to CDN icons for popular applications</ListItem>
                    <ListItem>• Uses generic icons based on program type as final fallback</ListItem>
                    <ListItem>• All icons are cached for better performance</ListItem>
                  </List>
                </Box>

                <Box>
                  <Text fontWeight="semibold" mb={2}>Settings Recommendations:</Text>
                  <List spacing={2}>
                    <ListItem>• Keep lazy loading enabled for best performance</ListItem>
                    <ListItem>• Enable fallback icons for better visual experience</ListItem>
                    <ListItem>• Adjust cache duration based on your usage patterns</ListItem>
                    <ListItem>• Use appropriate items per page for your system</ListItem>
                  </List>
                </Box>
              </VStack>
            </AccordionPanel>
          </AccordionItem>

          {/* CLI Preview */}
          <AccordionItem>
            <h2>
              <AccordionButton>
                <Box flex="1" textAlign="left" fontWeight="semibold">
                  Command Line Interface (Preview)
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <VStack spacing={4} align="stretch">
                <Badge colorScheme="blue" variant="outline" alignSelf="flex-start">
                  Coming Soon
                </Badge>
                
                <Text>
                  SoftwareScope will include a powerful command-line interface for automation 
                  and scripting. Currently in preview mode with mock responses.
                </Text>

                <Box>
                  <Text fontWeight="semibold" mb={2}>Planned CLI Commands:</Text>
                  <List spacing={2}>
                    <ListItem><Code>scan</Code> - Scan installed programs with various options</ListItem>
                    <ListItem><Code>export</Code> - Export program lists in different formats</ListItem>
                    <ListItem><Code>remote</Code> - Scan remote computers over the network</ListItem>
                    <ListItem><Code>help</Code> - Show command help and usage information</ListItem>
                  </List>
                </Box>

                <Box>
                  <Text fontWeight="semibold" mb={2}>Example Usage (Future):</Text>
                  <Code display="block" p={2} bg="gray.50" borderRadius="md">
                    software-scope scan --format json --output programs.json<br/>
                    software-scope export --format csv --advanced<br/>
                    software-scope scan --remote 192.168.1.100
                  </Code>
                </Box>
              </VStack>
            </AccordionPanel>
          </AccordionItem>

          {/* Troubleshooting */}
          <AccordionItem>
            <h2>
              <AccordionButton>
                <Box flex="1" textAlign="left" fontWeight="semibold">
                  Troubleshooting
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <VStack spacing={4} align="stretch">
                <Box>
                  <Text fontWeight="semibold" mb={2}>Common Issues:</Text>
                  <List spacing={2}>
                    <ListItem><strong>Slow Loading:</strong> Enable lazy loading in settings, clear icon cache</ListItem>
                    <ListItem><strong>Missing Icons:</strong> Check fallback icons setting, clear cache and refresh</ListItem>
                    <ListItem><strong>Export Errors:</strong> Ensure you have write permissions to the target directory</ListItem>
                    <ListItem><strong>Search Not Working:</strong> Try different search terms, check filters</ListItem>
                  </List>
                </Box>

                <Box>
                  <Text fontWeight="semibold" mb={2}>Performance Tips:</Text>
                  <List spacing={2}>
                    <ListItem>• Clear icon cache periodically if experiencing memory issues</ListItem>
                    <ListItem>• Use filters to reduce the number of displayed programs</ListItem>
                    <ListItem>• Disable lazy loading only if you have a very fast system</ListItem>
                    <ListItem>• Close other applications if scanning seems slow</ListItem>
                  </List>
                </Box>

                <Box>
                  <Text fontWeight="semibold" mb={2}>Getting Help:</Text>
                  <Text>
                    If you encounter issues not covered here, check the settings panel for 
                    cache management tools and performance monitoring. The application includes 
                    built-in debugging tools accessible through the settings.
                  </Text>
                </Box>
              </VStack>
            </AccordionPanel>
          </AccordionItem>

          {/* VF Icon Debug */}
          <AccordionItem>
            <h2>
              <AccordionButton>
                <Box flex="1" textAlign="left" fontWeight="semibold">
                  VF Icon Debug
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <VStack spacing={4} align="stretch">
                <Alert status="info">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Debug VF Managed App Icons</AlertTitle>
                    <AlertDescription>
                      This tool helps diagnose why VF managed apps might not be showing correct icons.
                      It will create a debug report file that you can check.
                    </AlertDescription>
                  </Box>
                </Alert>

                <Button 
                  colorScheme="purple" 
                  onClick={runVFIconDebug}
                  isLoading={isDebugging}
                  loadingText="Running Debug..."
                  leftIcon={isDebugging ? <Spinner size="sm" /> : undefined}
                >
                  Run VF Icon Debug
                </Button>

                {debugStatus && (
                  <Box p={3} bg="gray.50" borderRadius="md">
                    <Text fontSize="sm" fontFamily="mono">
                      {debugStatus}
                    </Text>
                  </Box>
                )}

                <Box>
                  <Text fontWeight="semibold" mb={2}>What this debug tool checks:</Text>
                  <List spacing={2}>
                    <ListItem>• Whether any VF managed apps are detected (looking for APPID in Comments field)</ListItem>
                    <ListItem>• Icon paths for detected VF apps</ListItem>
                    <ListItem>• Publisher information</ListItem>
                    <ListItem>• Sample comments from apps to help identify detection issues</ListItem>
                  </List>
                </Box>

                <Box>
                  <Text fontWeight="semibold" mb={2}>After running debug:</Text>
                  <Text fontSize="sm">
                    Check the <Code>vf_icon_debug.txt</Code> file in the application directory for detailed results.
                    This file will help identify why VF managed apps aren't showing correct icons.
                  </Text>
                </Box>
              </VStack>
            </AccordionPanel>
          </AccordionItem>

          {/* Future Features */}
          <AccordionItem>
            <h2>
              <AccordionButton>
                <Box flex="1" textAlign="left" fontWeight="semibold">
                  Future Features
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <VStack spacing={4} align="stretch">
                <Badge colorScheme="green" variant="outline" alignSelf="flex-start">
                  Roadmap
                </Badge>
                
                <Box>
                  <Text fontWeight="semibold" mb={2}>Planned Features:</Text>
                  <List spacing={2}>
                    <ListItem><strong>Remote Scanning:</strong> Scan programs on other computers over the network</ListItem>
                    <ListItem><strong>External Drive Support:</strong> Scan programs on USB drives and external storage</ListItem>
                    <ListItem><strong>Scan Profiles:</strong> Save and reuse different scanning configurations</ListItem>
                    <ListItem><strong>Full CLI:</strong> Complete command-line interface for automation</ListItem>
                    <ListItem><strong>Batch Operations:</strong> Bulk uninstall, update, or manage programs</ListItem>
                    <ListItem><strong>Advanced Analytics:</strong> Program usage statistics and insights</ListItem>
                  </List>
                </Box>

                <Box>
                  <Text fontWeight="semibold" mb={2}>Integration Features:</Text>
                  <List spacing={2}>
                    <ListItem>• Windows Package Manager (winget) integration</ListItem>
                    <ListItem>• Chocolatey package manager support</ListItem>
                    <ListItem>• System restore point creation</ListItem>
                    <ListItem>• Automated backup and restore</ListItem>
                  </List>
                </Box>
              </VStack>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>

        <Divider />

        <Box textAlign="center" color="gray.600">
          <Text fontSize="sm">
            SoftwareScope v1.0.0 - Windows Program Management Tool
          </Text>
          <Text fontSize="xs" mt={1}>
            Built with Tauri, React, and Rust for optimal performance
          </Text>
        </Box>
      </VStack>
    </Box>
  );
};
