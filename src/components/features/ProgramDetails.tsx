import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Text,
  VStack,
  Divider,
  Badge,
  Grid,
  GridItem,
  Box,
  Heading,
  Button,
  HStack,
  useToast,
  Image,
  Link,
  Icon,
  Collapse,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react';
import { ExternalLinkIcon, ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import { ProgramInfo } from '../../types/ProgramInfo';
import { FaWindowMaximize } from 'react-icons/fa';
import { useState } from 'react';

interface ProgramDetailsProps {
  program: ProgramInfo;
  isOpen: boolean;
  onClose: () => void;
}

export const ProgramDetails: React.FC<ProgramDetailsProps> = ({ program, isOpen, onClose }) => {
  const toast = useToast();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleCopy = (text: string, what: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: `${what} copied to clipboard`,
      status: 'success',
      duration: 2000,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={showAdvanced ? "4xl" : "xl"}>
      <ModalOverlay />
      <ModalContent maxHeight="90vh" overflowY="auto">
        <ModalHeader>
          <HStack spacing={4} align="flex-start">
            <Box width="32px" height="32px" display="flex" alignItems="center" justifyContent="center">
              {program.icon_path ? (
                <Image
                  src={`file://${program.icon_path}`}
                  alt={program.name}
                  boxSize="32px"
                  objectFit="contain"
                  fallback={<Icon as={FaWindowMaximize} boxSize="32px" color="gray.500" />}
                />
              ) : (
                <Icon as={FaWindowMaximize} boxSize="32px" color="gray.500" />
              )}
            </Box>
            <VStack align="stretch" spacing={2}>
              <Text>{program.name}</Text>
              <HStack spacing={2}>
                <Badge colorScheme="blue">{program.architecture}</Badge>
                <Badge colorScheme="green">{program.program_type}</Badge>
                {program.is_windows_installer && (
                  <Badge colorScheme="purple">Windows Installer</Badge>
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
                  </Grid>
                </AccordionPanel>
              </AccordionItem>

              {/* Installation Details */}
              <AccordionItem>
                <h2>
                  <AccordionButton>
                    <Box flex="1" textAlign="left">
                      <Heading size="sm">Installation Details</Heading>
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                  <Grid templateColumns="120px 1fr" gap={3}>
                    {program.install_location && (
                      <>
                        <GridItem><Text color="gray.600">Location</Text></GridItem>
                        <GridItem>
                          <HStack>
                            <Text>{program.install_location}</Text>
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
                    {program.icon_path && (
                      <>
                        <GridItem><Text color="gray.600">Display Icon</Text></GridItem>
                        <GridItem>
                          <HStack>
                            <Text fontSize="sm" fontFamily="monospace">
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
                    <GridItem><Text color="gray.600">Registry Path</Text></GridItem>
                    <GridItem>
                      <HStack>
                        <Text fontSize="sm" fontFamily="monospace">
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

              {program.uninstall_string && (
                <>
                  <Divider />
                  <Box>
                    <Heading size="sm" mb={3}>Uninstall Information</Heading>
                    <Grid templateColumns="120px 1fr" gap={3}>
                      <GridItem><Text color="gray.600">Command</Text></GridItem>
                      <GridItem>
                        <HStack>
                          <Text fontSize="sm" fontFamily="monospace">
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
                    </Grid>
                  </Box>
                </>
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
    </Modal>
  );
}; 