import { Box, Flex, Heading } from '@chakra-ui/react';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <Flex direction="column" minH="100vh">
      <Box as="header" bg="brand.500" color="white" px={8} py={4} boxShadow="sm">
        <Heading size="lg">Software Scope</Heading>
      </Box>
      <Box as="main" flex="1" p={8} bg="brand.50">
        {children}
      </Box>
    </Flex>
  );
};
