import React from 'react';
import {
  Box,
  Button,
  Text,
  VStack,
  HStack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useToast,
} from '@chakra-ui/react';
import { useIconCache } from '../../hooks/useIconCache';
import { IconDebugger } from './IconDebugger';

export const CacheManager: React.FC = () => {
  const { clearCache, getCacheStats } = useIconCache();
  const toast = useToast();
  const [stats, setStats] = React.useState(() => getCacheStats());

  const handleClearCache = () => {
    clearCache();
    setStats(getCacheStats());
    toast({
      title: 'Cache Cleared',
      description: 'Icon cache has been cleared successfully',
      status: 'success',
      duration: 2000,
    });
  };

  const handleRefreshStats = () => {
    setStats(getCacheStats());
  };

  return (
    <VStack spacing={4} align="stretch">
      <Box p={4} borderWidth="1px" borderRadius="lg">
        <VStack spacing={4} align="stretch">
          <Text fontSize="lg" fontWeight="bold">Icon Cache Manager</Text>
          
          <HStack spacing={6}>
            <Stat>
              <StatLabel>Total Entries</StatLabel>
              <StatNumber>{stats.totalEntries}</StatNumber>
              <StatHelpText>Total cached icons</StatHelpText>
            </Stat>
            
            <Stat>
              <StatLabel>Valid Entries</StatLabel>
              <StatNumber>{stats.validEntries}</StatNumber>
              <StatHelpText>Non-expired entries</StatHelpText>
            </Stat>
            
            <Stat>
              <StatLabel>Expired Entries</StatLabel>
              <StatNumber>{stats.expiredEntries}</StatNumber>
              <StatHelpText>Expired cache entries</StatHelpText>
            </Stat>
          </HStack>
          
          <HStack spacing={3}>
            <Button onClick={handleClearCache} colorScheme="red" size="sm">
              Clear Cache
            </Button>
            <Button onClick={handleRefreshStats} size="sm">
              Refresh Stats
            </Button>
          </HStack>
        </VStack>
      </Box>
      
      <IconDebugger />
    </VStack>
  );
};
