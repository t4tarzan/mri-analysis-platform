export interface Detection {
  id: string;
  type: "aneurysm" | "tumor" | "lesion" | "anomaly";
  confidence: number;
  location: string;
  coordinates: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  riskLevel: "low" | "moderate" | "high";
  description: string;
}

export interface MriScan {
  id: string;
  filename: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: Date;
  processingStatus: "pending" | "processing" | "completed" | "failed";
  threeDModelPath: string | null;
  detections: Detection[];
  analysisCompleted: boolean;
}

export interface CriticalFinding {
  id: string;
  title: string;
  location: string;
  confidence: number;
  riskLevel: "high" | "critical";
  size: string;
  recommendation: string;
}

export interface SecondaryFinding {
  id: string;
  title: string;
  description: string;
  confidence: number;
  significance: string;
}

export interface TechnicalSummary {
  processingTime: number;
  imagesAnalyzed: number;
  modelVersion: string;
  algorithm: string;
  imageResolution: string;
  qualityScore: number;
}

export interface AnalysisReport {
  id: string;
  scanId: string;
  riskScore: number;
  detectionAccuracy: number;
  imageQuality: number;
  processingTime: number;
  criticalFindings: CriticalFinding[];
  secondaryFindings: SecondaryFinding[];
  technicalSummary: TechnicalSummary;
  generatedAt: Date;
}

export interface DetectionSettings {
  sensitivity: number;
  confidence: number;
  detectionType: string;
}

export interface ReportSettings {
  detailLevel: number;
  riskThreshold: number;
  vizComplexity: number;
  reportFormat: string;
}
