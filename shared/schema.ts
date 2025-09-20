import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, timestamp, real, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const mriScans = pgTable("mri_scans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  fileSize: integer("file_size").notNull(),
  mimeType: text("mime_type").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
  processingStatus: text("processing_status").notNull().default("pending"), // pending, processing, completed, failed
  threeDModelPath: text("three_d_model_path"),
  detections: jsonb("detections").$type<Detection[]>().default([]),
  analysisCompleted: boolean("analysis_completed").default(false).notNull(),
});

export const analysisReports = pgTable("analysis_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  scanId: varchar("scan_id").references(() => mriScans.id, { onDelete: 'cascade' }).notNull(),
  riskScore: real("risk_score").notNull(),
  detectionAccuracy: real("detection_accuracy").notNull(),
  imageQuality: real("image_quality").notNull(),
  processingTime: real("processing_time").notNull(),
  criticalFindings: jsonb("critical_findings").$type<CriticalFinding[]>().default([]).notNull(),
  secondaryFindings: jsonb("secondary_findings").$type<SecondaryFinding[]>().default([]).notNull(),
  technicalSummary: jsonb("technical_summary").$type<TechnicalSummary>().notNull(),
  // Medical severity classification fields
  overallRisk: text("overall_risk").$type<"high" | "moderate" | "low">().notNull().default("low"),
  criticalCount: integer("critical_count").notNull().default(0),
  majorCount: integer("major_count").notNull().default(0),
  minorCount: integer("minor_count").notNull().default(0),
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
});

// Zod schemas
export const insertMriScanSchema = createInsertSchema(mriScans).omit({
  id: true,
  uploadedAt: true,
});

export const insertAnalysisReportSchema = createInsertSchema(analysisReports).omit({
  id: true,
  generatedAt: true,
});

// Types
export type MriScan = typeof mriScans.$inferSelect;
export type InsertMriScan = z.infer<typeof insertMriScanSchema>;
export type AnalysisReport = typeof analysisReports.$inferSelect;
export type InsertAnalysisReport = z.infer<typeof insertAnalysisReportSchema>;

export interface Detection {
  id: string;
  type: "aneurysm" | "tumor" | "lesion" | "anomaly" | "hemorrhage";
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
  // Medical severity classification fields
  severity: "critical" | "major" | "minor";
  severityScore: number; // 0-10 scale
  riskCategory: "high" | "moderate" | "low";
  clinicalType: string; // e.g., "cerebral_aneurysm", "brain_hemorrhage", etc.
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
