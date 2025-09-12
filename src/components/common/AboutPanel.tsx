import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  Text,
  Divider,
  HStack,
  Icon,
  Box,
  Link,
  Badge,
} from '@chakra-ui/react';
import { InfoIcon } from '@chakra-ui/icons';

interface AboutPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutPanel: React.FC<AboutPanelProps> = ({ isOpen, onClose }) => {
  const appVersion = '1.1.9';
  const buildDate = new Date().toLocaleDateString();
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack>
            <Icon as={InfoIcon} color="brand.500" />
            <Text>About Software Scope</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={4} align="stretch">
            <Box textAlign="center">
              <Text fontSize="xl" fontWeight="bold" color="brand.500">
                Software Scope
              </Text>
              <Badge colorScheme="blue" mt={2}>
                Version {appVersion}
              </Badge>
            </Box>
            
            <Divider />
            
            <VStack spacing={3} align="stretch">
              <Box>
                <Text fontWeight="semibold" color="gray.700">Description</Text>
                <Text fontSize="sm" color="gray.600">
                  A comprehensive software inventory and management tool for Windows systems.
                </Text>
              </Box>
              
              <Box>
                <Text fontWeight="semibold" color="gray.700">Build Information</Text>
                <Text fontSize="sm" color="gray.600">
                  Built: {buildDate}
                </Text>
              </Box>
              
              <Box>
                <Text fontWeight="semibold" color="gray.700">Technology</Text>
                <Text fontSize="sm" color="gray.600">
                  Built with Tauri, React, and TypeScript
                </Text>
              </Box>
              
              <Box>
                <Text fontWeight="semibold" color="gray.700">Copyright</Text>
                <Text fontSize="sm" color="gray.600">
                  © 2024 Software Scope. All rights reserved.
                </Text>
              </Box>
            </VStack>
            
            <Divider />
            
            <Box textAlign="center">
              <Text fontSize="sm" color="gray.500">
                For support and documentation, please refer to the project repository.
              </Text>
            </Box>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
