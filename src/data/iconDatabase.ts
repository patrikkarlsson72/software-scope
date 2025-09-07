// Database of common applications with their icon information
// This provides fallback icons when local icons can't be found

export interface IconInfo {
  name: string;
  publisher?: string;
  iconUrl: string;
  keywords: string[]; // Alternative names or keywords to match
}

// Common applications with their icon URLs
// Using reliable CDN sources for icons
export const COMMON_APP_ICONS: IconInfo[] = [
  // Microsoft Applications
  {
    name: "Microsoft Office",
    publisher: "Microsoft Corporation",
    iconUrl: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@develop/icons/microsoftoffice.svg",
    keywords: ["office", "word", "excel", "powerpoint", "outlook", "access", "publisher", "visio"]
  },
  {
    name: "Microsoft Visual Studio",
    publisher: "Microsoft Corporation", 
    iconUrl: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@develop/icons/visualstudio.svg",
    keywords: ["visual studio", "vs", "microsoft visual studio"]
  },
  {
    name: "Microsoft Edge",
    publisher: "Microsoft Corporation",
    iconUrl: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@develop/icons/microsoftedge.svg",
    keywords: ["edge", "microsoft edge", "msedge"]
  },
  {
    name: "Microsoft Teams",
    publisher: "Microsoft Corporation",
    iconUrl: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@develop/icons/microsoftteams.svg",
    keywords: ["teams", "microsoft teams"]
  },
  {
    name: "OneDrive",
    publisher: "Microsoft Corporation",
    iconUrl: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@develop/icons/onedrive.svg",
    keywords: ["onedrive", "microsoft onedrive"]
  },
  {
    name: "Skype",
    publisher: "Microsoft Corporation",
    iconUrl: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@develop/icons/skype.svg",
    keywords: ["skype"]
  },

  // Google Applications
  {
    name: "Google Chrome",
    publisher: "Google LLC",
    iconUrl: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@develop/icons/googlechrome.svg",
    keywords: ["chrome", "google chrome"]
  },
  {
    name: "Google Drive",
    publisher: "Google LLC",
    iconUrl: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@develop/icons/googledrive.svg",
    keywords: ["google drive", "drive"]
  },
  {
    name: "Google Earth",
    publisher: "Google LLC",
    iconUrl: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@develop/icons/googleearth.svg",
    keywords: ["google earth", "earth"]
  },

  // Adobe Applications
  {
    name: "Adobe Acrobat",
    publisher: "Adobe Inc.",
    iconUrl: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@develop/icons/adobeacrobatreader.svg",
    keywords: ["acrobat", "adobe acrobat", "pdf", "adobe reader"]
  },
  {
    name: "Adobe Photoshop",
    publisher: "Adobe Inc.",
    iconUrl: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@develop/icons/adobephotoshop.svg",
    keywords: ["photoshop", "adobe photoshop", "ps"]
  },
  {
    name: "Adobe Illustrator",
    publisher: "Adobe Inc.",
    iconUrl: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@develop/icons/adobeillustrator.svg",
    keywords: ["illustrator", "adobe illustrator", "ai"]
  },
  {
    name: "Adobe Premiere Pro",
    publisher: "Adobe Inc.",
    iconUrl: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@develop/icons/adobepremierepro.svg",
    keywords: ["premiere", "adobe premiere", "premiere pro"]
  },

  // Development Tools
  {
    name: "Visual Studio Code",
    publisher: "Microsoft Corporation",
    iconUrl: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@develop/icons/visualstudiocode.svg",
    keywords: ["vscode", "visual studio code", "code"]
  },
  {
    name: "Git",
    publisher: "The Git Development Community",
    iconUrl: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@develop/icons/git.svg",
    keywords: ["git"]
  },
  {
    name: "GitHub Desktop",
    publisher: "GitHub Inc.",
    iconUrl: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@develop/icons/github.svg",
    keywords: ["github desktop", "github"]
  },
  {
    name: "Node.js",
    publisher: "Node.js Foundation",
    iconUrl: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@develop/icons/nodedotjs.svg",
    keywords: ["node", "nodejs", "node.js"]
  },
  {
    name: "Python",
    publisher: "Python Software Foundation",
    iconUrl: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@develop/icons/python.svg",
    keywords: ["python"]
  },
  {
    name: "Docker",
    publisher: "Docker Inc.",
    iconUrl: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@develop/icons/docker.svg",
    keywords: ["docker"]
  },

  // Browsers
  {
    name: "Mozilla Firefox",
    publisher: "Mozilla Corporation",
    iconUrl: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@develop/icons/firefox.svg",
    keywords: ["firefox", "mozilla firefox"]
  },
  {
    name: "Brave",
    publisher: "Brave Software Inc",
    iconUrl: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@develop/icons/brave.svg",
    keywords: ["brave"]
  },
  {
    name: "Opera",
    publisher: "Opera Software",
    iconUrl: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@develop/icons/opera.svg",
    keywords: ["opera"]
  },
  {
    name: "Vivaldi",
    publisher: "Vivaldi Technologies",
    iconUrl: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@develop/icons/vivaldi.svg",
    keywords: ["vivaldi"]
  },

  // Media Players
  {
    name: "VLC Media Player",
    publisher: "VideoLAN",
    iconUrl: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@develop/icons/vlcmediaplayer.svg",
    keywords: ["vlc", "vlc media player"]
  },
  {
    name: "Spotify",
    publisher: "Spotify AB",
    iconUrl: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@develop/icons/spotify.svg",
    keywords: ["spotify"]
  },
  {
    name: "Winamp",
    publisher: "Nullsoft",
    iconUrl: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@develop/icons/winamp.svg",
    keywords: ["winamp"]
  },

  // Communication
  {
    name: "Discord",
    publisher: "Discord Inc.",
    iconUrl: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@develop/icons/discord.svg",
    keywords: ["discord"]
  },
  {
    name: "Slack",
    publisher: "Slack Technologies",
    iconUrl: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@develop/icons/slack.svg",
    keywords: ["slack"]
  },
  {
    name: "Zoom",
    publisher: "Zoom Video Communications",
    iconUrl: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@develop/icons/zoom.svg",
    keywords: ["zoom"]
  },
  {
    name: "WhatsApp",
    publisher: "WhatsApp Inc.",
    iconUrl: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@develop/icons/whatsapp.svg",
    keywords: ["whatsapp"]
  },

  // Gaming
  {
    name: "Steam",
    publisher: "Valve Corporation",
    iconUrl: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@develop/icons/steam.svg",
    keywords: ["steam"]
  },
  {
    name: "Epic Games",
    publisher: "Epic Games Inc.",
    iconUrl: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@develop/icons/epicgames.svg",
    keywords: ["epic games", "epic launcher"]
  },
  {
    name: "Origin",
    publisher: "Electronic Arts",
    iconUrl: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@develop/icons/origin.svg",
    keywords: ["origin", "ea origin"]
  },

  // Utilities
  {
    name: "7-Zip",
    publisher: "Igor Pavlov",
    iconUrl: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@develop/icons/7zip.svg",
    keywords: ["7-zip", "7zip"]
  },
  {
    name: "WinRAR",
    publisher: "RARLAB",
    iconUrl: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@develop/icons/winrar.svg",
    keywords: ["winrar", "rar"]
  },
  {
    name: "Notepad++",
    publisher: "Notepad++ Team",
    iconUrl: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@develop/icons/notepadplusplus.svg",
    keywords: ["notepad++", "notepad plus plus"]
  },
  {
    name: "PuTTY",
    publisher: "Simon Tatham",
    iconUrl: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@develop/icons/putty.svg",
    keywords: ["putty"]
  },

  // Security
  {
    name: "Windows Defender",
    publisher: "Microsoft Corporation",
    iconUrl: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@develop/icons/microsoft.svg",
    keywords: ["windows defender", "defender", "microsoft defender"]
  },
  {
    name: "Malwarebytes",
    publisher: "Malwarebytes Inc.",
    iconUrl: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@develop/icons/malwarebytes.svg",
    keywords: ["malwarebytes"]
  },

  // HP Applications (from your screenshot)
  {
    name: "HP Connection Optimizer",
    publisher: "HP Inc.",
    iconUrl: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@develop/icons/hp.svg",
    keywords: ["hp connection optimizer", "hp optimizer", "connection optimizer"]
  },
  {
    name: "HP Documentation",
    publisher: "HP Inc.",
    iconUrl: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@develop/icons/hp.svg",
    keywords: ["hp documentation", "hp docs", "documentation"]
  },
  {
    name: "HP Notifications",
    publisher: "HP",
    iconUrl: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@develop/icons/hp.svg",
    keywords: ["hp notifications", "hp notify", "notifications"]
  },
  {
    name: "HP Security Update Service",
    publisher: "HP Inc.",
    iconUrl: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@develop/icons/hp.svg",
    keywords: ["hp security", "hp security update", "security update service"]
  },
  {
    name: "HP Sure Recover",
    publisher: "HP Inc.",
    iconUrl: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@develop/icons/hp.svg",
    keywords: ["hp sure recover", "sure recover", "recover"]
  },
  {
    name: "HP Wolf Security",
    publisher: "HP Inc.",
    iconUrl: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@develop/icons/hp.svg",
    keywords: ["hp wolf security", "wolf security", "wolf"]
  },
  {
    name: "HP Wolf Security - Console",
    publisher: "HP Inc.",
    iconUrl: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@develop/icons/hp.svg",
    keywords: ["hp wolf security console", "wolf security console", "wolf console"]
  },
  {
    name: "HP Sure Run Module",
    publisher: "HP Inc.",
    iconUrl: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@develop/icons/hp.svg",
    keywords: ["hp sure run", "sure run module", "sure run"]
  },
  {
    name: "HP System Default Settings",
    publisher: "HP Inc.",
    iconUrl: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@develop/icons/hp.svg",
    keywords: ["hp system default", "system default settings", "default settings"]
  },

  // Microsoft System Components
  {
    name: "Application Verifier x64 External Package",
    publisher: "Microsoft Corporation",
    iconUrl: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@develop/icons/microsoft.svg",
    keywords: ["application verifier", "verifier", "microsoft verifier"]
  },
  {
    name: "DiagnosticsHub_CollectionService",
    publisher: "Microsoft Corporation",
    iconUrl: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@develop/icons/microsoft.svg",
    keywords: ["diagnostics hub", "collection service", "diagnostics"]
  }
];

