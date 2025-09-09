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
  Code,
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
      toast({
        title: 'Error Loading Log Content',
        description: `Failed to read log file: ${error}`,
        status: 'error',
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
      filtered = filtered.filter(file => 
        file.program_name?.toLowerCase().includes(programName.toLowerCase()) ||
        file.filename.toLowerCase().includes(programName.toLowerCase())
      );
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

  const downloadLogFile = async (file: LogFileInfo) => {
    try {
      // In a real implementation, you might want to copy the file to a user-accessible location
      toast({
        title: 'Download Started',
        description: `Preparing ${file.filename} for download...`,
        status: 'info',
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: 'Download Failed',
        description: `Failed to download ${file.filename}`,
        status: 'error',
        duration: 3000,
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
              <Box w="40%" borderWidth="1px" borderRadius="md" p={3} overflowY="auto" maxH="100%">
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
              <Box w="60%" borderWidth="1px" borderRadius="md" p={3} overflowY="auto" maxH="100%">
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
                            onClick={() => {
                              // In a real implementation, you might open the file in the default editor
                              toast({
                                title: 'Opening File',
                                description: `Opening ${selectedFile.filename} in external editor...`,
                                status: 'info',
                                duration: 2000,
                              });
                            }}
                          />
                        </Tooltip>
                      </HStack>
                    </HStack>

                    <Divider />

                    {isLoadingContent ? (
                      <Flex justify="center" align="center" h="200px">
                        <Spinner />
                      </Flex>
                    ) : (
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
                      >
                        <Code
                          display="block"
                          whiteSpace="pre-wrap"
                          bg="transparent"
                          color="inherit"
                          p={0}
                        >
                          {logContent || 'No content to display'}
                        </Code>
                      </Box>
                    )}

                    <HStack justify="space-between" fontSize="xs" color="gray.600">
                      <Text>
                        Size: {formatFileSize(selectedFile.size)} | 
                        Modified: {formatDate(selectedFile.modified)}
                      </Text>
                      <Text>
                        Showing last 1000 lines
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
