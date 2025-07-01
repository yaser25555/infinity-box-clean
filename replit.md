# INFINITY BOX - Gaming Platform

## Overview

INFINITY BOX is a full-stack gaming platform built with React/TypeScript frontend and Express.js backend. The application features a comprehensive gaming ecosystem with voice chat, user authentication, admin controls, and database management. The platform supports multiple games, real-time communication, and user management with role-based access control.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Framework**: Tailwind CSS with shadcn/ui components
- **State Management**: React hooks and context
- **Real-time Communication**: WebSocket integration
- **HTTP Client**: Fetch API with custom service layer

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Session Management**: In-memory storage with fallback to database
- **Real-time Features**: WebSocket server integration
- **Authentication**: JWT-based authentication system

### Database Design
- **Primary Database**: PostgreSQL (configured via Drizzle)
- **Schema Management**: Drizzle Kit for migrations and schema deployment
- **User Management**: Complete users table with profile data, game statistics, and authentication
- **Game Data Storage**: User progress, scores, achievements, and coin system
- **Data Validation**: Zod schemas for type safety
- **Real-time Data**: WebSocket connections for live updates

## Key Components

### Authentication System
- **User Registration**: Username/email/password registration
- **Login System**: JWT token-based authentication
- **Role Management**: Admin and regular user roles
- **Session Persistence**: Local storage with automatic token validation

### Gaming Platform
- **Game Grid**: Displays available games with ratings and player counts
- **Featured Games**: Special highlighting for popular games
- **Game Integration**: External game launching via window.open
- **User Progress**: Score tracking and achievement system

### Voice Chat System
- **Real-time Communication**: WebSocket-based voice room management
- **User Presence**: Online status and speaking indicators
- **Chat Integration**: Text messaging alongside voice features
- **Room Management**: Dynamic room creation and user management

### Admin Dashboard
- **User Management**: CRUD operations for user accounts
- **Image Management**: User avatar and profile image administration
- **System Settings**: Game configuration and platform controls
- **Analytics**: User statistics and platform metrics

### UI/UX Components
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Component Library**: shadcn/ui for consistent design system
- **Accessibility**: ARIA compliance and keyboard navigation
- **Theming**: Dark mode support with CSS custom properties

## Data Flow

### Authentication Flow
1. User submits credentials via LoginForm/RegisterForm
2. Frontend sends request to /api/auth/login or /api/auth/register
3. Backend validates credentials and generates JWT token
4. Token stored locally and used for subsequent API requests
5. Auto-logout on token expiration or manual logout

### Game Integration Flow
1. User selects game from GameGrid component
2. Game launches in new window/tab with authentication context
3. Game communicates with backend for score updates
4. Progress synced back to main dashboard

### Real-time Communication Flow
1. WebSocket connection established on authentication
2. User joins default voice room
3. Real-time events broadcast to all connected clients
4. Message and user state synchronization across clients

## External Dependencies

