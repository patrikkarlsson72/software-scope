import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  Badge,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Divider,
  Tooltip,
  IconButton,
  Flex,
} from '@chakra-ui/react';
import { SearchIcon, DownloadIcon, ExternalLinkIcon, TimeIcon } from '@chakra-ui/icons';
import { invoke } from '@tauri-apps/api/tauri';
import { useSettings } from '../../contexts/SettingsContext';

interface LogFileInfo {
  filename: string;
  full_path: string;
  size: number;
  created: string;
  modified: string;
  program_name?: string;
  is_vf_log: boolean;
}

interface LogViewerConfig {
  log_directory: string;
  max_file_size_mb: number;
  enabled: boolean;
}

interface LogViewerProps {
  programName?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const LogViewer: React.FC<LogViewerProps> = ({ programName, isOpen, onClose }) => {
  const { settings } = useSettings();
  const toast = useToast();
  const [logFiles, setLogFiles] = useState<LogFileInfo[]>([]);
  const [selectedFile, setSelectedFile] = useState<LogFileInfo | null>(null);
  const [logContent, setLogContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('date');
  const [filterBy, setFilterBy] = useState<'all' | 'vf' | 'program'>('all');
  const [showLineNumbers, setShowLineNumbers] = useState(true);

  const config: LogViewerConfig = {
    log_directory: settings.vfLogPath,
    max_file_size_mb: settings.logViewerMaxFileSize,
    enabled: settings.enableVfLogViewer,
  };

  // Load log files when modal opens
  useEffect(() => {
    if (isOpen && config.enabled) {
      loadLogFiles();
    }
  }, [isOpen, config.enabled, config.log_directory]);

  const loadLogFiles = async () => {
    setIsLoading(true);
    try {
      const files = await invoke<LogFileInfo[]>('scan_vf_log_directory', { config });
      setLogFiles(files);
    } catch (error) {
      toast({
        title: 'Error Loading Log Files',
        description: `Failed to scan log directory: ${error}`,
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadLogContent = async (file: LogFileInfo) => {
    setIsLoadingContent(true);
    setSelectedFile(file);
    try {
      const content = await invoke<string>('read_log_file', { 
        filePath: file.full_path,
        maxLines: 1000 // Limit to last 1000 lines for performance
      });
      setLogContent(content);
    } catch (error) {
      const errorMessage = String(error);
      let userFriendlyMessage = 'Failed to read log file';
      
      if (errorMessage.includes('UTF-8')) {
        userFriendlyMessage = 'File contains non-UTF-8 characters. Attempting to decode with alternative encodings...';
      } else if (errorMessage.includes('permission')) {
        userFriendlyMessage = 'Permission denied. The file may be in use by another process.';
      } else if (errorMessage.includes('not found')) {
        userFriendlyMessage = 'File not found. It may have been moved or deleted.';
      }
      
      toast({
        title: 'Error Loading Log Content',
        description: userFriendlyMessage,
        status: 'warning',
        duration: 5000,
      });
      setLogContent('');
    } finally {
      setIsLoadingContent(false);
    }
  };

  const filteredAndSortedFiles = useMemo(() => {
    let filtered = logFiles;

    // Filter by program name if specified
    if (programName) {
      // Normalize the program name for better matching
      const normalizedProgramName = programName
        .toLowerCase()
        .replace(/[()]/g, '') // Remove parentheses
        .replace(/\s+/g, '') // Remove spaces
        .replace(/[^a-z0-9]/g, ''); // Keep only alphanumeric characters
      
      filtered = filtered.filter(file => {
        // Check if the program name matches (case-insensitive)
        const programMatch = file.program_name?.toLowerCase().includes(programName.toLowerCase()) ||
                           file.filename.toLowerCase().includes(programName.toLowerCase());
        
        // Also check normalized versions for better matching
        const normalizedFileProgram = file.program_name?.toLowerCase()
          .replace(/[()]/g, '')
          .replace(/\s+/g, '')
          .replace(/[^a-z0-9]/g, '') || '';
        
        const normalizedFilename = file.filename.toLowerCase()
          .replace(/[()]/g, '')
          .replace(/\s+/g, '')
          .replace(/[^a-z0-9]/g, '');
        
        const normalizedMatch = normalizedFileProgram.includes(normalizedProgramName) ||
                               normalizedFilename.includes(normalizedProgramName);
        
        return programMatch || normalizedMatch;
      });
    }

    // Filter by type
    if (filterBy === 'vf') {
      filtered = filtered.filter(file => file.is_vf_log);
    } else if (filterBy === 'program') {
      filtered = filtered.filter(file => file.program_name);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(file =>
        file.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.program_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.filename.localeCompare(b.filename);
        case 'size':
          return b.size - a.size;
        case 'date':
        default:
          return new Date(b.modified).getTime() - new Date(a.modified).getTime();
      }
    });

    return filtered;
  }, [logFiles, programName, searchTerm, sortBy, filterBy]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };


  // Check if a line contains error patterns
  const isErrorLine = (line: string): boolean => {
    const errorPatterns = [
      /error/i,
      /failed/i,
      /exception/i,
      /fatal/i,
      /critical/i,
      /type="3"/, // CMTrace error type
      /\[ERROR\]/i,
      /\[FATAL\]/i
    ];
    
    return errorPatterns.some(pattern => pattern.test(line));
  };

  const downloadLogFile = async (file: LogFileInfo) => {
    try {
      toast({
        title: 'Download Started',
        description: `Preparing ${file.filename} for download...`,
        status: 'info',
        duration: 2000,
      });

      // Read the file content
      const content = await invoke<string>('read_log_file', { 
        filePath: file.full_path,
        maxLines: undefined // Get the full file
      });

      // Create a blob and download it
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      
      // Create a temporary download link
      const link = document.createElement('a');
      link.href = url;
      link.download = file.filename;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: 'Download Complete',
        description: `${file.filename} has been downloaded to your Downloads folder`,
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Download Failed',
        description: `Failed to download ${file.filename}: ${error}`,
        status: 'error',
        duration: 5000,
      });
    }
  };

  const openInExternalEditor = async (file: LogFileInfo) => {
    try {
      // First, copy the file to a temporary location that's accessible
      const tempPath = await invoke<string>('copy_file_to_temp', { 
        sourcePath: file.full_path,
        filename: file.filename
      });

      // Show a dialog to let user choose the editor
      const editorChoice = await new Promise<string>((resolve) => {
        const modal = document.createElement('div');
        modal.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
        `;
        
        const dialog = document.createElement('div');
        dialog.style.cssText = `
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
          max-width: 400px;
          width: 90%;
        `;
        
        dialog.innerHTML = `
          <h3 style="margin: 0 0 15px 0; color: #333;">Choose Editor</h3>
          <p style="margin: 0 0 15px 0; color: #666;">Select which tool to open the log file with:</p>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            <button data-editor="cmtrace" style="padding: 10px; border: 1px solid #ddd; background: #f8f9fa; border-radius: 4px; cursor: pointer;">
              📊 CMTrace (Configuration Manager Trace)
            </button>
            <button data-editor="notepad++" style="padding: 10px; border: 1px solid #ddd; background: #f8f9fa; border-radius: 4px; cursor: pointer;">
              📝 Notepad++
            </button>
            <button data-editor="notepad" style="padding: 10px; border: 1px solid #ddd; background: #f8f9fa; border-radius: 4px; cursor: pointer;">
              📄 Notepad
            </button>
            <button data-editor="vscode" style="padding: 10px; border: 1px solid #ddd; background: #f8f9fa; border-radius: 4px; cursor: pointer;">
              💻 Visual Studio Code
            </button>
            <button data-editor="default" style="padding: 10px; border: 1px solid #ddd; background: #f8f9fa; border-radius: 4px; cursor: pointer;">
              🔧 Default System Editor
            </button>
          </div>
          <div style="margin-top: 15px; text-align: right;">
            <button id="cancel-btn" style="padding: 8px 16px; border: 1px solid #ddd; background: white; border-radius: 4px; cursor: pointer; margin-right: 10px;">
              Cancel
            </button>
          </div>
        `;
        
        modal.appendChild(dialog);
        document.body.appendChild(modal);
        
        // Handle button clicks
        const buttons = dialog.querySelectorAll('button[data-editor]');
        buttons.forEach(btn => {
          btn.addEventListener('click', () => {
            const editor = btn.getAttribute('data-editor');
            document.body.removeChild(modal);
            resolve(editor || 'default');
          });
        });
        
        // Handle cancel
        dialog.querySelector('#cancel-btn')?.addEventListener('click', () => {
          document.body.removeChild(modal);
          resolve('cancel');
        });
      });

      if (editorChoice === 'cancel') {
        return;
      }

      // Open the file with the selected editor
      await invoke('open_file_with_editor', {
        filePath: tempPath,
        editor: editorChoice
      });

      toast({
        title: 'File Opened',
        description: `Opening ${file.filename} with ${editorChoice === 'cmtrace' ? 'CMTrace' : editorChoice === 'notepad++' ? 'Notepad++' : editorChoice === 'vscode' ? 'VS Code' : editorChoice === 'notepad' ? 'Notepad' : 'default editor'}...`,
        status: 'success',
        duration: 3000,
      });

    } catch (error) {
      toast({
        title: 'Failed to Open File',
        description: `Could not open ${file.filename} in external editor: ${error}`,
        status: 'error',
        duration: 5000,
      });
    }
  };

  if (!config.enabled) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>VF Log Viewer</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Alert status="warning">
              <AlertIcon />
              <Box>
                <AlertTitle>VF Log Viewer Disabled</AlertTitle>
                <AlertDescription>
                  The VF Log Viewer is currently disabled in settings. Enable it in the Settings panel to view deployment logs.
                </AlertDescription>
              </Box>
            </Alert>
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl">
      <ModalOverlay />
      <ModalContent maxH="90vh">
        <ModalHeader>
          <HStack>
            <Text>VF Deployment Logs</Text>
            {programName && (
              <Badge colorScheme="blue" variant="subtle">
                {programName}
              </Badge>
            )}
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={4} align="stretch" h="70vh">
            {/* Controls */}
            <HStack spacing={4} wrap="wrap">
              <InputGroup maxW="300px">
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color="gray.300" />
                </InputLeftElement>
                <Input
                  placeholder="Search log files..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>

              <Select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as any)}
                maxW="150px"
              >
                <option value="all">All Files</option>
                <option value="vf">VF Logs</option>
                <option value="program">Program Logs</option>
              </Select>

              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                maxW="150px"
              >
                <option value="date">Sort by Date</option>
                <option value="name">Sort by Name</option>
                <option value="size">Sort by Size</option>
              </Select>

              <Button
                size="sm"
                variant={showLineNumbers ? "solid" : "outline"}
                colorScheme="blue"
                onClick={() => setShowLineNumbers(!showLineNumbers)}
              >
                {showLineNumbers ? "Hide Line Numbers" : "Show Line Numbers"}
              </Button>

              <Button
                size="sm"
                onClick={loadLogFiles}
                isLoading={isLoading}
                loadingText="Refreshing..."
              >
                Refresh
              </Button>
            </HStack>

            <Divider />

            {/* File List and Content */}
            <HStack spacing={4} align="stretch" flex="1" minH="0">
              {/* File List */}
              <Box 
                w="40%" 
                borderWidth="1px" 
                borderRadius="md" 
                p={3} 
                overflowY="auto" 
                maxH="100%"
                onWheel={(e) => {
                  e.stopPropagation();
                  const element = e.currentTarget;
                  const delta = e.deltaY;
                  element.scrollTop += delta;
                }}
              >
                <Text fontSize="sm" fontWeight="bold" mb={3} color="gray.600">
                  Log Files ({filteredAndSortedFiles.length})
                </Text>
                
                {isLoading ? (
                  <Flex justify="center" align="center" h="200px">
                    <Spinner />
                  </Flex>
                ) : filteredAndSortedFiles.length === 0 ? (
                  <Text color="gray.500" fontSize="sm">
                    No log files found
                  </Text>
                ) : (
                  <VStack spacing={2} align="stretch">
                    {filteredAndSortedFiles.map((file) => (
                      <Box
                        key={file.full_path}
                        p={3}
                        borderWidth="1px"
                        borderRadius="md"
                        cursor="pointer"
                        bg={selectedFile?.full_path === file.full_path ? "blue.50" : "white"}
                        borderColor={selectedFile?.full_path === file.full_path ? "blue.200" : "gray.200"}
                        _hover={{ bg: "gray.50" }}
                        onClick={() => loadLogContent(file)}
                      >
                        <VStack spacing={1} align="stretch">
                          <HStack justify="space-between">
                            <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
                              {file.filename}
                            </Text>
                            <HStack spacing={1}>
                              {file.is_vf_log && (
                                <Badge size="sm" colorScheme="green">VF</Badge>
                              )}
                              {file.program_name && (
                                <Badge size="sm" colorScheme="blue">App</Badge>
                              )}
                            </HStack>
                          </HStack>
                          
                          <HStack justify="space-between" fontSize="xs" color="gray.600">
                            <Text>{formatFileSize(file.size)}</Text>
                            <Text>{formatDate(file.modified)}</Text>
                          </HStack>
                          
                          {file.program_name && (
                            <Text fontSize="xs" color="blue.600" noOfLines={1}>
                              {file.program_name}
                            </Text>
                          )}
                        </VStack>
                      </Box>
                    ))}
                  </VStack>
                )}
              </Box>

              {/* Log Content */}
              <Box 
                w="60%" 
                borderWidth="1px" 
                borderRadius="md" 
                p={3} 
                overflowY="auto" 
                maxH="100%"
                onWheel={(e) => {
                  e.stopPropagation();
                  const element = e.currentTarget;
                  const delta = e.deltaY;
                  element.scrollTop += delta;
                }}
              >
                {selectedFile ? (
                  <VStack spacing={3} align="stretch">
                    <HStack justify="space-between">
                      <Text fontSize="sm" fontWeight="bold" color="gray.600">
                        {selectedFile.filename}
                      </Text>
                      <HStack spacing={2}>
                        <Tooltip label="Download Log File">
                          <IconButton
                            size="sm"
                            icon={<DownloadIcon />}
                            aria-label="Download"
                            onClick={() => downloadLogFile(selectedFile)}
                          />
                        </Tooltip>
                        <Tooltip label="Open in External Editor">
                          <IconButton
                            size="sm"
                            icon={<ExternalLinkIcon />}
                            aria-label="Open Externally"
                            onClick={() => openInExternalEditor(selectedFile)}
                          />
                        </Tooltip>
                      </HStack>
                    </HStack>

                    <Divider />

                    {isLoadingContent ? (
                      <Flex justify="center" align="center" h="200px">
                        <Spinner />
                      </Flex>
                    ) : logContent ? (
                      <Box
                        bg="gray.900"
                        color="gray.100"
                        p={4}
                        borderRadius="md"
                        fontFamily="mono"
                        fontSize="sm"
                        overflowX="auto"
                        maxH="400px"
                        overflowY="auto"
                        border="1px solid"
                        borderColor="gray.600"
                        onWheel={(e) => {
                          e.stopPropagation();
                          const element = e.currentTarget;
                          const delta = e.deltaY;
                          element.scrollTop += delta;
                        }}
                      >
                        <VStack spacing={0} align="stretch">
                          {logContent.split('\n').map((line, index) => {
                            const isError = isErrorLine(line);
                            const displayLine = showLineNumbers 
                              ? `${(index + 1).toString().padStart(4, ' ')}: ${line}`
                              : line;
                            
                            return (
                              <Text
                                key={index}
                                whiteSpace="pre-wrap"
                                color={isError ? "#ff6b6b" : "gray.100"}
                                lineHeight="1.4"
                                bg={isError ? "red.900" : "transparent"}
                                px={isError ? 2 : 0}
                                py={isError ? 1 : 0}
                                borderRadius={isError ? "sm" : "none"}
                              >
                                {displayLine}
                              </Text>
                            );
                          })}
                        </VStack>
                      </Box>
                    ) : (
                      <Alert status="info" borderRadius="md">
                        <AlertIcon />
                        <Box>
                          <AlertTitle>No Content Available</AlertTitle>
                          <AlertDescription>
                            This log file appears to be empty or could not be read. The file may be corrupted, 
                            in use by another process, or contain binary data that cannot be displayed as text.
                          </AlertDescription>
                        </Box>
                      </Alert>
                    )}

                    <HStack justify="space-between" fontSize="xs" color="gray.600">
                      <Text>
                        Size: {formatFileSize(selectedFile.size)} | 
                        Modified: {formatDate(selectedFile.modified)}
                      </Text>
                      <Text>
                        {logContent.split('\n').length} lines
                      </Text>
                    </HStack>
                  </VStack>
                ) : (
                  <Flex justify="center" align="center" h="200px">
                    <VStack spacing={2}>
                      <TimeIcon boxSize={8} color="gray.400" />
                      <Text color="gray.500" fontSize="sm">
                        Select a log file to view its contents
                      </Text>
                    </VStack>
                  </Flex>
                )}
              </Box>
            </HStack>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
