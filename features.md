# MRI Analysis Platform - Development Structure & Architecture

## 🏗️ Project Overview

The MRI Analysis Platform is a comprehensive web application for medical brain scan analysis, featuring 3D visualization, AI-powered anomaly detection, and professional medical reporting. Think of it as a **digital radiology workstation** where doctors can upload brain scans and get detailed analysis reports.

---

## 📁 Project Structure

```
mri-analysis-platform/
├── client/                 # Frontend (React App)
├── server/                 # Backend (Express.js API)
├── shared/                 # Common code between frontend/backend
├── attached_assets/        # User uploaded files and generated content
├── models/                 # AI model files and 3D models
└── uploads/                # Temporary file storage
```

---

## 🎯 Core System Architecture

### **Analogy: Hospital Workflow**
Imagine a modern hospital's radiology department:
- **Reception Desk** = Frontend UI (where patients check in)
- **Imaging Room** = File Upload System (where scans are taken)
- **Radiologist Office** = Analysis Engine (where experts review scans)
- **Report Generator** = PDF/Export System (where final reports are created)
- **Medical Records** = Database (where everything is stored)

---

## 📂 Detailed File Structure & Functionality

### **🎨 Frontend (client/)**

#### **Core Pages & Components**
```
client/src/
├── pages/
│   └── home.tsx                 # Main application shell
├── components/
│   ├── analysis-accordion.tsx   # 3-step workflow component
│   ├── medical-sidebar.tsx      # Navigation & scan history
│   ├── patient-details-sidebar.tsx # Patient info & controls
│   ├── three-d-viewer.tsx       # 3D brain visualization
│   ├── metrics-dashboard.tsx    # Medical analysis metrics
│   ├── detection-overlay.tsx    # Anomaly detection display
│   └── ui/                      # Reusable UI components
├── hooks/
│   ├── use-scan-data.ts         # Data fetching & caching
│   ├── use-processing-state.ts  # Upload & processing state
│   └── use-file-upload.ts       # File upload management
└── lib/
    └── queryClient.ts           # API communication setup
```

#### **🧩 Key Components Explained**

**1. analysis-accordion.tsx**
- **Purpose**: Main workflow orchestrator
- **Analogy**: Like a **hospital intake form** that guides patients through check-in, examination, and results
- **Functionality**: 
  - Step 1: File upload interface
  - Step 2: Processing progress tracking
  - Step 3: Results display with 3D viewer
- **Importance**: ⭐⭐⭐⭐⭐ (Core user experience)

**2. three-d-viewer.tsx**
- **Purpose**: Interactive 3D brain model visualization
- **Analogy**: Like a **holographic brain projector** doctors use to examine anatomy
- **Functionality**:
  - WebGL-based 3D rendering using Three.js
  - Real-time rotation and zoom controls
  - Anomaly markers overlaid on brain structure
- **Importance**: ⭐⭐⭐⭐⭐ (Primary visualization tool)

**3. medical-sidebar.tsx**
- **Purpose**: Navigation and scan history management
- **Analogy**: Like a **patient file cabinet** where you can quickly access any previous scan
- **Functionality**:
  - Navigation between different views
  - Recent scans list with status indicators
  - Quick scan switching capabilities
- **Importance**: ⭐⭐⭐⭐ (Essential navigation)

**4. patient-details-sidebar.tsx**
- **Purpose**: Patient information and scan metadata display
- **Analogy**: Like a **patient chart** hanging at the foot of a hospital bed
- **Functionality**:
  - Real-time patient demographics
  - Scan status and processing information
  - Risk assessment display
  - Report download controls
- **Importance**: ⭐⭐⭐⭐ (Critical medical context)

**5. metrics-dashboard.tsx**
- **Purpose**: Medical analysis metrics visualization
- **Analogy**: Like **lab test results** displayed on a dashboard
- **Functionality**:
  - Risk score visualization
  - Medical metrics (vascular health, tissue density)
  - Confidence intervals and quality scores
- **Importance**: ⭐⭐⭐⭐⭐ (Core medical analysis)

#### **🔗 Hooks (Data Management)**

**use-scan-data.ts**
- **Purpose**: Centralized data fetching and caching
- **Analogy**: Like a **medical records clerk** who fetches patient files when needed
- **Key Functions**:
  - `useScans()`: Get all scans list
  - `useScan(id)`: Get specific scan details
  - `useCurrentScan()`: Get currently selected scan
- **Importance**: ⭐⭐⭐⭐⭐ (Data backbone)

**use-processing-state.ts**
- **Purpose**: Manages upload and processing workflow state
- **Analogy**: Like a **surgery coordinator** tracking operation progress
- **Functionality**:
  - Upload progress tracking
  - Processing stage management
  - Error state handling
- **Importance**: ⭐⭐⭐⭐ (User experience flow)

---

### **🖥️ Backend (server/)**

#### **Core Server Architecture**
```
server/
├── index.ts                 # Main server entry point
├── routes.ts                # API endpoints definition
├── storage.ts               # Database interface layer
├── vite.ts                  # Development server setup
└── services/
    ├── 3d-conversion-service.ts    # 3D model generation
    ├── medical-analysis-service.ts # AI analysis engine
    └── report-generation-service.ts # PDF report creation
```

#### **🔧 Key Server Files Explained**

