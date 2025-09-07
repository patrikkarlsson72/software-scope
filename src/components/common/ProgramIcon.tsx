import React, { useState, useEffect, useRef } from 'react';
import { Box, Image, Icon, Spinner } from '@chakra-ui/react';
import { FaWindowMaximize } from 'react-icons/fa';
import { useIconCache } from '../../hooks/useIconCache';
import { invoke } from '@tauri-apps/api/tauri';
import { iconService } from '../../services/iconService';

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
  lazy?: boolean; // New prop for lazy loading
  publisher?: string; // For fallback icon matching
  programType?: string; // For generic fallback icons
}

export const ProgramIcon: React.FC<ProgramIconProps> = ({ 
  iconPath, 
  programName, 
  size = "24px",
  showFallback = true,
  lazy = true, // Default to lazy loading
  publisher,
  programType
}) => {
  const { getCachedIcon, setCachedIcon } = useIconCache();
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [iconData, setIconData] = useState<string>('');
  const [isVisible, setIsVisible] = useState(!lazy); // Start visible if not lazy
  const iconRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || !iconRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(iconRef.current);
    return () => observer.disconnect();
  }, [lazy]);

  // Load icon data when iconPath changes and component is visible
  useEffect(() => {
    if (iconPath && shouldDisplayIcon(iconPath) && isVisible) {
      loadIconData(iconPath);
    }
  }, [iconPath, isVisible]);

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
      console.log(`✅ Local icon loaded successfully: ${path}`);
    } catch (error) {
      console.error(`❌ Failed to load local icon ${path}:`, error);
      
      // Try fallback icon service
      try {
        console.log(`🔄 Trying fallback icon for: ${programName}`);
        const fallbackIcon = await iconService.getFallbackIcon(programName, publisher, programType);
        if (fallbackIcon) {
          setIconData(fallbackIcon);
          console.log(`✅ Fallback icon loaded successfully for: ${programName}`);
        } else {
          setHasError(true);
        }
      } catch (fallbackError) {
        console.error(`❌ Failed to load fallback icon for ${programName}:`, fallbackError);
        setHasError(true);
      }
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
    <Box 
      ref={iconRef}
      width={size} 
      height={size} 
      display="flex" 
      alignItems="center" 
      justifyContent="center"
    >
      {!isVisible && lazy ? (
        // Show placeholder while waiting for intersection
        <Icon as={FaWindowMaximize} boxSize={size} color="gray.300" />
      ) : isLoading ? (
        <Spinner size="sm" color="blue.500" />
      ) : iconData ? (
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
