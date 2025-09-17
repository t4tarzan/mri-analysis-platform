# Overview

This is an MRI Research Platform designed for advanced 3D analysis and anomaly detection of medical brain scans. The application provides a comprehensive workflow for uploading MRI images, converting them to 3D models, performing AI-powered analysis to detect anomalies like aneurysms and lesions, and generating detailed analysis reports with risk assessments and technical summaries.

The platform is built as a modern full-stack web application with a React frontend and Express.js backend, featuring real-time processing status updates, interactive 3D visualization capabilities, and a step-by-step analysis workflow designed for medical research purposes.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client-side is built using React with TypeScript, featuring a modern component-based architecture. The UI uses shadcn/ui components built on Radix UI primitives for accessibility and consistency. The application follows a single-page application (SPA) pattern with client-side routing using Wouter. State management is handled through React Query (@tanstack/react-query) for server state and React hooks for local state.

The frontend implements a three-phase accordion-style workflow:
1. MRI Upload & 3D Model Conversion - File upload with drag-and-drop support
2. AI Analysis & Detection Configuration - Configurable detection parameters and real-time analysis
3. Results & Report Generation - Interactive visualizations and comprehensive reporting

## Backend Architecture
The server uses Express.js with TypeScript in ESM module format. The architecture follows a RESTful API design with dedicated route handlers for MRI scan operations. File uploads are handled using Multer with configurable storage and validation. The backend implements middleware for request logging, error handling, and JSON parsing.

The server includes both development and production configurations with Vite integration for development hot reloading and static file serving in production.

## Data Storage Solutions
The application uses a dual storage approach:
- **Production**: PostgreSQL database with Drizzle ORM for type-safe database operations
- **Development/Fallback**: In-memory storage implementation for rapid development and testing

The database schema includes two main entities:
- `mri_scans`: Stores uploaded MRI file metadata, processing status, and detection results
- `analysis_reports`: Contains detailed analysis results including risk scores, findings, and technical summaries

## Database Schema Design
The schema supports complex medical data types through JSON columns for storing:
- Detection arrays with coordinate information and confidence scores
- Critical and secondary findings with medical classifications
- Technical analysis summaries with processing metrics

## Authentication and File Handling
File uploads are secured with MIME type validation (JPG/PNG only) and size limits (50MB). The system uses session-based storage with connect-pg-simple for PostgreSQL session management. Files are stored locally with UUID-based naming for security.

## API Structure
RESTful endpoints for:
- `GET /api/scans` - Retrieve all MRI scans
- `GET /api/scans/:id` - Get specific scan details
- `POST /api/scans/upload` - Upload new MRI files
- `GET /api/scans/:id/report` - Retrieve analysis reports

## Build and Development Configuration
The project uses Vite for frontend bundling with custom aliases and path resolution. The development environment includes hot module replacement, error overlay, and development tools specific to Replit. Production builds are optimized with esbuild for the server and Vite for the client.

# External Dependencies

## UI and Component Libraries
- **shadcn/ui**: Complete component library built on Radix UI primitives for accessible, customizable components
- **Radix UI**: Low-level UI primitives for complex components like dialogs, dropdowns, and form controls
- **Tailwind CSS**: Utility-first CSS framework for responsive design and theming
- **Lucide React**: Icon library for consistent iconography

## Development and Build Tools
- **Vite**: Fast build tool and development server with React plugin support
- **TypeScript**: Static type checking for both frontend and backend code
- **ESBuild**: Fast JavaScript bundler for production server builds
- **PostCSS**: CSS processing with Tailwind CSS integration

## Database and ORM
- **Drizzle ORM**: Type-safe PostgreSQL ORM with schema generation and migrations
- **Neon Database**: Serverless PostgreSQL database service (@neondatabase/serverless)
- **connect-pg-simple**: PostgreSQL session store for Express sessions

## File Handling and Validation
- **Multer**: Multipart form data handling for file uploads
- **Zod**: Runtime type validation and schema parsing for API endpoints

## State Management and Data Fetching
- **TanStack Query**: Server state management with caching, synchronization, and optimistic updates
- **React Hook Form**: Performant form handling with minimal re-renders
- **Hookform Resolvers**: Integration between React Hook Form and validation libraries

## Development Environment
- **Replit-specific plugins**: Development banner, error modal, and cartographer for Replit integration
- **TSX**: TypeScript execution for development server
- **React DevTools**: Browser extension support for debugging

## 3D Visualization (Prepared)
- **Three.js Types**: TypeScript definitions for future 3D model visualization implementation
- **Canvas and WebGL**: Browser APIs for 3D rendering support