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
  programType?: string;
}

// Simple icon mapping - direct and reliable
const getIconForProgram = (programName: string, publisher?: string): string | null => {
  const name = programName.toLowerCase();
  const pub = publisher?.toLowerCase() || '';

  // HP programs
  if (pub.includes('hp') || name.includes('hp')) {
    return 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#0096D6">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
      </svg>
    `);
  }

  // Microsoft programs
  if (pub.includes('microsoft')) {
    return 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <rect x="0" y="0" width="11.4" height="11.4" fill="#F25022"/>
        <rect x="12.6" y="0" width="11.4" height="11.4" fill="#7FBA00"/>
        <rect x="0" y="12.6" width="11.4" height="11.4" fill="#00A4EF"/>
        <rect x="12.6" y="12.6" width="11.4" height="11.4" fill="#FFB900"/>
      </svg>
    `);
  }

  // Brave browser
  if (name.includes('brave') || pub.includes('brave')) {
    return 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FB542B">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
      </svg>
    `);
  }

  // Git
  if (name.includes('git')) {
    return 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#F05032">
        <path d="M23.546 10.93L13.067.452c-.604-.603-1.582-.603-2.188 0L8.708 2.627l2.76 2.76c.645-.215 1.379-.07 1.889.441.516.515.658 1.258.438 1.9l2.658 2.66c.645-.223 1.387-.078 1.9.435.721.72.721 1.884 0 2.604-.719.719-1.881.719-2.6 0-.539-.541-.674-1.337-.404-1.996L12.86 8.955v6.525c.176.086.342.203.488.348.713.721.713 1.883 0 2.6-.719.721-1.889.721-2.609 0-.719-.719-.719-1.879 0-2.598.182-.18.387-.316.605-.406V8.835c-.218-.091-.423-.222-.6-.401-.545-.545-.676-1.342-.396-2.009L7.636 3.7.45 10.881c-.6.605-.6 1.584 0 2.189l10.48 10.477c.604.604 1.582.604 2.186 0l10.43-10.43c.605-.603.605-1.582 0-2.187"/>
      </svg>
    `);
  }

  // Python
  if (name.includes('python') || pub.includes('python')) {
    return 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#3776AB">
        <path d="M14.25.18l.9.2.73.26.59.3.45.32.34.34.25.34.16.33.1.3.04.26.02.2-.01.13V8.5l-.05.63-.13.55-.21.46-.26.38-.3.31-.33.25-.35.19-.35.14-.33.1-.3.07-.26.04-.21.02H8.77l-.69.05-.59.14-.5.22-.41.27-.33.32-.27.35-.2.36-.15.37-.1.35-.07.32-.04.27-.02.21v3.06H3.17l-.21-.03-.28-.07-.32-.12-.35-.18-.36-.26-.36-.35-.35-.44-.33-.55-.3-.68-.25-.82-.2-.97-.13-1.13-.05-1.3.05-1.13.13-.97.2-.82.25-.68.3-.55.33-.44.35-.35.36-.26.36-.18.35-.12.32-.07.28-.03.21v5.52l.03.21.07.28.12.32.18.35.26.36.35.36.44.35.55.33.68.3.82.25.97.2 1.13.13 1.3.05h5.52l.21-.03.28-.07.32-.12.35-.18.36-.26.36-.35.35-.44.33-.55.3-.68.25-.82.2-.97.13-1.13.05-1.3v-3.06h4.39l.21.03.28.07.32.12.35.18.36.26.36.35.35.44.33.55.3.68.25.82.2.97.13 1.13.05 1.3-.05 1.13-.13.97-.2.82-.25.68-.3.55-.33.44-.35.35-.36.26-.36.18-.35.12-.32.07-.28.03-.21V8.5l-.02-.13-.04-.26-.1-.3-.16-.33-.25-.34-.34-.34-.45-.32-.59-.3-.73-.26-.9-.2H14.25z"/>
      </svg>
    `);
  }

  // Chrome
  if (name.includes('chrome')) {
    return 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#4285F4">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
      </svg>
    `);
  }

  // Firefox
  if (name.includes('firefox')) {
    return 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FF7139">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
      </svg>
    `);
  }

  // Edge
  if (name.includes('edge')) {
    return 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#0078D4">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
      </svg>
    `);
  }

  // Discord
  if (name.includes('discord')) {
    return 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#5865F2">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
      </svg>
    `);
  }

  // Steam
  if (name.includes('steam')) {
    return 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#171a21">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
      </svg>
    `);
  }

  // Adobe
  if (name.includes('adobe') || name.includes('photoshop') || name.includes('acrobat')) {
    return 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FF0000">
        <path d="M13.966 22.624l-1.69-4.281H8.122l-1.69 4.281H4.281L9.49 1.376h2.02l5.208 21.248h-2.752zm-2.4-6.18l-2.04-5.168-2.04 5.168h4.08z"/>
      </svg>
    `);
  }

  // VS Code
  if (name.includes('vscode') || name.includes('visual studio code')) {
    return 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#007ACC">
        <path d="M23.15 2.587L18.21.21a1.494 1.494 0 0 0-1.705.29l-9.46 8.63-4.12-3.128a.999.999 0 0 0-1.276.057L.327 7.261A1 1 0 0 0 .326 8.74L3.899 12 .326 15.26a1 1 0 0 0 .001 1.479L1.65 17.94a.999.999 0 0 0 1.276.057l4.12-3.128 9.46 8.63a1.492 1.492 0 0 0 1.704.29l4.942-2.377A1.5 1.5 0 0 0 24 20.06V3.939a1.5 1.5 0 0 0-.85-1.352zm-5.146 14.861L10.826 12l7.178-5.448v10.896z"/>
      </svg>
    `);
  }

  // Teams
  if (name.includes('teams')) {
    return 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#6264A7">
        <path d="M20.5 14.26a1 1 0 0 0-1 0l-6.5 3.75a1 1 0 0 1-1 0L5.5 14.26a1 1 0 0 0-1 0l-1.5.87a1 1 0 0 1-1.5-.87V6.38a1 1 0 0 1 .5-.87l1.5-.87a1 1 0 0 1 1 0l6.5 3.75a1 1 0 0 0 1 0l6.5-3.75a1 1 0 0 1 1 0l1.5.87a1 1 0 0 1 .5.87v8.88a1 1 0 0 1-.5.87l-1.5.87z"/>
      </svg>
    `);
  }

  // OneDrive
  if (name.includes('onedrive')) {
    return 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#0078D4">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
      </svg>
    `);
  }

  // Office
  if (name.includes('office') || name.includes('word') || name.includes('excel') || name.includes('powerpoint')) {
    return 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#D83B01">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
      </svg>
    `);
  }

  return null;
};

export const ProgramIcon: React.FC<ProgramIconProps> = ({ 
  programName, 
  size = "24px",
  showFallback = true,
  publisher,
  iconPath,
  programType
}) => {
  const [iconData, setIconData] = useState<string>('');

  useEffect(() => {
    const loadIcon = async () => {
      try {
        // First try to get icon from our enhanced icon service (includes .exe extraction)
        const icon = await iconService.getFallbackIcon(
          programName, 
          publisher, 
          programType, 
          iconPath
        );
        
        if (icon) {
          setIconData(icon);
        } else {
          // Fallback to our simple mapping if icon service fails
          const simpleIcon = getIconForProgram(programName, publisher);
          setIconData(simpleIcon || '');
        }
      } catch (error) {
        console.error(`Failed to load icon for ${programName}:`, error);
        // Fallback to simple mapping
        const simpleIcon = getIconForProgram(programName, publisher);
        setIconData(simpleIcon || '');
      }
    };

    loadIcon();
  }, [programName, publisher, iconPath, programType]);

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