import { type MriScan, type InsertMriScan, type AnalysisReport, type InsertAnalysisReport, Detection, CriticalFinding, SecondaryFinding, TechnicalSummary } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // MRI Scans
  getMriScan(id: string): Promise<MriScan | undefined>;
  getAllMriScans(): Promise<MriScan[]>;
  createMriScan(scan: InsertMriScan): Promise<MriScan>;
  updateMriScan(id: string, updates: Partial<MriScan>): Promise<MriScan | undefined>;
  deleteMriScan(id: string): Promise<boolean>;
  
  // Analysis Reports
  getAnalysisReport(scanId: string): Promise<AnalysisReport | undefined>;
  createAnalysisReport(report: InsertAnalysisReport): Promise<AnalysisReport>;
}

export class MemStorage implements IStorage {
  private mriScans: Map<string, MriScan>;
  private analysisReports: Map<string, AnalysisReport>;

  constructor() {
    this.mriScans = new Map();
    this.analysisReports = new Map();
  }

  async getMriScan(id: string): Promise<MriScan | undefined> {
    return this.mriScans.get(id);
  }

  async getAllMriScans(): Promise<MriScan[]> {
    return Array.from(this.mriScans.values()).sort(
      (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );
  }

  async createMriScan(insertScan: InsertMriScan): Promise<MriScan> {
    const id = randomUUID();
    const scan: MriScan = {
      ...insertScan,
      id,
      uploadedAt: new Date(),
      processingStatus: "pending",
      threeDModelPath: null,
      detections: [],
      analysisCompleted: false,
    };
    this.mriScans.set(id, scan);
    return scan;
  }

  async updateMriScan(id: string, updates: Partial<MriScan>): Promise<MriScan | undefined> {
    const existing = this.mriScans.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.mriScans.set(id, updated);
    return updated;
  }

  async deleteMriScan(id: string): Promise<boolean> {
    const deleted = this.mriScans.delete(id);
    // Also delete associated analysis report
    for (const [reportId, report] of Array.from(this.analysisReports.entries())) {
      if (report.scanId === id) {
        this.analysisReports.delete(reportId);
        break;
      }
    }
    return deleted;
  }

  async getAnalysisReport(scanId: string): Promise<AnalysisReport | undefined> {
    for (const report of Array.from(this.analysisReports.values())) {
      if (report.scanId === scanId) {
        return report;
      }
    }
    return undefined;
  }

  async createAnalysisReport(insertReport: InsertAnalysisReport): Promise<AnalysisReport> {
    const id = randomUUID();
    const report: AnalysisReport = {
      id,
      scanId: insertReport.scanId,
      riskScore: insertReport.riskScore,
      detectionAccuracy: insertReport.detectionAccuracy,
      imageQuality: insertReport.imageQuality,
      processingTime: insertReport.processingTime,
      criticalFindings: (insertReport.criticalFindings as CriticalFinding[]) || [],
      secondaryFindings: (insertReport.secondaryFindings as SecondaryFinding[]) || [],
      technicalSummary: insertReport.technicalSummary!,
      generatedAt: new Date(),
    };
    this.analysisReports.set(id, report);
    return report;
  }
}

export const storage = new MemStorage();