// Function to find a matching icon for a program
export function findIconForProgram(programName: string, publisher?: string): IconInfo | null {
  const name = programName.toLowerCase();
  const pub = publisher?.toLowerCase() || '';

  // First, try exact name match
  let match = COMMON_APP_ICONS.find(icon => 
    icon.name.toLowerCase() === name || 
    icon.keywords.some(keyword => keyword.toLowerCase() === name)
  );

  if (match) return match;

  // Then try partial keyword matching (more flexible)
  match = COMMON_APP_ICONS.find(icon => 
    icon.keywords.some(keyword => {
      const keywordLower = keyword.toLowerCase();
      return name.includes(keywordLower) || 
             keywordLower.includes(name) ||
             // Check if any word in the program name matches any keyword
             name.split(' ').some(word => 
               word.length > 2 && (
                 keywordLower.includes(word) || 
                 word.includes(keywordLower)
               )
             );
    })
  );

  if (match) return match;

  // Try publisher-based matching for known publishers
  if (publisher) {
    // HP programs
    if (pub.includes('hp')) {
      match = COMMON_APP_ICONS.find(icon => 
        icon.publisher?.toLowerCase().includes('hp')
      );
      if (match) return match;
    }
    
    // Microsoft programs
    if (pub.includes('microsoft')) {
      match = COMMON_APP_ICONS.find(icon => 
        icon.publisher?.toLowerCase().includes('microsoft')
      );
      if (match) return match;
    }
  }

  return null;
}

// Function to get a generic icon based on program type
export function getGenericIconForType(programType: string): string {
  switch (programType.toLowerCase()) {
    case 'application':
      return "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@develop/icons/windows.svg";
    case 'systemcomponent':
      return "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@develop/icons/microsoft.svg";
    case 'update':
      return "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@develop/icons/microsoft.svg";
    default:
      return "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@develop/icons/windows.svg";
  }
}
