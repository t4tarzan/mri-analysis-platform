import { AlertTriangle, Target, Brain } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCurrentScan, useScan } from "@/hooks/use-scan-data";
import type { Detection } from "@shared/schema";

export default function DetectionOverlay() {
  const { scanId } = useCurrentScan();
  const { data: scan, isLoading } = useScan(scanId);
  
  // Use real detection data from the scan
  const detections = scan?.detections || [];

  const hasDetections = detections.length > 0;
  
  // Helper function to get medical severity styling
  const getSeverityStyle = (detection: Detection) => {
    const severity = detection.severity || "minor";
    switch (severity) {
      case "critical":
        return {
          border: "border-medical-risk-high",
          bg: "bg-medical-risk-high/10",
          dot: "bg-medical-risk-high",
          badge: "destructive" as const
        };
      case "major":
        return {
          border: "border-medical-risk-medium",
          bg: "bg-medical-risk-medium/10", 
          dot: "bg-medical-risk-medium",
          badge: "secondary" as const
        };
      default: // minor
        return {
          border: "border-medical-risk-low",
          bg: "bg-medical-risk-low/10",
          dot: "bg-medical-risk-low", 
          badge: "outline" as const
        };
    }
  };
  
  if (isLoading) {
    return (
      <div className="relative">
        <Card className="relative medical-3d-viewer rounded-lg overflow-hidden" style={{ aspectRatio: "16/10" }}>
          <div className="w-full h-full bg-muted/30 animate-pulse flex items-center justify-center">
            <span className="text-muted-foreground">Loading scan data...</span>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative">
      <Card className="relative medical-3d-viewer rounded-lg overflow-hidden" style={{ aspectRatio: "16/10" }}>
        {/* Professional Status Badge */}
        {hasDetections && (
          <div className="absolute top-4 left-4 z-10">
            <div className="anomaly-badge px-3 py-1 rounded-md flex items-center gap-2 text-white text-sm font-bold uppercase tracking-wide" data-testid="anomaly-detected-badge">
              <AlertTriangle className="w-4 h-4" />
              ANOMALY DETECTED
            </div>
          </div>
        )}

        {/* Analysis Status Indicators */}
        <div className="absolute top-4 right-4 z-10 space-y-2">
          <Badge className="bg-primary text-primary-foreground flex items-center gap-1" data-testid="analysis-status">
            <Brain className="w-3 h-3" />
            Analysis Complete
          </Badge>
          <Badge className="bg-medical-success text-white flex items-center gap-1" data-testid="scan-quality">
            <Target className="w-3 h-3" />
            High Quality
          </Badge>
        </div>

        {/* MRI scan image placeholder */}
        <img
          src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500"
          alt="Brain MRI scan"
          className="w-full h-full object-cover"
          data-testid="mri-scan-image"
        />
        
        {/* Detection bounding boxes with medical severity styling */}
        {detections.filter(detection => detection.coordinates).map((detection) => {
          const severityStyle = getSeverityStyle(detection);
          return (
            <div
              key={detection.id}
              className="absolute pointer-events-none"
              style={{
                top: `${detection.coordinates.y}%`,
                left: `${detection.coordinates.x}%`,
                width: `${detection.coordinates.width}px`,
                height: `${detection.coordinates.height}px`,
              }}
              data-testid={`detection-box-${detection.id}`}
            >
              {/* Detection Box with medical severity styling */}
              <div className={`w-full h-full border-2 ${severityStyle.border} rounded-md ${severityStyle.bg} animate-pulse`}>
                {/* Corner indicators with severity color */}
                <div className={`absolute -top-1 -left-1 w-3 h-3 ${severityStyle.dot} rounded-full`}></div>
                <div className={`absolute -top-1 -right-1 w-3 h-3 ${severityStyle.dot} rounded-full`}></div>
                <div className={`absolute -bottom-1 -left-1 w-3 h-3 ${severityStyle.dot} rounded-full`}></div>
                <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${severityStyle.dot} rounded-full`}></div>
              </div>
              
              {/* Detection Label with severity-based background */}
              <div className={`absolute -top-8 left-0 ${severityStyle.dot} text-white px-2 py-1 rounded text-xs font-bold`}>
                {detection.type.toUpperCase()} - {Math.round(detection.confidence)}%
              </div>
            </div>
          );
        })}
        
        {/* Medical Grid Overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <svg className="w-full h-full opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>
      </Card>

      {/* Detection Summary Panel */}
      {hasDetections && (
        <div className="mt-4 medical-card p-4">
          <h4 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-medical-risk-high" />
            Detection Summary
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {detections.filter(detection => detection.coordinates).map((detection) => {
              const severityStyle = getSeverityStyle(detection);
              return (
                <div key={detection.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${severityStyle.dot}`}></div>
                    <span className="text-sm font-medium text-foreground">{detection.type}</span>
                  </div>
                  <Badge variant={severityStyle.badge} className="text-xs">
                    {Math.round(detection.confidence)}%
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}