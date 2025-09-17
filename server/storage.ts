import { type MriScan, type InsertMriScan, type AnalysisReport, type InsertAnalysisReport, Detection, CriticalFinding, SecondaryFinding, TechnicalSummary, mriScans, analysisReports } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

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

export class DatabaseStorage implements IStorage {
  async getMriScan(id: string): Promise<MriScan | undefined> {
    const [scan] = await db.select().from(mriScans).where(eq(mriScans.id, id));
    return scan || undefined;
  }

  async getAllMriScans(): Promise<MriScan[]> {
    return await db.select().from(mriScans).orderBy(desc(mriScans.uploadedAt));
  }

  async createMriScan(insertScan: InsertMriScan): Promise<MriScan> {
    const [scan] = await db
      .insert(mriScans)
      .values({
        filename: insertScan.filename,
        originalName: insertScan.originalName,
        fileSize: insertScan.fileSize,
        mimeType: insertScan.mimeType,
        processingStatus: insertScan.processingStatus || "pending",
        threeDModelPath: insertScan.threeDModelPath || null,
        detections: (insertScan.detections || []) as any,
        analysisCompleted: insertScan.analysisCompleted || false
      })
      .returning();
    return scan;
  }

  async updateMriScan(id: string, updates: Partial<MriScan>): Promise<MriScan | undefined> {
    const [updated] = await db
      .update(mriScans)
      .set(updates)
      .where(eq(mriScans.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteMriScan(id: string): Promise<boolean> {
    // First delete associated analysis reports
    await db.delete(analysisReports).where(eq(analysisReports.scanId, id));
    
    // Then delete the scan
    const result = await db.delete(mriScans).where(eq(mriScans.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getAnalysisReport(scanId: string): Promise<AnalysisReport | undefined> {
    const [report] = await db
      .select()
      .from(analysisReports)
      .where(eq(analysisReports.scanId, scanId));
    return report || undefined;
  }

  async createAnalysisReport(insertReport: InsertAnalysisReport): Promise<AnalysisReport> {
    const [report] = await db
      .insert(analysisReports)
      .values({
        scanId: insertReport.scanId,
        riskScore: insertReport.riskScore,
        detectionAccuracy: insertReport.detectionAccuracy,
        imageQuality: insertReport.imageQuality,
        processingTime: insertReport.processingTime,
        criticalFindings: (insertReport.criticalFindings || []) as any,
        secondaryFindings: (insertReport.secondaryFindings || []) as any,
        technicalSummary: insertReport.technicalSummary as any
      })
      .returning();
    return report;
  }
}

export const storage = new DatabaseStorage();
