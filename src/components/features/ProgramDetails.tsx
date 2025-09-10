import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  Text,
  VStack,
  HStack,
  Badge,
  Grid,
  GridItem,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  Heading,
  useToast,
  Link,
  Collapse,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
} from '@chakra-ui/react';
import { ProgramInfo } from '../../types/ProgramInfo';
import { ExternalLinkIcon, ChevronDownIcon, ChevronUpIcon, ViewIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { ProgramIcon } from '../common/ProgramIcon';
import { LogViewer } from '../common/LogViewer';
import { useSettings } from '../../contexts/SettingsContext';


interface ProgramDetailsProps {
  program: ProgramInfo;
  isOpen: boolean;
  onClose: () => void;
}

export const ProgramDetails: React.FC<ProgramDetailsProps> = ({ program, isOpen, onClose }) => {
  const toast = useToast();
  const { settings } = useSettings();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isLogViewerOpen, setIsLogViewerOpen] = useState(false);
  const { isOpen: isUninstallOpen, onOpen: onUninstallOpen, onClose: onUninstallClose } = useDisclosure();
  const { isOpen: isModifyOpen, onOpen: onModifyOpen, onClose: onModifyClose } = useDisclosure();
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  const handleCopy = (text: string, what: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: `${what} copied to clipboard`,
      status: 'success',
      duration: 2000,
    });
  };

  // Format file size in human readable format
  const formatFileSize = (sizeInKB: number): string => {
    if (sizeInKB < 1024) {
      return `${sizeInKB} KB`;
    } else if (sizeInKB < 1024 * 1024) {
      return `${(sizeInKB / 1024).toFixed(1)} MB`;
    } else {
      return `${(sizeInKB / (1024 * 1024)).toFixed(1)} GB`;
    }
  };

  const handleUninstall = () => {
    if (program.uninstall_string) {
      // In a real implementation, you would execute the uninstall command
      // For now, we'll just show a toast
      toast({
        title: 'Uninstall Command',
        description: `Would execute: ${program.uninstall_string}`,
        status: 'info',
        duration: 5000,
      });
      onUninstallClose();
    }
  };

  const handleModify = () => {
    if (program.change_install_string) {
      // In a real implementation, you would execute the modify command
      // For now, we'll just show a toast
      toast({
        title: 'Modify Command',
        description: `Would execute: ${program.change_install_string}`,
        status: 'info',
        duration: 5000,
      });
      onModifyClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={showAdvanced ? "4xl" : "xl"}>
      <ModalOverlay />
      <ModalContent maxHeight="90vh" overflowY="auto">
        <ModalHeader>
          <HStack spacing={4} align="flex-start">
            <ProgramIcon 
              programName={program.name} 
              size="32px"
              publisher={program.publisher}
              iconPath={program.icon_path}
              programType={program.program_type}
            />
            <VStack align="stretch" spacing={2}>
              <Text>{program.name}</Text>
              <HStack spacing={2}>
                <Badge colorScheme="blue">{program.architecture}</Badge>
                <Badge colorScheme="green">{program.program_type}</Badge>
                <Badge 
                  colorScheme={
                    program.installation_source === 'System' ? 'blue' :
                    program.installation_source === 'User' ? 'green' :
                    'orange'
                  }
                >
                  {program.installation_source}
                </Badge>
                {program.is_windows_installer && (
                  <Badge colorScheme="purple">Windows Installer</Badge>
                )}
                {program.is_vf_deployed && (
                  <Badge colorScheme="purple" variant="solid" fontWeight="bold">VF Managed</Badge>
                )}
              </HStack>
            </VStack>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody pb={6}>
          <VStack align="stretch" spacing={6}>
            <Accordion allowMultiple>
              {/* Basic Information */}
              <AccordionItem>
                <h2>
                  <AccordionButton>
                    <Box flex="1" textAlign="left">
                      <Heading size="sm">Basic Information</Heading>
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                  <Grid templateColumns="120px 1fr" gap={3}>
                    {program.publisher && (
                      <>
                        <GridItem><Text color="gray.600">Publisher</Text></GridItem>
                        <GridItem><Text>{program.publisher}</Text></GridItem>
                      </>
                    )}
                    {program.version && (
                      <>
                        <GridItem><Text color="gray.600">Version</Text></GridItem>
                        <GridItem><Text>{program.version}</Text></GridItem>
                      </>
                    )}
                    {program.install_date && (
                      <>
                        <GridItem><Text color="gray.600">Install Date</Text></GridItem>
                        <GridItem>
                          <Text>
                            {new Date(
                              program.install_date.replace(
                                /(\d{4})(\d{2})(\d{2})/,
                                '$1-$2-$3'
                              )
                            ).toLocaleDateString()}
                          </Text>
                        </GridItem>
                      </>
                    )}
                    <GridItem><Text color="gray.600">Installation Source</Text></GridItem>
                    <GridItem>
                      <Badge 
                        colorScheme={
                          program.installation_source === 'System' ? 'blue' :
                          program.installation_source === 'User' ? 'green' :
                          'orange'
                        }
                      >
                        {program.installation_source}
                      </Badge>
                    </GridItem>
                  </Grid>
                </AccordionPanel>
              </AccordionItem>

              {/* Installation Information */}
              <AccordionItem>
                <h2>
                  <AccordionButton>
                    <Box flex="1" textAlign="left">
                      <Heading size="sm">Installation Information</Heading>
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                  <Grid templateColumns="140px 1fr" gap={3}>
                    {program.install_location && (
                      <>
                        <GridItem><Text color="gray.600" fontWeight="medium">Install Location</Text></GridItem>
                        <GridItem>
                          <HStack>
                            <Text fontSize="sm" fontFamily="monospace" wordBreak="break-all">
                              {program.install_location}
                            </Text>
                            <Button 
                              size="xs"
                              onClick={() => handleCopy(program.install_location!, 'Install location')}
                            >
                              Copy
                            </Button>
                          </HStack>
                        </GridItem>
                      </>
                    )}
                    {program.estimated_size && (
                      <>
                        <GridItem><Text color="gray.600" fontWeight="medium">Size</Text></GridItem>
                        <GridItem>
                          <Text>{formatFileSize(program.estimated_size)}</Text>
                        </GridItem>
                      </>
                    )}
                    {program.install_source && (
                      <>
                        <GridItem><Text color="gray.600" fontWeight="medium">Install Source</Text></GridItem>
                        <GridItem>
                          <HStack>
                            <Text fontSize="sm" fontFamily="monospace" wordBreak="break-all">
                              {program.install_source}
                            </Text>
                            <Button 
                              size="xs"
                              onClick={() => handleCopy(program.install_source!, 'Install source')}
                            >
                              Copy
                            </Button>
                          </HStack>
                        </GridItem>
                      </>
                    )}
                    {program.installer_name && (
                      <>
                        <GridItem><Text color="gray.600" fontWeight="medium">Installer</Text></GridItem>
                        <GridItem><Text>{program.installer_name}</Text></GridItem>
                      </>
                    )}
                    {program.msi_filename && (
                      <>
                        <GridItem><Text color="gray.600" fontWeight="medium">MSI File</Text></GridItem>
                        <GridItem>
                          <HStack>
                            <Text fontSize="sm" fontFamily="monospace">
                              {program.msi_filename}
                            </Text>
                            <Button 
                              size="xs"
                              onClick={() => handleCopy(program.msi_filename!, 'MSI filename')}
                            >
                              Copy
                            </Button>
                          </HStack>
                        </GridItem>
                      </>
                    )}
                    {program.release_type && (
                      <>
                        <GridItem><Text color="gray.600" fontWeight="medium">Release Type</Text></GridItem>
                        <GridItem><Text>{program.release_type}</Text></GridItem>
                      </>
                    )}
                    {program.language && (
                      <>
                        <GridItem><Text color="gray.600" fontWeight="medium">Language</Text></GridItem>
                        <GridItem><Text>{program.language}</Text></GridItem>
                      </>
                    )}
                    {program.icon_path && (
                      <>
                        <GridItem><Text color="gray.600" fontWeight="medium">Display Icon</Text></GridItem>
                        <GridItem>
                          <HStack>
                            <Text fontSize="sm" fontFamily="monospace" wordBreak="break-all">
                              {program.icon_path}
                            </Text>
                            <Button 
                              size="xs"
                              onClick={() => handleCopy(program.icon_path!, 'Icon path')}
                            >
                              Copy
                            </Button>
                          </HStack>
                        </GridItem>
                      </>
                    )}
                    <GridItem><Text color="gray.600" fontWeight="medium">Registry Path</Text></GridItem>
                    <GridItem>
                      <HStack>
                        <Text fontSize="sm" fontFamily="monospace" wordBreak="break-all">
                          {program.registry_path}
                        </Text>
                        <Button 
                          size="xs"
                          onClick={() => handleCopy(program.registry_path, 'Registry path')}
                        >
                          Copy
                        </Button>
                      </HStack>
                    </GridItem>
                  </Grid>
                </AccordionPanel>
              </AccordionItem>

              {/* Folder Information */}
              {(program.install_folder_created || program.install_folder_modified || program.install_folder_owner) && (
                <AccordionItem>
                  <h2>
                    <AccordionButton>
                      <Box flex="1" textAlign="left">
                        <Heading size="sm">Folder Information</Heading>
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                  </h2>
                  <AccordionPanel pb={4}>
                    <Grid templateColumns="140px 1fr" gap={3}>
                      {program.install_folder_created && (
                        <>
                          <GridItem><Text color="gray.600" fontWeight="medium">Folder Created</Text></GridItem>
                          <GridItem>
                            <Text>
                              {new Date(program.install_folder_created).toLocaleString()}
                            </Text>
                          </GridItem>
                        </>
                      )}
                      {program.install_folder_modified && (
                        <>
                          <GridItem><Text color="gray.600" fontWeight="medium">Folder Modified</Text></GridItem>
                          <GridItem>
                            <Text>
                              {new Date(program.install_folder_modified).toLocaleString()}
                            </Text>
                          </GridItem>
                        </>
                      )}
                      {program.install_folder_owner && (
                        <>
                          <GridItem><Text color="gray.600" fontWeight="medium">Folder Owner</Text></GridItem>
                          <GridItem>
                            <Text>{program.install_folder_owner}</Text>
                          </GridItem>
                        </>
                      )}
                    </Grid>
                  </AccordionPanel>
                </AccordionItem>
              )}

              {/* Uninstall Information */}
              {(program.uninstall_string || program.change_install_string || program.quiet_uninstall_string) && (
                <AccordionItem>
                  <h2>
                    <AccordionButton>
                      <Box flex="1" textAlign="left">
                        <Heading size="sm">Uninstall Information</Heading>
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                  </h2>
                  <AccordionPanel pb={4}>
                    <Grid templateColumns="140px 1fr" gap={3}>
                      {program.uninstall_string && (
                        <>
                          <GridItem><Text color="gray.600" fontWeight="medium">Uninstall Command</Text></GridItem>
                          <GridItem>
                            <HStack>
                              <Text fontSize="sm" fontFamily="monospace" wordBreak="break-all">
                                {program.uninstall_string}
                              </Text>
                              <Button 
                                size="xs"
                                onClick={() => handleCopy(program.uninstall_string!, 'Uninstall command')}
                              >
                                Copy
                              </Button>
                            </HStack>
                          </GridItem>
                        </>
                      )}
                      {program.change_install_string && (
                        <>
                          <GridItem><Text color="gray.600" fontWeight="medium">Modify Command</Text></GridItem>
                          <GridItem>
                            <HStack>
                              <Text fontSize="sm" fontFamily="monospace" wordBreak="break-all">
                                {program.change_install_string}
                              </Text>
                              <Button 
                                size="xs"
                                onClick={() => handleCopy(program.change_install_string!, 'Modify command')}
                              >
                                Copy
                              </Button>
                            </HStack>
                          </GridItem>
                        </>
                      )}
                      {program.quiet_uninstall_string && (
                        <>
                          <GridItem><Text color="gray.600" fontWeight="medium">Quiet Uninstall</Text></GridItem>
                          <GridItem>
                            <HStack>
                              <Text fontSize="sm" fontFamily="monospace" wordBreak="break-all">
                                {program.quiet_uninstall_string}
                              </Text>
                              <Button 
                                size="xs"
                                onClick={() => handleCopy(program.quiet_uninstall_string!, 'Quiet uninstall command')}
                              >
                                Copy
                              </Button>
                            </HStack>
                          </GridItem>
                        </>
                      )}
                    </Grid>
                  </AccordionPanel>
                </AccordionItem>
              )}

              {/* Action Buttons */}
              {(program.uninstall_string || program.change_install_string) && (
                <Box>
                  <Heading size="sm" mb={3}>Actions</Heading>
                  <HStack spacing={3}>
                    {program.uninstall_string && (
                      <Button
                        leftIcon={<DeleteIcon />}
                        colorScheme="red"
                        variant="outline"
                        onClick={onUninstallOpen}
                        size="sm"
                      >
                        Uninstall
                      </Button>
                    )}
                    {program.change_install_string && (
                      <Button
                        leftIcon={<EditIcon />}
                        colorScheme="blue"
                        variant="outline"
                        onClick={onModifyOpen}
                        size="sm"
                      >
                        Modify
                      </Button>
                    )}
                  </HStack>
                </Box>
              )}

              {/* Additional Information */}
              {(program.comments || program.about_url || program.installed_for) && (
                <Box>
                  <Heading size="sm" mb={3}>Additional Information</Heading>
                  <Grid templateColumns="120px 1fr" gap={3}>
                    {program.installed_for && (
                      <>
                        <GridItem><Text color="gray.600">Installed For</Text></GridItem>
                        <GridItem><Text>{program.installed_for}</Text></GridItem>
                      </>
                    )}
                    {program.comments && (
                      <>
                        <GridItem><Text color="gray.600">Comments</Text></GridItem>
                        <GridItem><Text>{program.comments}</Text></GridItem>
                      </>
                    )}
                    {program.about_url && (
                      <>
                        <GridItem><Text color="gray.600">About URL</Text></GridItem>
                        <GridItem>
                          <Link href={program.about_url} isExternal color="blue.500">
                            {program.about_url} <ExternalLinkIcon mx="2px" />
                          </Link>
                        </GridItem>
                      </>
                    )}
                    <GridItem><Text color="gray.600">Registry Name</Text></GridItem>
                    <GridItem>
                      <HStack>
                        <Text fontSize="sm" fontFamily="monospace">
                          {program.registry_name}
                        </Text>
                        <Button 
                          size="xs"
                          onClick={() => handleCopy(program.registry_name, 'Registry name')}
                        >
                          Copy
                        </Button>
                      </HStack>
                    </GridItem>
                  </Grid>
                </Box>
              )}

              {/* Advanced Information - Only shown when expanded */}
              <Collapse in={showAdvanced}>
                <AccordionItem>
                  <h2>
                    <AccordionButton>
                      <Box flex="1" textAlign="left">
                        <Heading size="sm">Advanced Details</Heading>
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                  </h2>
                  <AccordionPanel pb={4}>
                    <Grid templateColumns="120px 1fr" gap={3}>
                      {program.registry_time && (
                        <>
                          <GridItem><Text color="gray.600">Registry Time</Text></GridItem>
                          <GridItem><Text>{program.registry_time}</Text></GridItem>
                        </>
                      )}
                      {program.install_source && (
                        <>
                          <GridItem><Text color="gray.600">Install Source</Text></GridItem>
                          <GridItem><Text>{program.install_source}</Text></GridItem>
                        </>
                      )}
                      {program.installer_name && (
                        <>
                          <GridItem><Text color="gray.600">Installer Name</Text></GridItem>
                          <GridItem><Text>{program.installer_name}</Text></GridItem>
                        </>
                      )}
                      {program.msi_filename && (
                        <>
                          <GridItem><Text color="gray.600">MSI Filename</Text></GridItem>
                          <GridItem><Text>{program.msi_filename}</Text></GridItem>
                        </>
                      )}
                      {program.estimated_size && (
                        <>
                          <GridItem><Text color="gray.600">Estimated Size</Text></GridItem>
                          <GridItem><Text>{program.estimated_size} KB</Text></GridItem>
                        </>
                      )}
                      {program.language && (
                        <>
                          <GridItem><Text color="gray.600">Language</Text></GridItem>
                          <GridItem><Text>{program.language}</Text></GridItem>
                        </>
                      )}
                    </Grid>
                  </AccordionPanel>
                </AccordionItem>
              </Collapse>
            </Accordion>

            {/* VF Log Viewer Button */}
            {program.is_vf_deployed && settings.enableVfLogViewer && (
              <Button
                onClick={() => setIsLogViewerOpen(true)}
                size="sm"
                colorScheme="orange"
                leftIcon={<ViewIcon />}
                variant="outline"
              >
                View VF Deployment Logs
              </Button>
            )}

            {/* Show More/Less Button */}
            <Button
              onClick={() => setShowAdvanced(!showAdvanced)}
              size="sm"
              variant="ghost"
              rightIcon={showAdvanced ? <ChevronUpIcon /> : <ChevronDownIcon />}
            >
              {showAdvanced ? "Show Less" : "Show More"}
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>

      {/* VF Log Viewer Modal */}
      <LogViewer
        programName={program.name}
        isOpen={isLogViewerOpen}
        onClose={() => setIsLogViewerOpen(false)}
      />

      {/* Uninstall Confirmation Dialog */}
      <AlertDialog
        isOpen={isUninstallOpen}
        leastDestructiveRef={cancelRef}
        onClose={onUninstallClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Uninstall {program.name}
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to uninstall <strong>{program.name}</strong>? 
              This action cannot be undone.
              {program.uninstall_string && (
                <Box mt={2} p={2} bg="gray.50" borderRadius="md">
                  <Text fontSize="sm" fontFamily="monospace">
                    Command: {program.uninstall_string}
                  </Text>
                </Box>
              )}
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onUninstallClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleUninstall} ml={3}>
                Uninstall
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Modify Confirmation Dialog */}
      <AlertDialog
        isOpen={isModifyOpen}
        leastDestructiveRef={cancelRef}
        onClose={onModifyClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Modify {program.name}
            </AlertDialogHeader>
            <AlertDialogBody>
              This will open the modify/repair dialog for <strong>{program.name}</strong>.
              {program.change_install_string && (
                <Box mt={2} p={2} bg="gray.50" borderRadius="md">
                  <Text fontSize="sm" fontFamily="monospace">
                    Command: {program.change_install_string}
                  </Text>
                </Box>
              )}
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onModifyClose}>
                Cancel
              </Button>
              <Button colorScheme="blue" onClick={handleModify} ml={3}>
                Modify
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Modal>
  );
}; 