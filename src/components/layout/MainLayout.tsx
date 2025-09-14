import { Box, Flex, Button, useDisclosure, HStack } from '@chakra-ui/react';
import { SettingsIcon, ViewIcon, InfoIcon } from '@chakra-ui/icons';
import { SettingsPanel } from '../common/SettingsPanel';
import { LogViewer } from '../common/LogViewer';
import { AboutPanel } from '../common/AboutPanel';
import { useSettings } from '../../contexts/SettingsContext';
import logoImage from '../../assets/icons/logo.png';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { isOpen, onToggle } = useDisclosure();
  const { isOpen: isLogViewerOpen, onOpen: onLogViewerOpen, onClose: onLogViewerClose } = useDisclosure();
  const { isOpen: isAboutOpen, onOpen: onAboutOpen, onClose: onAboutClose } = useDisclosure();
  const { settings } = useSettings();

  return (
    <Flex direction="column" minH="100vh">
      <Box as="header" bg="white" color="brand.500" px={8} py={4} boxShadow="sm" borderBottom="1px" borderColor="brand.100">
        <Flex justify="space-between" align="center">
          <Flex align="center">
            <img 
              src={logoImage} 
              alt="Software Scope" 
              style={{ height: '40px', width: 'auto' }}
            />
          </Flex>
          <HStack spacing={2}>
            {settings.enableVfLogViewer && (
              <Button
                leftIcon={<ViewIcon />}
                variant="ghost"
                color="brand.500"
                _hover={{ bg: 'brand.50' }}
                onClick={onLogViewerOpen}
                size="sm"
              >
                VF Logs
              </Button>
            )}
            <Button
              leftIcon={<InfoIcon />}
              variant="ghost"
              color="brand.500"
              _hover={{ bg: 'brand.50' }}
              onClick={onAboutOpen}
              size="sm"
            >
              About
            </Button>
            <Button
              leftIcon={<SettingsIcon />}
              variant="ghost"
              color="brand.500"
              _hover={{ bg: 'brand.50' }}
              onClick={onToggle}
            >
              Settings
            </Button>
          </HStack>
        </Flex>
      </Box>
      
      {isOpen && (
        <Box bg="white" borderBottom="1px" borderColor="gray.200" p={4}>
          <SettingsPanel />
        </Box>
      )}
      
      <Box as="main" flex="1" p={8} bg="brand.50">
        {children}
      </Box>

      {/* VF Log Viewer Modal */}
      <LogViewer
        isOpen={isLogViewerOpen}
        onClose={onLogViewerClose}
      />

      {/* About Modal */}
      <AboutPanel
        isOpen={isAboutOpen}
        onClose={onAboutClose}
      />
    </Flex>
  );
};
