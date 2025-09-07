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
import { iconService } from '../../services/iconService';
import { IconDebugger } from './IconDebugger';

export const CacheManager: React.FC = () => {
  const { clearCache, getCacheStats, cacheStats } = useIconCache();
  const toast = useToast();
  const [fallbackStats, setFallbackStats] = React.useState(() => iconService.getFallbackCacheStats());

  const handleClearCache = () => {
    clearCache();
    iconService.clearFallbackCache();
    setFallbackStats(iconService.getFallbackCacheStats());
    toast({
      title: 'Cache Cleared',
      description: 'All icon caches have been cleared successfully',
      status: 'success',
      duration: 2000,
    });
  };

  const handleRefreshStats = () => {
    setFallbackStats(iconService.getFallbackCacheStats());
  };

  return (
    <VStack spacing={4} align="stretch">
      <Box p={4} borderWidth="1px" borderRadius="lg">
        <VStack spacing={4} align="stretch">
          <Text fontSize="lg" fontWeight="bold">Icon Cache Manager</Text>
          
          <Text fontSize="md" fontWeight="semibold" color="blue.600">Local Icons</Text>
          <HStack spacing={6}>
            <Stat>
              <StatLabel>Total Entries</StatLabel>
              <StatNumber>{cacheStats.totalEntries}</StatNumber>
              <StatHelpText>Total cached icons</StatHelpText>
            </Stat>
            
            <Stat>
              <StatLabel>Valid Entries</StatLabel>
              <StatNumber>{cacheStats.validEntries}</StatNumber>
              <StatHelpText>Non-expired entries</StatHelpText>
            </Stat>
            
            <Stat>
              <StatLabel>Expired Entries</StatLabel>
              <StatNumber>{cacheStats.expiredEntries}</StatNumber>
              <StatHelpText>Expired cache entries</StatHelpText>
            </Stat>
          </HStack>

          <Text fontSize="md" fontWeight="semibold" color="green.600">Fallback Icons</Text>
          <HStack spacing={6}>
            <Stat>
              <StatLabel>Total Fallback</StatLabel>
              <StatNumber>{fallbackStats.totalEntries}</StatNumber>
              <StatHelpText>Downloaded fallback icons</StatHelpText>
            </Stat>
            
            <Stat>
              <StatLabel>CDN Icons</StatLabel>
              <StatNumber>{fallbackStats.cdnEntries}</StatNumber>
              <StatHelpText>From CDN sources</StatHelpText>
            </Stat>
            
            <Stat>
              <StatLabel>Generic Icons</StatLabel>
              <StatNumber>{fallbackStats.genericEntries}</StatNumber>
              <StatHelpText>Generic type icons</StatHelpText>
            </Stat>
          </HStack>
          
          <HStack spacing={3}>
            <Button onClick={handleClearCache} colorScheme="red" size="sm">
              Clear All Caches
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
