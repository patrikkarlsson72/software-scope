import { Box, Flex, Heading, Button, useDisclosure } from '@chakra-ui/react';
import { SettingsIcon } from '@chakra-ui/icons';
import { SettingsPanel } from '../common/SettingsPanel';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { isOpen, onToggle } = useDisclosure();

  return (
    <Flex direction="column" minH="100vh">
      <Box as="header" bg="brand.500" color="white" px={8} py={4} boxShadow="sm">
        <Flex justify="space-between" align="center">
          <Heading size="lg">Software Scope</Heading>
          <Button
            leftIcon={<SettingsIcon />}
            variant="ghost"
            color="white"
            _hover={{ bg: 'whiteAlpha.200' }}
            onClick={onToggle}
          >
            Settings
          </Button>
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
    </Flex>
  );
};
