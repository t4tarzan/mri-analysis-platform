import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { z } from "zod";
import { insertMriScanSchema, insertAnalysisReportSchema, Detection, CriticalFinding, SecondaryFinding, TechnicalSummary } from "@shared/schema";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  fileFilter: (req, file, cb) => {
    // Accept only JPG and PNG files
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      cb(null, true);
    } else {
      cb(new Error('Only JPG and PNG files are allowed'));
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get all MRI scans
  app.get("/api/scans", async (req, res) => {
    try {
      const scans = await storage.getAllMriScans();
      res.json(scans);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch scans" });
    }
  });

  // Get specific MRI scan
  app.get("/api/scans/:id", async (req, res) => {
    try {
      const scan = await storage.getMriScan(req.params.id);
      if (!scan) {
        return res.status(404).json({ message: "Scan not found" });
      }
      res.json(scan);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch scan" });
    }
  });

  // Development-only test helper endpoint for creating scan records
  if (process.env.NODE_ENV === 'development') {
    app.post("/api/scans/test-seed", async (req, res) => {
      try {
        const { filename = "test-scan.jpg", mimeType = "image/jpeg", fileSize = 1024000 } = req.body;
        
        const scanData = {
          filename: `test-${Date.now()}-${filename}`,
          originalName: filename,
          fileSize,
          mimeType,
          processingStatus: "pending" as const,
          threeDModelPath: null,
          detections: [],
          analysisCompleted: false,
        };

        const scan = await storage.createMriScan(scanData);
        
        // Start processing simulation
        setTimeout(() => processImageToModel(scan.id), 1000);

        res.status(201).json(scan);
      } catch (error) {
        console.error("Test seed error:", error);
        res.status(500).json({ message: "Failed to create test scan" });
      }
    });
  }

  // Upload MRI scan files
  app.post("/api/scans/upload", upload.single('mriFile'), async (req, res) => {
    try {
      console.log('=== UPLOAD REQUEST DEBUG ===');
      console.log('Method:', req.method);
      console.log('URL:', req.url);
      console.log('Content-Type:', req.headers['content-type']);
      console.log('Files:', req.files);
      console.log('File:', req.file);
      console.log('Body keys:', Object.keys(req.body || {}));
      console.log('Raw body available:', !!req.body);
      console.log('=== END DEBUG ===');
      
      if (!req.file) {
        console.error('No file in req.file, returning 400');
        return res.status(400).json({ message: "No file uploaded" });
      }

      const scanData = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        processingStatus: "pending" as const,
        threeDModelPath: null,
        detections: [],
        analysisCompleted: false,
      };

      const scan = await storage.createMriScan(scanData);
      
      // Start processing simulation (in a real app, this would be a background job)
      setTimeout(() => processImageToModel(scan.id), 1000);

      res.status(201).json(scan);
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Failed to upload scan" });
    }
  });

  // Run anomaly detection
  app.post("/api/scans/:id/detect", async (req, res) => {
    try {
      console.log(`Detection request for scan ID: ${req.params.id}`);
      const { sensitivity = 75, confidence = 60, detectionType = "aneurysms" } = req.body;
      
      const scan = await storage.getMriScan(req.params.id);
      if (!scan) {
        console.log(`Scan ${req.params.id} not found for detection`);
        return res.status(404).json({ message: "Scan not found" });
      }

      // Simulate AI detection process
      const detections = await simulateAnomalyDetection(sensitivity, confidence, detectionType);
      
      const updatedScan = await storage.updateMriScan(req.params.id, {
        detections,
        processingStatus: "completed",
      });

      res.json(updatedScan);
    } catch (error) {
      console.error("Detection error:", error);
      res.status(500).json({ message: "Failed to run detection" });
    }
  });

  // Generate analysis report
  app.post("/api/scans/:id/report", async (req, res) => {
    try {
      const { 
        detailLevel = 4, 
        riskThreshold = 7, 
        vizComplexity = 2, 
        reportFormat = "Clinical Summary" 
      } = req.body;
      
      const scan = await storage.getMriScan(req.params.id);
      if (!scan) {
        return res.status(404).json({ message: "Scan not found" });
      }

      // Generate comprehensive analysis report
      const reportData = await generateAnalysisReport(scan, {
        detailLevel,
        riskThreshold,
        vizComplexity,
        reportFormat
      });

      const report = await storage.createAnalysisReport(reportData);
      
      // Update scan to mark analysis as completed
      await storage.updateMriScan(req.params.id, { analysisCompleted: true });

      res.json(report);
    } catch (error) {
      console.error("Report generation error:", error);
      res.status(500).json({ message: "Failed to generate report" });
    }
  });

  // Get analysis report for a scan
  app.get("/api/scans/:id/report", async (req, res) => {
    try {
      const report = await storage.getAnalysisReport(req.params.id);
      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }
      res.json(report);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch report" });
    }
  });

  // Delete MRI scan
  app.delete("/api/scans/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteMriScan(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Scan not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete scan" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Simulation functions for processing
async function processImageToModel(scanId: string): Promise<void> {
  // Simulate 3D model generation process
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  await storage.updateMriScan(scanId, {
    processingStatus: "completed",
    threeDModelPath: `/models/${scanId}_model.obj`
  });
}

async function simulateAnomalyDetection(
  sensitivity: number, 
  confidence: number, 
  detectionType: string
): Promise<Detection[]> {
  // Simulate detection algorithm
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const detections: Detection[] = [];
  
  // Generate realistic detections based on parameters
  if (sensitivity > 70) {
    detections.push({
      id: `det_${Date.now()}_1`,
      type: "aneurysm",
      confidence: 87,
      location: "Middle cerebral artery, left hemisphere",
      coordinates: { x: 35, y: 25, width: 60, height: 40 },
      riskLevel: "high",
      description: "Cerebral aneurysm detected in M1 segment"
    });
  }

  if (sensitivity > 60) {
    detections.push({
      id: `det_${Date.now()}_2`,
      type: "anomaly",
      confidence: 73,
      location: "Anterior communicating artery",
      coordinates: { x: 20, y: 45, width: 45, height: 35 },
      riskLevel: "moderate",
      description: "Vascular anomaly with irregular morphology"
    });
  }

  if (sensitivity > 50) {
    detections.push({
      id: `det_${Date.now()}_3`,
      type: "lesion",
      confidence: 68,
      location: "Right frontal lobe",
      coordinates: { x: 60, y: 30, width: 30, height: 25 },
      riskLevel: "low",
      description: "Tissue density variation"
    });
  }

  return detections.filter(d => d.confidence >= confidence);
}

async function generateAnalysisReport(
  scan: any, 
  options: any
): Promise<any> {
  // Simulate report generation
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const criticalFindings: CriticalFinding[] = scan.detections
    .filter((d: Detection) => d.riskLevel === "high")
    .map((d: Detection) => ({
      id: d.id,
      title: d.type === "aneurysm" ? "Cerebral Aneurysm" : "Critical Anomaly",
      location: d.location,
      confidence: d.confidence,
      riskLevel: "high" as const,
      size: d.type === "aneurysm" ? "~4.2mm diameter" : "~2.8mm",
      recommendation: d.riskLevel === "high" ? "Immediate consultation" : "Follow-up imaging"
    }));

  const secondaryFindings: SecondaryFinding[] = scan.detections
    .filter((d: Detection) => d.riskLevel !== "high")
    .map((d: Detection) => ({
      id: d.id,
      title: d.description,
      description: `${d.location} - ${d.confidence}% confidence`,
      confidence: d.confidence,
      significance: d.riskLevel === "moderate" ? "Follow-up recommended" : "Within normal variation"
    }));

  const technicalSummary: TechnicalSummary = {
    processingTime: 2.43,
    imagesAnalyzed: 47,
    modelVersion: "MedVision v3.2.1",
    algorithm: "YOLOv8 + Custom CNN",
    imageResolution: "512x512 pixels",
    qualityScore: 8.9
  };

  const riskScore = Math.min(10, criticalFindings.length * 3 + secondaryFindings.length * 1);

  return {
    scanId: scan.id,
    riskScore,
    detectionAccuracy: 94,
    imageQuality: 8.9,
    processingTime: 2.43,
    criticalFindings,
    secondaryFindings,
    technicalSummary
  };
}
