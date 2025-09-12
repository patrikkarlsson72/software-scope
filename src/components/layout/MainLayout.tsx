import { Box, Flex, Heading, Button, useDisclosure, HStack } from '@chakra-ui/react';
import { SettingsIcon, ViewIcon, InfoIcon } from '@chakra-ui/icons';
import { SettingsPanel } from '../common/SettingsPanel';
import { LogViewer } from '../common/LogViewer';
import { AboutPanel } from '../common/AboutPanel';
import { useSettings } from '../../contexts/SettingsContext';

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
      <Box as="header" bg="brand.500" color="white" px={8} py={4} boxShadow="sm">
        <Flex justify="space-between" align="center">
          <Heading size="lg">Software Scope</Heading>
          <HStack spacing={2}>
            {settings.enableVfLogViewer && (
              <Button
                leftIcon={<ViewIcon />}
                variant="ghost"
                color="white"
                _hover={{ bg: 'whiteAlpha.200' }}
                onClick={onLogViewerOpen}
                size="sm"
              >
                VF Logs
              </Button>
            )}
            <Button
              leftIcon={<InfoIcon />}
              variant="ghost"
              color="white"
              _hover={{ bg: 'whiteAlpha.200' }}
              onClick={onAboutOpen}
              size="sm"
            >
              About
            </Button>
            <Button
              leftIcon={<SettingsIcon />}
              variant="ghost"
              color="white"
              _hover={{ bg: 'whiteAlpha.200' }}
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