**1. routes.ts**
- **Purpose**: API endpoint definitions (REST API)
- **Analogy**: Like a **hospital directory** telling you which department handles what
- **Key Endpoints**:
  - `POST /api/scans/upload` - File upload handling
  - `GET /api/scans/:id` - Scan data retrieval
  - `POST /api/scans/:id/convert` - 3D processing trigger
  - `GET /api/scans/:id/report` - Analysis report generation
- **Importance**: ⭐⭐⭐⭐⭐ (API backbone)

**2. storage.ts**
- **Purpose**: Database abstraction layer
- **Analogy**: Like a **medical records database** with standardized access methods
- **Functionality**:
  - Database connection management
  - CRUD operations for scans and reports
  - Data validation and sanitization
- **Importance**: ⭐⭐⭐⭐⭐ (Data persistence)

**3. 3d-conversion-service.ts**
- **Purpose**: Converts 2D medical images to 3D models
- **Analogy**: Like a **medical imaging technician** who processes raw scans
- **Functionality**:
  - Image preprocessing and validation
  - 3D mesh generation algorithms
  - Model optimization for web display
- **Importance**: ⭐⭐⭐⭐ (Core feature)

**4. medical-analysis-service.ts**
- **Purpose**: AI-powered medical analysis engine
- **Analogy**: Like a **radiologist's assistant** that pre-analyzes scans
- **Functionality**:
  - Anomaly detection algorithms
  - Risk score calculation
  - Medical classification logic
- **Importance**: ⭐⭐⭐⭐⭐ (Core medical intelligence)

**5. report-generation-service.ts**
- **Purpose**: Generates professional medical reports
- **Analogy**: Like a **medical secretary** who formats doctor's findings into official reports
- **Functionality**:
  - PDF generation with medical formatting
  - Structured data export (JSON)
  - Template-based reporting
- **Importance**: ⭐⭐⭐⭐ (Professional output)

---

### **🔄 Shared Code (shared/)**

#### **Database Schema & Types**
```
shared/
├── schema.ts               # Database schema definition
└── types.ts                # TypeScript type definitions
```

**schema.ts**
- **Purpose**: Single source of truth for data structure
- **Analogy**: Like **hospital forms** that define what information goes where
- **Key Tables**:
  - `mri_scans`: Core scan metadata and processing status
  - `analysis_reports`: Medical analysis results and risk assessments
- **Importance**: ⭐⭐⭐⭐⭐ (Data contract)

---

## 🔄 Data Flow Architecture

### **Complete Workflow (Hospital Analogy)**

1. **Patient Arrives** (File Upload)
   - User drags MRI file into upload area
   - Frontend validates file type and size
   - File uploaded to cloud storage

2. **Registration** (Database Entry)
   - Scan metadata saved to database
   - Unique ID generated for tracking
   - Processing status set to "pending"

3. **Imaging Analysis** (AI Processing)
   - 3D conversion service processes the image
   - Medical analysis engine detects anomalies
   - Risk scores and findings calculated

4. **Radiologist Review** (Results Display)
   - 3D model rendered in browser
   - Anomalies overlaid on brain structure
   - Medical metrics displayed in dashboard

5. **Report Generation** (Final Output)
   - Professional PDF report created
   - Analysis data exported as JSON
   - Results stored for future reference

---

## 🏥 System Dependencies & Technologies

### **Frontend Stack**
- **React 18**: UI framework (like the hospital's front desk system)
- **TypeScript**: Type safety (like medical protocols ensuring no mistakes)
- **Three.js**: 3D graphics (like advanced medical imaging equipment)
- **TanStack Query**: Data management (like efficient medical records system)
- **Tailwind CSS**: Styling (like hospital interior design standards)

### **Backend Stack**
- **Node.js + Express**: Server framework (like hospital infrastructure)
- **PostgreSQL**: Database (like secure medical records vault)
- **Drizzle ORM**: Database interface (like standardized filing system)
- **PDFKit**: Report generation (like professional report printer)

### **Development Tools**
- **Vite**: Build tool (like hospital construction manager)
- **TypeScript**: Development safety (like medical safety protocols)
- **ESLint**: Code quality (like hospital quality assurance)

---

## 🎯 Critical Success Factors

### **For Students Learning This System:**

1. **Start with Database Schema** 📊
   - Understand `shared/schema.ts` first
   - This defines what data the entire system works with

2. **Follow the Data Flow** 🔄
   - Trace a single scan from upload to report
   - Understand how frontend and backend communicate

3. **Master State Management** 🧠
   - Learn React Query patterns in hooks
   - Understand how processing state flows through components

4. **Understand Medical Context** 🏥
   - Learn basic radiology concepts
   - Understand why certain data structures exist

5. **Practice Component Architecture** 🧩
   - Study how complex UI is broken into manageable pieces
   - Learn when to create new components vs. extend existing ones

---

## 🚀 Key Learning Outcomes

After studying this codebase, students will understand:

- **Full-stack TypeScript development** with shared types
- **Medical software architecture** patterns and requirements
- **Real-time data synchronization** between multiple UI components
- **File upload and processing** workflows in web applications
- **3D visualization** integration in web browsers
- **Professional PDF generation** from structured data
- **Database design** for complex medical data
- **State management** in complex React applications

This system demonstrates how modern web technologies can create professional-grade medical software that rivals traditional desktop applications.