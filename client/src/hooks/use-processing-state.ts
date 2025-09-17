import { useState, useEffect } from "react";
import { useScans, useScan } from "@/hooks/use-scan-data";
import type { MriScan } from "@shared/schema";

export interface ProcessingState {
  // Current scan being processed
  currentScanId: string | null;
  currentScan: MriScan | null;
  
  // Upload state
  hasUploadedFiles: boolean;
  uploadedFilenames: string[];
  
  // Processing state
  isProcessing: boolean;
  processingProgress: number;
  processingStage: 'idle' | 'starting' | 'image_processing' | 'mesh_generation' | 'texture_mapping' | 'completed' | 'failed';
  
  // Actions
  setCurrentScan: (scanId: string | null) => void;
  markFileUploaded: (filename: string) => void;
  clearUploadedFiles: () => void;
  startProcessing: () => void;
}

export function useProcessingState(): ProcessingState {
  const [currentScanId, setCurrentScanId] = useState<string | null>(null);
  const [uploadedFilenames, setUploadedFilenames] = useState<string[]>([]);
  
  const { data: scans } = useScans();
  const { data: currentScan } = useScan(currentScanId || undefined);
  
  // Auto-set current scan to the most recent one when scans load
  useEffect(() => {
    if (scans && scans.length > 0 && !currentScanId) {
      const mostRecent = scans[0]; // Most recent scan
      setCurrentScanId(mostRecent.id);
    }
  }, [scans, currentScanId]);
  
  // Calculate processing state from scan data
  const processingStatus = currentScan?.processingStatus || 'pending';
  const isProcessing = processingStatus === 'processing';
  
  // Calculate accurate processing progress and stage
  const getProcessingDetails = () => {
    switch (processingStatus) {
      case 'pending':
        return { progress: 0, stage: 'idle' as const };
      case 'processing':
        return { progress: 50, stage: 'mesh_generation' as const };
      case 'completed':
        return { progress: 100, stage: 'completed' as const };
      case 'failed':
        return { progress: 0, stage: 'failed' as const };
      default:
        return { progress: 0, stage: 'idle' as const };
    }
  };
  
  const { progress, stage } = getProcessingDetails();
  
  return {
    // Current scan
    currentScanId,
    currentScan: currentScan || null,
    
    // Upload state
    hasUploadedFiles: uploadedFilenames.length > 0,
    uploadedFilenames,
    
    // Processing state
    isProcessing,
    processingProgress: progress,
    processingStage: stage,
    
    // Actions
    setCurrentScan: setCurrentScanId,
    markFileUploaded: (filename: string) => {
      setUploadedFilenames(prev => [...prev, filename]);
    },
    clearUploadedFiles: () => {
      setUploadedFilenames([]);
    },
    startProcessing: () => {
      // This will be handled by the process button
    }
  };
}