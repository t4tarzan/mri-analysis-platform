import { Card } from "@/components/ui/card";

interface Detection {
  id: string;
  type: "aneurysm" | "anomaly" | "lesion";
  confidence: number;
  position: { x: number; y: number; width: number; height: number };
  label: string;
}

export default function DetectionOverlay() {
  // Sample detection data - in a real app this would come from the API
  const detections: Detection[] = [
    {
      id: "det_1",
      type: "aneurysm", 
      confidence: 87,
      position: { x: 35, y: 25, width: 60, height: 40 },
      label: "Aneurysm - 87% confidence"
    },
    {
      id: "det_2",
      type: "anomaly",
      confidence: 73, 
      position: { x: 20, y: 45, width: 45, height: 35 },
      label: "Anomaly - 73% confidence"
    }
  ];

  return (
    <Card className="relative bg-muted/20 rounded-lg overflow-hidden" style={{ aspectRatio: "16/10" }}>
      {/* MRI scan image placeholder */}
      <img
        src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500"
        alt="Brain MRI scan"
        className="w-full h-full object-cover"
        data-testid="mri-scan-image"
      />
      
      {/* Detection bounding boxes */}
      {detections.map((detection) => (
        <div
          key={detection.id}
          className="detection-overlay absolute pointer-events-none"
          style={{
            top: `${detection.position.y}%`,
            left: `${detection.position.x}%`,
            width: `${detection.position.width}px`,
            height: `${detection.position.height}px`,
          }}
          data-testid={`detection-box-${detection.id}`}
        />
      ))}
      
      {/* Detection Labels */}
      <div className="absolute top-4 left-4 space-y-3">
        {detections.map((detection, index) => (
          <div
            key={detection.id}
            className="bg-black/80 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg backdrop-blur-sm border border-white/20"
            style={{ top: `${index * 40}px` }}
            data-testid={`detection-label-${detection.id}`}
          >
            {detection.label}
          </div>
        ))}
      </div>

      {/* Detection Details List */}
      <div className="mt-4 space-y-3">
        {[
          {
            type: "Cerebral Aneurysm",
            location: "Location: Middle cerebral artery, left hemisphere", 
            confidence: 87,
            priority: "high"
          },
          {
            type: "Vascular Anomaly", 
            location: "Location: Anterior communicating artery",
            confidence: 73,
            priority: "high"
          },
          {
            type: "Tissue Density Variation",
            location: "Location: Right frontal lobe", 
            confidence: 68,
            priority: "low"
          }
        ].map((finding, index) => (
          <Card 
            key={index} 
            className="flex items-center justify-between p-4 bg-muted/30"
            data-testid={`finding-card-${index}`}
          >
            <div className="flex items-center space-x-3">
              <div 
                className={`w-3 h-3 rounded-full ${
                  finding.priority === "high" ? "bg-accent" : "bg-primary"
                }`} 
              />
              <div>
                <p className="text-sm font-medium text-foreground" data-testid={`finding-title-${index}`}>
                  {finding.type}
                </p>
                <p className="text-xs text-muted-foreground" data-testid={`finding-location-${index}`}>
                  {finding.location}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p 
                className={`text-sm font-bold ${
                  finding.priority === "high" ? "text-accent" : "text-primary"
                }`}
                data-testid={`finding-confidence-${index}`}
              >
                {finding.confidence}%
              </p>
              <p className="text-xs text-muted-foreground">Confidence</p>
            </div>
          </Card>
        ))}
      </div>
    </Card>
  );
}
