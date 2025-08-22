import React, { useState, useEffect } from 'react';
import { Box, Image, Icon, Spinner } from '@chakra-ui/react';
import { FaWindowMaximize } from 'react-icons/fa';
import { useIconCache } from '../../hooks/useIconCache';
import { invoke } from '@tauri-apps/api/tauri';

// Helper function to determine if we should try to display an icon
const shouldDisplayIcon = (iconPath: string): boolean => {
  const extension = iconPath.split('.').pop()?.toLowerCase();
  return extension === 'ico' || extension === 'png' || extension === 'jpg' || extension === 'jpeg' || extension === 'exe' || extension === 'dll';
};

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
  const { getCachedIcon, setCachedIcon } = useIconCache();
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [iconData, setIconData] = useState<string>('');

  // Load icon data when iconPath changes
  useEffect(() => {
    if (iconPath && shouldDisplayIcon(iconPath)) {
      loadIconData(iconPath);
    }
  }, [iconPath]);

  const loadIconData = async (path: string) => {
    // Check cache first
    const cached = getCachedIcon(path);
    if (cached) {
      setIconData(cached);
      return;
    }

    setIsLoading(true);
    setHasError(false);

    try {
      // Use Tauri command to read file as base64
      const base64Data: string = await invoke('get_icon_as_base64', { iconPath: path });
      setIconData(base64Data);
      setCachedIcon(path, base64Data);
      console.log(`✅ Icon loaded successfully: ${path}`);
    } catch (error) {
      console.error(`❌ Failed to load icon ${path}:`, error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (!iconPath || hasError || !shouldDisplayIcon(iconPath)) {
    if (!showFallback) return null;
    return (
      <Box width={size} height={size} display="flex" alignItems="center" justifyContent="center">
        <Icon 
          as={FaWindowMaximize} 
          boxSize={size} 
          color="gray.500" 
        />
      </Box>
    );
  }

  return (
    <Box width={size} height={size} display="flex" alignItems="center" justifyContent="center">
      {isLoading && (
        <Spinner size="sm" color="blue.500" />
      )}
      
      {iconData ? (
        <Image
          src={iconData}
          alt={`${programName} icon`}
          boxSize={size}
          objectFit="contain"
          fallback={
            showFallback ? (
              <Icon as={FaWindowMaximize} boxSize={size} color="gray.500" />
            ) : undefined
          }
        />
      ) : (
        showFallback && (
          <Icon as={FaWindowMaximize} boxSize={size} color="gray.500" />
        )
      )}
    </Box>
  );
};