### Frontend Dependencies
- **UI Framework**: @radix-ui/* components for accessible UI primitives
- **Form Handling**: @hookform/resolvers with react-hook-form
- **HTTP Client**: @tanstack/react-query for server state management
- **Utilities**: clsx, class-variance-authority for styling
- **Date Handling**: date-fns for timestamp formatting

### Backend Dependencies
- **Database**: @neondatabase/serverless for PostgreSQL connectivity
- **ORM**: drizzle-orm with drizzle-zod for schema validation
- **Session Storage**: connect-pg-simple for PostgreSQL session store
- **Build Tools**: esbuild for production builds, tsx for development

### Development Dependencies
- **TypeScript**: Full type safety across frontend and backend
- **Vite Plugins**: Replit-specific plugins for development environment
- **Linting**: ESLint configuration for code quality

## Deployment Strategy

### Development Environment
- **Dev Server**: Vite dev server with HMR for frontend
- **Backend Server**: tsx with watch mode for automatic restarts
- **Database**: Local PostgreSQL or cloud database via DATABASE_URL
- **WebSocket**: Integrated with Express server for real-time features

### Production Build
- **Frontend**: Vite build outputs to dist/public
- **Backend**: esbuild bundles server to dist/index.js
- **Static Assets**: Served via Express static middleware
- **Environment**: NODE_ENV=production with optimized builds

### Configuration Management
- **Environment Variables**: DATABASE_URL for database connection
- **Build Scripts**: Separate dev/build/start commands in package.json
- **Database Migrations**: drizzle-kit push for schema updates

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### July 1, 2025 (Continued)
- **Mobile-Optimized Application**: Complete mobile-responsive application with native-like experience
  - Auto-detection of mobile devices and responsive design
  - Dedicated mobile interface with touch-optimized controls
  - Fruit catching game with touch gestures
  - Voice chat rooms with mobile-friendly UI
  - Multiplayer game rooms with real-time sync
  - Complete user profile management
  - Admin account created: username "admin_infinity", password "InfinityBox@2025"
  - Uses same PostgreSQL database and backend infrastructure
  - Status: ✅ Fully functional on mobile and desktop
- **Production Deployment System Fixed**: Resolved "dist/index.js file missing" error
  - Created new `deployment-build.js` script that properly builds for production
  - Uses tsx runtime to handle TypeScript files in production
  - Generates proper dist/ folder structure with all required files
  - Created comprehensive deployment guide (DEPLOYMENT_GUIDE.md)
  - Supports deployment to Render, Railway, Heroku, and other platforms
  - Build command: `node deployment-build.js`
  - Start command in production: `cd dist && npm install && npm start`
  - Status: ✅ Ready for deployment

### June 30, 2025
- **Added Player ID System**: Implemented 6-digit auto-generated player IDs for all users
- **Enhanced Admin Controls**: Added ability to edit player IDs from admin dashboard
- **Improved Game Scoring**: Connected fruit-catching game to database with score tracking
- **Database Schema Updates**: Added playerId field to users table with unique constraint
- **API Enhancements**: Added endpoints for updating player IDs and saving game scores
- **Currency System**: Added gold coins (10,000 default) and pearls (10 default) for all users
- **Advanced Fruit Catching Game**: Redesigned with larger elements, new game mechanics, and currency rewards
- **Mobile Optimization**: Enhanced touch controls and responsive design for mobile devices
- **Visual Enhancements**: Beautiful animated gradient background and improved 3D basket design
- **Audio System**: Complete Web Audio API implementation with musical sound effects for all game events
- **Comprehensive Profile System**: Advanced user profile with friends, gifts, messaging, items, and balance charging
- **UI Icon Update**: Changed diamond icons (💎) to pearl icons (🦪) throughout the entire application for better visual consistency
- **Currency Exchange System**: Complete currency conversion system with multiple exchange rates:
  - 10,000 Gold = 1 Pearl (bidirectional)
  - 10 Pearls = 1 USD (withdrawal via WhatsApp)
  - Minimum withdrawal requirement: 25 USD (250 pearls)
  - Real-time balance display with USD value calculation
- **USD Charging System**: Direct payment system via WhatsApp:
  - 5,000 Gold = $1 USD
  - 27,200 Gold = $5 USD (8% savings)
  - 65,000 Gold = $10 USD (30% savings)
  - Automatic WhatsApp redirect with player details
- **Welcome Bonus System**: Automatic rewards for new users:
  - 10,000 Gold coins upon registration
  - 1 Pearl (equivalent to $1 USD) as welcome gift
  - Duplicate account prevention with email/username validation
  - Welcome transaction recorded in user history
- **Shield Protection System**: Complete protection system against harmful elements:
  - Gold Shield: 2,000 Gold for 24-hour protection
  - Advanced Shield: 20,000 Gold for 7-day protection
  - Protects against harmful gifts (bombs, bats, snakes) but NOT in games
  - Real-time shield status checking and expiration validation
- **Enhanced Gift System**: Complete gifting system with multiple item types:
  - Currency Gifts: Gold coins for trading and purchases
  - Harmful Elements: Bombs (💣), Bats (🦇), Snakes (🐍) - cause coin/pearl loss
  - Beneficial Elements: Gems (💎), Stars (⭐), Coin Items (🪙) - increase currency
  - All elements obtainable from games and tradeable between players
- **Clarified Pearl Usage**: Pearls (🦪) used ONLY for USD conversion, not for purchases or trading
- **Mobile Profile Redesign**: New MobileProfileCard component with gender-based theming:
  - Male users: Blue and yellow color scheme
  - Female users: Pink and red color scheme
  - Profile picture upload and gender selection functionality
  - Complete sections for friends, gifts, items, shields, charging, and exchange
- **Enhanced Privacy Controls**: Strict visibility restrictions for profile information:
  - Visitors can ONLY see: Name, profile picture, player ID, and level
  - Private data (currency, items, shields, transactions) visible to profile owner only
  - All sensitive tabs (friends, gifts, items, shields, charging, exchange) restricted to owner
- **Dynamic Item Counters**: Real-time display of game item quantities:
  - Beneficial items: Gems (💎), Stars (⭐), Coins (🪙) with current counts
  - Harmful items: Bombs (💣), Bats (🦇), Snakes (🐍) with current counts
  - Item counts update automatically when earned from games or received as gifts
- **Sidebar UI Enhancement**: Removed all transparency effects from sidebar dropdown menu:
  - Replaced transparent backgrounds with solid slate colors
  - Changed from `bg-white/5` to `bg-slate-900` for main sidebar
  - Updated borders from `border-white/10` to `border-slate-700`
  - Navigation buttons now use `bg-slate-700` and `bg-slate-800` for better visibility
- **Backend Integration Setup**: Configured frontend to connect with external MongoDB backend:
  - Updated API service to point to Render backend: https://mygame25bita-7eqw.onrender.com
  - Created deployment documentation for GitHub migration
  - Prepared environment configuration for production deployment
  - Backend uses MongoDB Atlas database instead of PostgreSQL
- **Production Deployment**: Successfully deployed to production environment:
  - Frontend deployed to Netlify: https://infinity-box25.netlify.app
  - Backend running on Render: https://mygame25bita-7eqw.onrender.com
  - Database hosted on MongoDB Atlas
  - Updated CORS configuration for production domain
  - **Status**: ✅ Fully operational and tested in production

### July 1, 2025
- **Fixed Main Dashboard Navigation**: Resolved issue where voice chat was opening automatically by removing localStorage activeTab persistence
- **Fixed Fruit Catching Game Access**: Updated game launch URL to use proper origin path for consistent access across environments
- **Enhanced User Experience**: Ensured games tab opens by default on login for better user flow
- **Single Device Login Security**: Implemented session management to prevent multiple device logins simultaneously
  - Added activeSessionToken field to users table for session tracking
  - Login from new device automatically invalidates previous sessions
  - User receives notification when session is terminated from another device
  - Server-side logout properly clears session tokens
- **Navigation & Game Display Fixes**: Completed UI improvements for better user experience
  - Fruit catching game now displays prominently at the top of featured games section
  - Voice chat no longer opens automatically on login - games tab is default
  - Removed localStorage activeTab persistence completely to prevent auto-navigation
  - Updated GameGrid component to prioritize fruit catching game with 🍎 icon
- **Project Migration to Replit**: Successfully migrated and restored full functionality in Replit environment
  - **Fixed Missing Dependencies**: Installed required @replit/vite-plugin-runtime-error-modal and @replit/vite-plugin-cartographer packages
  - **Corrected PostCSS Configuration**: Updated postcss.config.js to use proper tailwindcss plugin instead of incorrect @tailwindcss/postcss
  - **Fixed API Endpoint Duplicates**: Resolved API routing issue where endpoints had duplicate /api/ prefix causing 404 errors
  - **Database Integration**: Verified PostgreSQL database connection and confirmed all tables are properly created
  - **UI Components Restored**: All Tailwind CSS styling and UI components now display correctly
  - **Server Stability**: Application runs consistently on port 5000 without crashes
  - **Status**: ✅ Fully operational in Replit environment
- **Database Connection Fixed**: Resolved critical database connectivity issues
  - **Updated Drizzle Configuration**: Changed from Neon serverless to standard PostgreSQL driver
  - **Fixed Storage Layer**: Corrected database client initialization in server/db.ts
  - **Verified User Operations**: Successfully tested user registration and authentication
  - **Added Error Logging**: Enhanced error handling with detailed logging for debugging
  - **Full Functionality Restored**: All user management, game features, and social systems now operational
  - **Status**: ✅ Database fully connected and all features working
- **Advanced Multiplayer Gaming System**: Implemented comprehensive online gaming infrastructure
  - **Game Synchronization Manager**: Real-time game state synchronization across multiple players
  - **Room-based Gaming**: Private and public game rooms with customizable settings
  - **Player Management**: Host privileges, ready states, and live player tracking
  - **Game Types Support**: Fruit catching, racing, puzzle games with extensible architecture
  - **Real-time Events**: Player moves, scoring, powerups, and game state updates
  - **API Integration**: Complete REST endpoints for game room management
  - **Status**: ✅ Multiplayer gaming infrastructure operational
- **Professional Voice Chat System**: Advanced real-time voice communication platform
  - **Voice Room Management**: Create, join, and manage voice chat rooms
  - **Audio Processing**: Echo cancellation, noise reduction, and quality control
  - **Real-time Audio Streaming**: WebRTC-based audio transmission with low latency
  - **User Controls**: Mute, volume, speaker controls with visual indicators
  - **Room Settings**: Private rooms, user limits, and administrative controls
  - **Audio Context Management**: Professional audio handling with Web Audio API
  - **Status**: ✅ Voice chat system fully functional
- **Production Deployment System**: Fixed all deployment issues and created robust build system
  - **Build System Fixed**: Resolved "dist/index.js file missing" error with comprehensive build script
  - **Production Configuration**: Created optimized package.json with only required dependencies
  - **Proper File Structure**: Frontend builds to dist/public/, server files to dist/server/
  - **Environment Configuration**: Proper NODE_ENV=production setup with all required variables
  - **Deployment Verification**: Created automated verification script to check build integrity
  - **Documentation**: Complete deployment instructions with step-by-step guide
  - **Status**: ✅ Ready for production deployment to Netlify/Render

### Features Added
- **6-Digit Player ID**: Auto-generated unique identifiers for each user
- **Dual Currency System**: Gold coins for gameplay, pearls for special features
- **Enhanced Fruit Catching Game**: Features multiple element types:
  - Fresh fruits (🍎🍊🍌🍇): Points and gold rewards
  - Rotten fruits (🤢): Negative penalties
  - Bombs (💣): Currency deduction (gold and pearls)
  - Combo baskets (🎁): Large bonus rewards
  - Fruit salads (🥗): Massive rewards with pearl bonuses
- **Combo System**: Streak-based scoring with visual indicators
- **Server Synchronization**: Real-time currency updates with database persistence
- **Admin Player ID Management**: Edit and validate player IDs from admin panel
- **Game Score Database Integration**: Persistent score storage with user tracking
- **Complete Profile System**: Comprehensive user profile with multiple advanced features:
  - Friend system with requests, acceptance, and management
  - Gift system for sending gold, pearls, and items between players
  - Private messaging system for player communication
  - Item and shield management with activation system
  - Balance charging with transaction history
  - Currency exchange system with USD withdrawal via WhatsApp
  - User statistics and activity tracking
- **Shield Protection System**: Comprehensive defense mechanism:
  - Two shield types: Gold Shield (2,000 Gold/24h) and USD Shield ($1/7 days)
  - Complete database integration with userShields table
  - Real-time protection status checking and automatic expiration
  - Integrated into fruit-catching game with visual/audio feedback
  - Blocks harmful gifts and game elements (bombs, traps, negative gifts)
  - API endpoints for activation, status checking, and management
  - Frontend interface in user profile with protection status display
- **Advanced Multiplayer Gaming Features**: Complete online gaming system
  - Real-time game room creation and management with customizable settings
  - Support for multiple game types (fruit catching, racing, puzzles)
  - Player host privileges, ready states, and live participant tracking
  - WebSocket-based real-time synchronization for moves, scores, and powerups
  - Private/public room options with password protection
  - Difficulty levels and competitive/cooperative game modes
  - REST API endpoints for game room data retrieval and management
- **Professional Voice Chat System**: Enterprise-grade voice communication
  - Real-time voice room creation with customizable audio settings
  - WebRTC audio streaming with echo cancellation and noise reduction
  - Individual user controls (mute, volume, speaker management)
  - Audio quality selection (low/medium/high) with automatic optimization
  - Visual speaking indicators and user status management
  - Echo test functionality for audio calibration
  - Web Audio API integration for professional audio handling

## Changelog

Changelog:
- June 30, 2025. Initial setup and major feature additions