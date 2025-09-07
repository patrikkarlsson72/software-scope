import { useState, useCallback, useMemo } from 'react';

interface IconCache {
  [key: string]: {
    data: string;
    timestamp: number;
  };
}

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export const useIconCache = () => {
  const [cache, setCache] = useState<IconCache>({});

  const getCachedIcon = useCallback((iconPath: string): string | null => {
    const cached = cache[iconPath];
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }, [cache]);

  const setCachedIcon = useCallback((iconPath: string, iconData: string) => {
    setCache(prev => ({
      ...prev,
      [iconPath]: {
        data: iconData,
        timestamp: Date.now()
      }
    }));
  }, []);

  const clearCache = useCallback(() => {
    setCache({});
  }, []);

  const getCacheStats = useCallback(() => {
    const now = Date.now();
    const validEntries = Object.values(cache).filter(
      entry => now - entry.timestamp < CACHE_DURATION
    ).length;
    
    return {
      totalEntries: Object.keys(cache).length,
      validEntries,
      expiredEntries: Object.keys(cache).length - validEntries
    };
  }, [cache]);

  // Memoized cache stats to prevent unnecessary recalculations
  const cacheStats = useMemo(() => getCacheStats(), [getCacheStats]);

  return {
    getCachedIcon,
    setCachedIcon,
    clearCache,
    getCacheStats,
    cacheStats
  };
};
