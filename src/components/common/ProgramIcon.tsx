import React, { useState, useCallback } from 'react';
import { Box, Image, Icon, Spinner } from '@chakra-ui/react';
import { FaWindowMaximize } from 'react-icons/fa';
import { useIconCache } from '../../hooks/useIconCache';

interface ProgramIconProps {
  iconPath?: string;
  programName: string;
  size?: string | number;
  showFallback?: boolean;
}

export const ProgramIcon: React.FC<ProgramIconProps> = ({ 
  iconPath, 
  programName, 
  size = "24px",
  showFallback = true 
}) => {
  const { setCachedIcon } = useIconCache();
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleIconLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
    if (iconPath) {
      setCachedIcon(iconPath, iconPath);
    }
  }, [iconPath, setCachedIcon]);

  const handleIconError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
  }, []);

  if (!iconPath || hasError) {
    if (!showFallback) return null;
    return (
      <Icon 
        as={FaWindowMaximize} 
        boxSize={size} 
        color="gray.500" 
      />
    );
  }

  return (
    <Box width={size} height={size} display="flex" alignItems="center" justifyContent="center">
      {isLoading && (
        <Spinner size="sm" color="blue.500" />
      )}
      <Image
        src={`file://${iconPath}`}
        alt={`${programName} icon`}
        boxSize={size}
        objectFit="contain"
        onLoad={handleIconLoad}
        onError={handleIconError}
        fallback={
          showFallback ? (
            <Icon as={FaWindowMaximize} boxSize={size} color="gray.500" />
          ) : undefined
        }
        display={isLoading ? 'none' : 'block'}
      />
    </Box>
  );
};
