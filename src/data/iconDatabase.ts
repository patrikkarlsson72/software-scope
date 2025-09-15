// Simplified icon database - minimal fallback system
// This provides simple generic icons when executable extraction fails

export interface IconInfo {
  name: string;
  publisher?: string;
  iconUrl: string;
  keywords: string[];
}

// Simple generic icons for common publishers
export const GENERIC_ICONS: IconInfo[] = [
  // HP programs
  {
    name: "HP Applications",
    publisher: "HP Inc",
    iconUrl: "/src/assets/icons/hp.svg",
    keywords: ["hp", "hewlett packard"]
  },
  {
    name: "HP Applications",
    publisher: "HP",
    iconUrl: "/src/assets/icons/hp.svg",
    keywords: ["hp", "hewlett packard"]
  },

  // Microsoft programs
  {
    name: "Microsoft Applications",
    publisher: "Microsoft Corporation",
    iconUrl: "/src/assets/icons/microsoft.svg",
    keywords: ["microsoft", "ms"]
  },
  {
    name: "Microsoft Applications",
    publisher: "Microsoft",
    iconUrl: "/src/assets/icons/microsoft.svg",
    keywords: ["microsoft", "ms"]
  },

  // Adobe programs
  {
    name: "Adobe Applications",
    publisher: "Adobe Inc.",
    iconUrl: "/src/assets/icons/adobe.svg",
    keywords: ["adobe", "adobe inc"]
  },

  // Google programs
  {
    name: "Google Applications",
    publisher: "Google LLC",
    iconUrl: "/src/assets/icons/chrome.svg",
    keywords: ["google", "google llc"]
  },

  // Default fallback
  {
    name: "Generic Application",
    publisher: "Unknown",
    iconUrl: "/src/assets/icons/microsoft.svg",
    keywords: ["generic", "unknown", "default"]
  }
];

// Function to find a generic icon based on publisher
export function findGenericIconForPublisher(publisher?: string): IconInfo | null {
  if (!publisher) {
    return GENERIC_ICONS.find(icon => icon.name === "Generic Application") || null;
  }

  const pub = publisher.toLowerCase();

  // Try to find matching publisher
  let match = GENERIC_ICONS.find(icon => 
    icon.publisher?.toLowerCase() === pub ||
    icon.keywords.some(keyword => keyword.toLowerCase() === pub)
  );

  if (match) {
    return match;
  }

  // Try partial matching
  match = GENERIC_ICONS.find(icon => 
    icon.keywords.some(keyword => 
      pub.includes(keyword.toLowerCase()) || 
      keyword.toLowerCase().includes(pub)
    )
  );

  if (match) {
    return match;
  }

  // Return default generic icon
  return GENERIC_ICONS.find(icon => icon.name === "Generic Application") || null;
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