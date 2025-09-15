import React, { useState, useEffect } from 'react';
import { Box, Image, Icon } from '@chakra-ui/react';
import { FaWindowMaximize } from 'react-icons/fa';
import { iconService } from '../../services/iconService';

interface ProgramIconProps {
  programName: string;
  size?: string | number;
  showFallback?: boolean;
  publisher?: string;
  iconPath?: string;
  isVfDeployed?: boolean;
}

export const ProgramIcon: React.FC<ProgramIconProps> = ({ 
  programName, 
  size = "24px",
  showFallback = true,
  publisher,
  iconPath,
  isVfDeployed = false
}) => {
  const [iconData, setIconData] = useState<string>('');

  useEffect(() => {
    const loadIcon = async () => {
      try {
        // PRIMARY: Try to extract icon directly from executable
        const icon = await iconService.getIconFromExecutable(
          programName, 
          publisher, 
          iconPath,
          isVfDeployed
        );
        
        if (icon) {
          setIconData(icon);
        } else {
          // FALLBACK: Use simple generic icon
          const genericIcon = iconService.getGenericIcon(programName, publisher);
          setIconData(genericIcon);
        }
      } catch (error) {
        console.error(`Failed to load icon for ${programName}:`, error);
        // FALLBACK: Use simple generic icon
        const genericIcon = iconService.getGenericIcon(programName, publisher);
        setIconData(genericIcon);
      }
    };

    loadIcon();
  }, [programName, publisher, iconPath, isVfDeployed]);

  if (!iconData) {
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
    <Box 
      width={size} 
      height={size} 
      display="flex" 
      alignItems="center" 
      justifyContent="center"
    >
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
    </Box>
  );
};