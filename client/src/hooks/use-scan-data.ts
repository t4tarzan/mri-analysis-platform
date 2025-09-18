import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { MriScan, AnalysisReport } from "@shared/schema";

// Hook to fetch all scans
export function useScans() {
  return useQuery<MriScan[]>({
    queryKey: ['/api/scans'],
  });
}

// Hook to fetch specific scan
export function useScan(scanId?: string) {
  const result = useQuery<MriScan>({
    queryKey: ['/api/scans', scanId],
    enabled: !!scanId,
    refetchInterval: (query) => {
      // Auto-poll every 2 seconds while processing OR until analysis is completed
      const data = query.state.data;
      return data && (!data.analysisCompleted || data.processingStatus === 'processing') ? 2000 : false;
    },
    refetchIntervalInBackground: true,
  });

  return result;
}

// Hook to fetch analysis report for a scan
export function useAnalysisReport(scanId?: string) {
  return useQuery<AnalysisReport>({
    queryKey: ['/api/scans', scanId, 'report'],
    enabled: !!scanId,
  });
}

// Hook to run detection analysis
export function useRunDetection() {
  return useMutation({
    mutationFn: async ({ scanId, sensitivity, confidence, detectionType }: {
      scanId: string;
      sensitivity: number;
      confidence: number;
      detectionType: string;
    }) => {
      const response = await apiRequest('POST', `/api/scans/${scanId}/detect`, {
        sensitivity,
        confidence,
        detectionType
      });
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate scan data to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['/api/scans', variables.scanId] });
    },
  });
}

// Hook to generate analysis report
export function useGenerateReport() {
  return useMutation({
    mutationFn: async ({ scanId, detailLevel, riskThreshold, vizComplexity }: {
      scanId: string;
      detailLevel: number;
      riskThreshold: number;
      vizComplexity: number;
    }) => {
      const response = await apiRequest('POST', `/api/scans/${scanId}/report`, {
        detailLevel,
        riskThreshold,
        vizComplexity
      });
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate analysis report to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['/api/scans', variables.scanId, 'report'] });
    },
  });
}

// Hook to start 3D model conversion manually
export function useStart3DConversion() {
  return useMutation({
    mutationFn: async (scanId: string) => {
      const response = await apiRequest('POST', `/api/scans/${scanId}/convert`);
      return response.json();
    },
    onSuccess: (data, scanId) => {
      // Invalidate scan data to trigger refetch and show updated processing status
      queryClient.invalidateQueries({ queryKey: ['/api/scans', scanId] });
      queryClient.invalidateQueries({ queryKey: ['/api/scans'] });
    },
  });
}

// Helper hook to get the most recent scan
export function useCurrentScan() {
  const { data: scans } = useScans();
  const currentScan = scans?.[0]; // Most recent scan
  return {
    scan: currentScan,
    scanId: currentScan?.id
  };
}