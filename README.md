# Software Scope

A modern Windows software management tool built with Tauri, React, and Rust. Provides detailed insights into installed programs and their registry information.

## Features

### Core Features
- 📦 Comprehensive software inventory scanning
  - 32-bit and 64-bit program detection
  - Detailed installation information
  - Registry data collection

- 🔍 Advanced search and filtering
  - Real-time search functionality
  - Publisher filtering
  - Installation date filtering
  - Program type filtering (Application/Update/System Component)
  - Customizable sorting

- 📊 Detailed Program Information
  - Basic program details
  - Installation information
  - Registry paths and data
  - System integration details

### Additional Features
- 📋 Copy functionality for paths and commands
- 🎯 Collapsible information sections
- 📁 Advanced program details view
- 💻 Architecture detection (32/64-bit)

## Getting Started

### Prerequisites
- Node.js (v16 or later)
- Rust (latest stable)
- Windows OS

### Installation
1. Clone the repository
git clone https://github.com/yourusername/software-scope.git
cd software-scope


2. Install dependencies
npm install

3. Run the development server
npm run tauri dev


## Development

### Tech Stack
- Frontend: React, TypeScript, Chakra UI
- Backend: Rust, Tauri
- Build: Vite

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build production version
- `npm run tauri dev` - Start Tauri development
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier

## Current Status
The project is in active development. Recent additions include:
- Enhanced program details view with collapsible sections
- Extended registry information display
- Copy functionality for paths and commands
- Advanced program information display

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## License
[License Type] - see the LICENSE file for details