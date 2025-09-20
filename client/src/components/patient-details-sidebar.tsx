import { Calendar, Clock, User, AlertTriangle, CheckCircle, FileText, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useCurrentScan } from "@/hooks/use-scan-data";
import { useToast } from "@/hooks/use-toast";

interface PatientDetailsSidebarProps {
  currentScan?: any;
  scanData?: any;
}

export default function PatientDetailsSidebar({ currentScan, scanData }: PatientDetailsSidebarProps) {
  const [opacity, setOpacity] = useState([80]);
  const [slice, setSlice] = useState([50]);
  const [showOverlay, setShowOverlay] = useState(true);
  const [showGrid, setShowGrid] = useState(false);
  
  const { scanId } = useCurrentScan();
  const { toast } = useToast();

  // Mock patient data - in real app this would come from scan metadata
  const patientInfo = {
    id: "PAT-2025-001",
    age: 45,
    sex: "Female",
    scanDate: "2025-09-18",
    scanTime: "15:30:42",
    studyType: "Brain MRI T1",
    technician: "Dr. Smith",
    priority: "High"
  };

  // Use backend medical risk assessment instead of local calculation
  const backendRisk = scanData?.report?.overallRisk || "low";
  const riskLevel = backendRisk === "high" ? "High" : 
                   backendRisk === "moderate" ? "Moderate" : "Low";
  const riskColor = backendRisk === "high" ? "bg-medical-risk-high" : 
                   backendRisk === "moderate" ? "bg-medical-risk-medium" : "bg-medical-risk-low";

  // Download report as PDF
  const handleDownloadReport = async () => {
    if (!scanId) {
      toast({
        title: "No scan selected",
        description: "Please select a scan to download report",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const response = await fetch(`/api/scans/${scanId}/report?format=pdf`);
      if (!response.ok) throw new Error('Failed to download PDF report');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `mri-analysis-report-${scanId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Report downloaded",
        description: "MRI analysis report has been downloaded successfully",
      });
    } catch (error) {
      console.error('PDF download failed:', error);
      toast({
        title: "Download failed",
        description: "Failed to download the analysis report",
        variant: "destructive",
      });
    }
  };

  // Export analysis data as JSON
  const handleExportAnalysis = async () => {
    if (!scanId) {
      toast({
        title: "No scan selected", 
        description: "Please select a scan to export analysis data",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const response = await fetch(`/api/scans/${scanId}/report`);
      if (!response.ok) throw new Error('Failed to export analysis data');
      
      const analysisData = await response.json();
      const dataStr = JSON.stringify(analysisData, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `mri-analysis-data-${scanId}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Analysis data exported",
        description: "MRI analysis data has been exported successfully",
      });
    } catch (error) {
      console.error('Analysis export failed:', error);
      toast({
        title: "Export failed",
        description: "Failed to export analysis data",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-80 h-full bg-card border-l border-border flex flex-col">
      {/* Patient Information */}
      <div className="p-4 border-b border-border">
        <Card className="patient-info-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <User className="w-5 h-5" />
              Patient Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-medium text-muted-foreground uppercase">Patient ID</div>
                <div className="text-sm font-mono text-foreground">{patientInfo.id}</div>
              </div>
              <div>
                <div className="text-xs font-medium text-muted-foreground uppercase">Priority</div>
                <Badge 
                  variant={patientInfo.priority === "High" ? "destructive" : "secondary"}
                  className="text-xs"
                >
                  {patientInfo.priority}
                </Badge>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-medium text-muted-foreground uppercase">Age</div>
                <div className="text-sm text-foreground">{patientInfo.age} years</div>
              </div>
              <div>
                <div className="text-xs font-medium text-muted-foreground uppercase">Sex</div>
                <div className="text-sm text-foreground">{patientInfo.sex}</div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <div className="text-xs font-medium text-muted-foreground uppercase">Scan Date</div>
                  <div className="text-sm text-foreground">{patientInfo.scanDate}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <div>
                  <div className="text-xs font-medium text-muted-foreground uppercase">Time</div>
                  <div className="text-sm text-foreground">{patientInfo.scanTime}</div>
                </div>
              </div>
            </div>

            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase">Study Type</div>
              <div className="text-sm text-foreground">{patientInfo.studyType}</div>
            </div>

            <div>
              <div className="text-xs font-medium text-muted-foreground uppercase">Technician</div>
              <div className="text-sm text-foreground">{patientInfo.technician}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Assessment */}
      <div className="p-4 border-b border-border">
        <Card className="medical-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              {riskLevel === "High" ? (
                <AlertTriangle className="w-5 h-5 text-medical-risk-high" />
              ) : (
                <CheckCircle className="w-5 h-5 text-medical-success" />
              )}
              Risk Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">Overall Risk Level</span>
              <Badge 
                className={`${riskColor} text-white`}
              >
                {riskLevel}
              </Badge>
            </div>
            
            {scanData?.detections && (
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground uppercase">Detections</div>
                <div className="text-sm text-foreground">
                  {scanData.detections.length} anomal{scanData.detections.length === 1 ? 'y' : 'ies'} detected
                </div>
                {scanData.detections.slice(0, 2).map((detection: any, index: number) => {
                  const severity = detection.severity || "minor";
                  const dotColor = severity === "critical" ? "bg-medical-risk-high" :
                                  severity === "major" ? "bg-medical-risk-medium" : "bg-medical-risk-low";
                  return (
                    <div key={index} className="flex items-center gap-2 text-xs">
                      <div className={`w-2 h-2 rounded-full ${dotColor}`}></div>
                      <span className="text-muted-foreground">
                        {detection.type || "Anomaly"} (Confidence: {Math.round(detection.confidence)}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Analysis Controls */}
      <div className="flex-1 p-4 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">Viewer Controls</h3>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="opacity-slider" className="text-xs font-medium text-muted-foreground uppercase">
                Opacity: {opacity[0]}%
              </Label>
              <Slider
                id="opacity-slider"
                min={0}
                max={100}
                step={5}
                value={opacity}
                onValueChange={setOpacity}
                className="medical-slider mt-2"
                data-testid="opacity-slider"
              />
            </div>

            <div>
              <Label htmlFor="slice-slider" className="text-xs font-medium text-muted-foreground uppercase">
                Slice Position: {slice[0]}%
              </Label>
              <Slider
                id="slice-slider"
                min={0}
                max={100}
                step={1}
                value={slice}
                onValueChange={setSlice}
                className="medical-slider mt-2"
                data-testid="slice-slider"
              />
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="overlay-toggle" className="text-xs font-medium text-muted-foreground uppercase">
                  Detection Overlay
                </Label>
                <Switch
                  id="overlay-toggle"
                  checked={showOverlay}
                  onCheckedChange={setShowOverlay}
                  className="medical-toggle"
                  data-testid="overlay-toggle"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="grid-toggle" className="text-xs font-medium text-muted-foreground uppercase">
                  Grid Lines
                </Label>
                <Switch
                  id="grid-toggle"
                  checked={showGrid}
                  onCheckedChange={setShowGrid}
                  className="medical-toggle"
                  data-testid="grid-toggle"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 border-t border-border space-y-2">
        <Button 
          onClick={handleDownloadReport}
          className="btn-medical-primary w-full" 
          size="sm"
          data-testid="button-download-report"
        >
          <FileText className="w-4 h-4 mr-2" />
          Download Report
        </Button>
        
        <Button 
          onClick={handleExportAnalysis}
          variant="outline" 
          className="w-full" 
          size="sm"
          data-testid="button-export-data"
        >
          <Download className="w-4 h-4 mr-2" />
          Export Analysis Data
        </Button>
      </div>
    </div>
  );
}