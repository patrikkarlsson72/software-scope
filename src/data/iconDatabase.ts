// Database of common applications with their icon information
// This provides fallback icons when local icons can't be found

export interface IconInfo {
  name: string;
  publisher?: string;
  iconUrl: string;
  keywords: string[]; // Alternative names or keywords to match
}

// Common applications with their icon paths
// Using local assets for better performance and reliability
export const COMMON_APP_ICONS: IconInfo[] = [
  // Microsoft Applications
  {
    name: "Microsoft Office",
    publisher: "Microsoft Corporation",
    iconUrl: "/src/assets/icons/office.svg",
    keywords: ["office", "word", "excel", "powerpoint", "outlook", "access", "publisher", "visio"]
  },
  {
    name: "Microsoft Visual Studio",
    publisher: "Microsoft Corporation", 
    iconUrl: "/src/assets/icons/microsoft.svg",
    keywords: ["visual studio", "vs", "microsoft visual studio"]
  },
  {
    name: "Microsoft Edge",
    publisher: "Microsoft Corporation",
    iconUrl: "/src/assets/icons/edge.svg",
    keywords: ["edge", "microsoft edge", "msedge"]
  },
  {
    name: "Microsoft Teams",
    publisher: "Microsoft Corporation",
    iconUrl: "/src/assets/icons/teams.svg",
    keywords: ["teams", "microsoft teams"]
  },
  {
    name: "OneDrive",
    publisher: "Microsoft Corporation",
    iconUrl: "/src/assets/icons/onedrive.svg",
    keywords: ["onedrive", "microsoft onedrive"]
  },
  {
    name: "Skype",
    publisher: "Microsoft Corporation",
    iconUrl: "/src/assets/icons/microsoft.svg",
    keywords: ["skype"]
  },

  // Google Applications
  {
    name: "Google Chrome",
    publisher: "Google LLC",
    iconUrl: "/src/assets/icons/chrome.svg",
    keywords: ["chrome", "google chrome"]
  },
  {
    name: "Google Drive",
    publisher: "Google LLC",
    iconUrl: "/src/assets/icons/chrome.svg",
    keywords: ["google drive", "drive"]
  },
  {
    name: "Google Earth",
    publisher: "Google LLC",
    iconUrl: "/src/assets/icons/chrome.svg",
    keywords: ["google earth", "earth"]
  },

  // Adobe Applications
  {
    name: "Adobe Acrobat",
    publisher: "Adobe Inc.",
    iconUrl: "/src/assets/icons/adobe.svg",
    keywords: ["acrobat", "adobe acrobat", "pdf", "adobe reader"]
  },
  {
    name: "Adobe Photoshop",
    publisher: "Adobe Inc.",
    iconUrl: "/src/assets/icons/adobe.svg",
    keywords: ["photoshop", "adobe photoshop", "ps"]
  },
  {
    name: "Adobe Illustrator",
    publisher: "Adobe Inc.",
    iconUrl: "/src/assets/icons/adobe.svg",
    keywords: ["illustrator", "adobe illustrator", "ai"]
  },
  {
    name: "Adobe Premiere Pro",
    publisher: "Adobe Inc.",
    iconUrl: "/src/assets/icons/adobe.svg",
    keywords: ["premiere", "adobe premiere", "premiere pro"]
  },

  // Development Tools
  {
    name: "Visual Studio Code",
    publisher: "Microsoft Corporation",
    iconUrl: "/src/assets/icons/vscode.svg",
    keywords: ["vscode", "visual studio code", "code"]
  },
  {
    name: "Git",
    publisher: "The Git Development Community",
    iconUrl: "/src/assets/icons/git.svg",
    keywords: ["git"]
  },
  {
    name: "GitHub Desktop",
    publisher: "GitHub Inc.",
    iconUrl: "/src/assets/icons/git.svg",
    keywords: ["github desktop", "github"]
  },
  {
    name: "Node.js",
    publisher: "Node.js Foundation",
    iconUrl: "/src/assets/icons/microsoft.svg",
    keywords: ["node", "nodejs", "node.js"]
  },
  {
    name: "Python",
    publisher: "Python Software Foundation",
    iconUrl: "/src/assets/icons/microsoft.svg",
    keywords: ["python"]
  },
  {
    name: "Docker",
    publisher: "Docker Inc.",
    iconUrl: "/src/assets/icons/microsoft.svg",
    keywords: ["docker"]
  },

  // Browsers
  {
    name: "Mozilla Firefox",
    publisher: "Mozilla Corporation",
    iconUrl: "/src/assets/icons/firefox.svg",
    keywords: ["firefox", "mozilla firefox"]
  },
  {
    name: "Brave",
    publisher: "Brave Software Inc",
    iconUrl: "/src/assets/icons/brave.svg",
    keywords: ["brave"]
  },
  {
    name: "Opera",
    publisher: "Opera Software",
    iconUrl: "/src/assets/icons/chrome.svg",
    keywords: ["opera"]
  },
  {
    name: "Vivaldi",
    publisher: "Vivaldi Technologies",
    iconUrl: "/src/assets/icons/chrome.svg",
    keywords: ["vivaldi"]
  },

  // Media Players
  {
    name: "VLC Media Player",
    publisher: "VideoLAN",
    iconUrl: "/src/assets/icons/microsoft.svg",
    keywords: ["vlc", "vlc media player"]
  },
  {
    name: "Spotify",
    publisher: "Spotify AB",
    iconUrl: "/src/assets/icons/microsoft.svg",
    keywords: ["spotify"]
  },
  {
    name: "Winamp",
    publisher: "Nullsoft",
    iconUrl: "/src/assets/icons/microsoft.svg",
    keywords: ["winamp"]
  },

  // Communication
  {
    name: "Discord",
    publisher: "Discord Inc.",
    iconUrl: "/src/assets/icons/discord.svg",
    keywords: ["discord"]
  },
  {
    name: "Slack",
    publisher: "Slack Technologies",
    iconUrl: "/src/assets/icons/microsoft.svg",
    keywords: ["slack"]
  },
  {
    name: "Zoom",
    publisher: "Zoom Video Communications",
    iconUrl: "/src/assets/icons/microsoft.svg",
    keywords: ["zoom"]
  },
  {
    name: "WhatsApp",
    publisher: "WhatsApp Inc.",
    iconUrl: "/src/assets/icons/microsoft.svg",
    keywords: ["whatsapp"]
  },

  // Gaming
  {
    name: "Steam",
    publisher: "Valve Corporation",
    iconUrl: "/src/assets/icons/steam.svg",
    keywords: ["steam"]
  },
  {
    name: "Epic Games",
    publisher: "Epic Games Inc.",
    iconUrl: "/src/assets/icons/microsoft.svg",
    keywords: ["epic games", "epic launcher"]
  },
  {
    name: "Origin",
    publisher: "Electronic Arts",
    iconUrl: "/src/assets/icons/microsoft.svg",
    keywords: ["origin", "ea origin"]
  },

  // Utilities
  {
    name: "7-Zip",
    publisher: "Igor Pavlov",
    iconUrl: "/src/assets/icons/microsoft.svg",
    keywords: ["7-zip", "7zip"]
  },
  {
    name: "WinRAR",
    publisher: "RARLAB",
    iconUrl: "/src/assets/icons/microsoft.svg",
    keywords: ["winrar", "rar"]
  },
  {
    name: "Notepad++",
    publisher: "Notepad++ Team",
    iconUrl: "/src/assets/icons/microsoft.svg",
    keywords: ["notepad++", "notepad plus plus"]
  },
  {
    name: "PuTTY",
    publisher: "Simon Tatham",
    iconUrl: "/src/assets/icons/microsoft.svg",
    keywords: ["putty"]
  },

  // Security
  {
    name: "Windows Defender",
    publisher: "Microsoft Corporation",
    iconUrl: "/src/assets/icons/microsoft.svg",
    keywords: ["windows defender", "defender", "microsoft defender"]
  },
  {
    name: "Malwarebytes",
    publisher: "Malwarebytes Inc.",
    iconUrl: "/src/assets/icons/microsoft.svg",
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
      return "/src/assets/icons/microsoft.svg";
    case 'systemcomponent':
      return "/src/assets/icons/microsoft.svg";
    case 'update':
      return "/src/assets/icons/microsoft.svg";
    default:
      return "/src/assets/icons/microsoft.svg";
  }
}
