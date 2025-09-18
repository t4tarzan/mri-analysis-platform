import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import UploadArea from "./upload-area";
import ThreeDViewer from "./three-d-viewer";
import DetectionOverlay from "./detection-overlay";
import MetricsDashboard from "./metrics-dashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCurrentScan, useScan, useRunDetection, useGenerateReport, useStart3DConversion } from "@/hooks/use-scan-data";
import ConversionProgress from "@/components/conversion-progress";

interface AnalysisAccordionProps {
  onStepChange: (step: number) => void;
}

export default function AnalysisAccordion({ onStepChange }: AnalysisAccordionProps) {
  const [activeAccordion, setActiveAccordion] = useState(1);
  const [sensitivity, setSensitivity] = useState([75]);
  const [confidence, setConfidence] = useState([60]);
  const [detectionType, setDetectionType] = useState("aneurysms");
  const [detailLevel, setDetailLevel] = useState([4]);
  const [riskThreshold, setRiskThreshold] = useState([7]);
  const [vizComplexity, setVizComplexity] = useState([2]);
  
  // Get current scan data
  const { scan, scanId } = useCurrentScan();
  const { data: fullScan } = useScan(scanId);
  const runDetection = useRunDetection();
  const generateReport = useGenerateReport();
  const start3DConversion = useStart3DConversion();
  
  // Calculate dynamic values from scan data
  const currentScanData = fullScan || scan;
  const detections = currentScanData?.detections || [];
  const aneurysmsCount = detections.filter(d => d.type === 'aneurysm').length;
  const totalDetections = detections.length;
  const processingStatus = currentScanData?.processingStatus || 'pending';
  const analysisCompleted = currentScanData?.analysisCompleted || false;
  
  // Remove old broken progress calculation - now handled by ConversionProgress component

  // Add test helpers that expose state setters for testing
  (window as any).testHelpers = {
    setSensitivity: (value: number) => setSensitivity([value]),
    setConfidence: (value: number) => setConfidence([value]),
    setDetectionType: (value: string) => setDetectionType(value),
    setDetailLevel: (value: number) => setDetailLevel([value]),
    setRiskThreshold: (value: number) => setRiskThreshold([value]),
    setVizComplexity: (value: number) => setVizComplexity([value])
  };

  const toggleAccordion = (section: number) => {
    setActiveAccordion(section);
    onStepChange(section);
  };

  // Handle PDF download
  const handleDownloadPDF = async () => {
    if (!scanId) return;
    
    try {
      const response = await fetch(`/api/scans/${scanId}/report?format=pdf`);
      if (!response.ok) throw new Error('Failed to download PDF');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `mri-analysis-report-${scanId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDF download failed:', error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Phase 1: Upload & 3D Conversion */}
      <Card>
        <button
          className="accordion-header w-full px-6 py-4 flex items-center justify-between text-left hover:bg-muted/50 transition-colors"
          onClick={() => toggleAccordion(1)}
          data-testid="accordion-button-1"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
              <span className="text-muted-foreground text-sm font-bold">1</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                MRI Upload & 3D Model Conversion
              </h2>
              <p className="text-sm text-muted-foreground">
                Upload medical images and convert to interactive 3D models
              </p>
            </div>
          </div>
          {activeAccordion === 1 ? (
            <ChevronDown className="h-5 w-5 transition-transform" />
          ) : (
            <ChevronRight className="h-5 w-5 transition-transform" />
          )}
        </button>

        <div className={`accordion-content ${activeAccordion === 1 ? 'active' : ''}`}>
          <CardContent className="pt-0 pb-6 space-y-6">
            <UploadArea />
            <ConversionProgress />
          </CardContent>
        </div>
      </Card>

      {/* Phase 2: AI Analysis & Detection */}
      <Card>
        <button
          className="accordion-header w-full px-6 py-4 flex items-center justify-between text-left hover:bg-muted/50 transition-colors"
          onClick={() => toggleAccordion(2)}
          data-testid="accordion-button-2"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
              <span className="text-muted-foreground text-sm font-bold">2</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                AI Analysis & Detection Configuration
              </h2>
              <p className="text-sm text-muted-foreground">
                Configure detection parameters and run AI analysis
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-sm text-muted-foreground">
              {aneurysmsCount > 0 && (
                <span className="text-red-600 font-medium">{aneurysmsCount} aneurysm{aneurysmsCount > 1 ? 's' : ''}</span>
              )}
              {totalDetections > aneurysmsCount && aneurysmsCount > 0 && <span className="mx-1">•</span>}
              {totalDetections > aneurysmsCount && (
                <span className="text-yellow-600 font-medium">{totalDetections - aneurysmsCount} other finding{(totalDetections - aneurysmsCount) > 1 ? 's' : ''}</span>
              )}
            </div>
            {activeAccordion === 2 ? (
              <ChevronDown className="h-5 w-5 transition-transform" />
            ) : (
              <ChevronRight className="h-5 w-5 transition-transform" />
            )}
          </div>
        </button>

        <div className={`accordion-content ${activeAccordion === 2 ? 'active' : ''}`}>
          <CardContent className="pt-0 pb-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Detection Sensitivity
                  </label>
                  <Slider
                    value={sensitivity}
                    onValueChange={setSensitivity}
                    min={50}
                    max={95}
                    step={5}
                    className="w-full"
                    data-testid="slider-sensitivity"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Conservative</span>
                    <span data-testid="sensitivity-value">{sensitivity[0]}%</span>
                    <span>Aggressive</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Confidence Threshold
                  </label>
                  <Slider
                    value={confidence}
                    onValueChange={setConfidence}
                    min={40}
                    max={90}
                    step={5}
                    className="w-full"
                    data-testid="slider-confidence"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Inclusive</span>
                    <span data-testid="confidence-value">{confidence[0]}%</span>
                    <span>Strict</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Detection Type Focus
                  </label>
                  <Select value={detectionType} onValueChange={setDetectionType}>
                    <SelectTrigger data-testid="select-detection-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aneurysms">Aneurysms</SelectItem>
                      <SelectItem value="lesions">Brain Lesions</SelectItem>
                      <SelectItem value="all">All Anomalies</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-4">
                  <Button 
                    onClick={() => {
                      if (scanId) {
                        runDetection.mutate({
                          scanId,
                          sensitivity: sensitivity[0],
                          confidence: confidence[0],
                          detectionType
                        });
                      }
                    }}
                    disabled={!scanId || runDetection.isPending}
                    className="w-full"
                    data-testid="button-run-detection"
                  >
                    {runDetection.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b border-white mr-2" />
                        Running Analysis...
                      </>
                    ) : (
                      <>
                        <span className="mr-2">🔍</span>
                        Run AI Detection
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Card className="p-4">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Interactive 3D Model
                  </h3>
                  <ThreeDViewer />
                </Card>
              </div>

              <div className="space-y-4">
                <Card className="p-4">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Detection Results
                  </h3>
                  <DetectionOverlay />
                </Card>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>

      {/* Phase 3: Results & Report Generation */}
      <Card>
        <button
          className="accordion-header w-full px-6 py-4 flex items-center justify-between text-left hover:bg-muted/50 transition-colors"
          onClick={() => toggleAccordion(3)}
          data-testid="accordion-button-3"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
              <span className="text-muted-foreground text-sm font-bold">3</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Comprehensive Analysis Report
              </h2>
              <p className="text-sm text-muted-foreground">
                Generate detailed medical analysis with customizable metrics
              </p>
            </div>
          </div>
          {activeAccordion === 3 ? (
            <ChevronDown className="h-5 w-5 transition-transform" />
          ) : (
            <ChevronRight className="h-5 w-5 transition-transform" />
          )}
        </button>
        
        <div className={`accordion-content ${activeAccordion === 3 ? 'active' : ''}`}>
          <CardContent className="pt-0 pb-6 space-y-6">
            <Card className="p-6 bg-primary/5 border-primary/20">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-foreground">Medical Analysis Report</h3>
                  <p className="text-sm text-muted-foreground">
                    Generated on {new Date().toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    onClick={handleDownloadPDF}
                    disabled={!analysisCompleted || !scanId}
                    data-testid="button-download-pdf"
                  >
                    <span className="mr-2">⬇</span>
                    Download PDF
                  </Button>
                  <Button variant="secondary" data-testid="button-share-report">
                    <span className="mr-2">⤴</span>
                    Share
                  </Button>
                </div>
              </div>
            </Card>

            <MetricsDashboard />

            <Card className="bg-muted/20 p-6">
              <h3 className="text-md font-medium text-foreground mb-4">
                Customizable Report Metrics
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Detection Detail Level
                    </label>
                    <Slider
                      value={detailLevel}
                      onValueChange={setDetailLevel}
                      min={1}
                      max={5}
                      step={1}
                      className="w-full"
                      data-testid="slider-detail-level"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Basic</span>
                      <span data-testid="detail-level-value">Detailed</span>
                      <span>Comprehensive</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Risk Assessment Threshold
                    </label>
                    <Slider
                      value={riskThreshold}
                      onValueChange={setRiskThreshold}
                      min={0}
                      max={10}
                      step={0.1}
                      className="w-full"
                      data-testid="slider-risk-threshold"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>0</span>
                      <span data-testid="risk-threshold-value">{riskThreshold[0]}</span>
                      <span>10</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Visualization Complexity
                    </label>
                    <Slider
                      value={vizComplexity}
                      onValueChange={setVizComplexity}
                      min={1}
                      max={3}
                      step={1}
                      className="w-full"
                      data-testid="slider-viz-complexity"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Simple</span>
                      <span data-testid="viz-complexity-value">Standard</span>
                      <span>Advanced</span>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button 
                      onClick={() => {
                        if (scanId) {
                          generateReport.mutateAsync({
                            scanId,
                            detailLevel: detailLevel[0],
                            riskThreshold: riskThreshold[0],
                            vizComplexity: vizComplexity[0]
                          });
                        }
                      }}
                      disabled={!scanId || generateReport.isPending}
                      className="w-full"
                      data-testid="button-generate-report"
                    >
                      {generateReport.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b border-white mr-2" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <span className="mr-2">📊</span>
                          Generate Custom Report
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </CardContent>
        </div>
      </Card>
    </div>
  );
}