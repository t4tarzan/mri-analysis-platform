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
  
  // Calculate conversion progress based on processing status
  const getConversionProgress = () => {
    switch (processingStatus) {
      case 'pending': return 0;
      case 'processing': return 45;
      case 'completed': return 100;
      case 'failed': return 0;
      default: return 0;
    }
  };
  
  const conversionProgress = getConversionProgress();

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

  return (
    <div className="space-y-4">
      {/* Phase 1: Upload & 3D Conversion */}
      <Card className="shadow-sm">
        <button 
          className="accordion-header w-full px-6 py-4 flex items-center justify-between text-left hover:bg-muted/50 transition-colors"
          onClick={() => toggleAccordion(1)}
          data-testid="accordion-button-1"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground text-sm font-bold">1</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                MRI Upload & 3D Model Conversion
              </h2>
              <p className="text-sm text-muted-foreground">
                Upload MRI scan images and generate interactive 3D models
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-md font-medium text-foreground">Upload MRI Scans</h3>
                <UploadArea />
              </div>
              
              <div className="space-y-4">
                <h3 className="text-md font-medium text-foreground">3D Model Generation</h3>
                <Card className="p-6 bg-muted/30">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">Conversion Progress</span>
                      <span className="text-sm text-primary" data-testid="conversion-progress">{conversionProgress}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: `${conversionProgress}%` }} />
                    </div>
                    
                    {/* Show Start Processing button for pending scans */}
                    {processingStatus === 'pending' && scanId && (
                      <div className="flex justify-center pt-2">
                        <Button 
                          onClick={() => start3DConversion.mutate(scanId)}
                          disabled={start3DConversion.isPending}
                          className="w-full"
                          data-testid="button-start-processing"
                        >
                          {start3DConversion.isPending ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b border-white mr-2" />
                              Starting...
                            </>
                          ) : (
                            <>
                              <span className="mr-2">⚡</span>
                              Start 3D Processing
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Image Processing</span>
                        {conversionProgress >= 25 ? 
                          <span className="text-secondary">✓</span> : 
                          conversionProgress > 0 ? 
                            <div className="animate-spin rounded-full h-3 w-3 border-b border-primary" /> :
                            <span className="text-muted-foreground">⏰</span>
                        }
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Mesh Generation</span>
                        {conversionProgress >= 70 ? 
                          <span className="text-secondary">✓</span> : 
                          conversionProgress > 25 ? 
                            <div className="animate-spin rounded-full h-3 w-3 border-b border-primary" /> :
                            <span className="text-muted-foreground">⏰</span>
                        }
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Texture Mapping</span>
                        {conversionProgress >= 100 ? 
                          <span className="text-secondary">✓</span> : 
                          conversionProgress > 70 ? 
                            <div className="animate-spin rounded-full h-3 w-3 border-b border-primary" /> :
                            <span className="text-muted-foreground">⏰</span>
                        }
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-md font-medium text-foreground">Interactive 3D Model</h3>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    data-testid="button-reset-view"
                  >
                    Reset View
                  </Button>
                  <Button 
                    size="sm"
                    data-testid="button-export-model"
                  >
                    Export
                  </Button>
                </div>
              </div>
              <ThreeDViewer />
            </div>
          </CardContent>
        </div>
      </Card>

      {/* Phase 2: Anomaly Detection */}
      <Card className="shadow-sm">
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
                AI-Powered Anomaly Detection
              </h2>
              <p className="text-sm text-muted-foreground">
                Detect aneurysms and anomalies using advanced machine learning
              </p>
            </div>
          </div>
          {activeAccordion === 2 ? (
            <ChevronDown className="h-5 w-5 transition-transform" />
          ) : (
            <ChevronRight className="h-5 w-5 transition-transform" />
          )}
        </button>
        
        <div className={`accordion-content ${activeAccordion === 2 ? 'active' : ''}`}>
          <CardContent className="pt-0 pb-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-4">
                <h3 className="text-md font-medium text-foreground">Detection Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Sensitivity
                    </label>
                    <Slider
                      value={sensitivity}
                      onValueChange={setSensitivity}
                      max={100}
                      step={1}
                      className="w-full"
                      data-testid="slider-sensitivity"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Low</span>
                      <span data-testid="sensitivity-value">{sensitivity[0]}%</span>
                      <span>High</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Confidence Threshold
                    </label>
                    <Slider
                      value={confidence}
                      onValueChange={setConfidence}
                      max={100}
                      step={1}
                      className="w-full"
                      data-testid="slider-confidence"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>0%</span>
                      <span data-testid="confidence-value">{confidence[0]}%</span>
                      <span>100%</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Detection Type
                    </label>
                    <Select value={detectionType} onValueChange={setDetectionType}>
                      <SelectTrigger data-testid="select-detection-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="aneurysms">Aneurysms</SelectItem>
                        <SelectItem value="tumors">Tumors</SelectItem>
                        <SelectItem value="lesions">Lesions</SelectItem>
                        <SelectItem value="all">All Anomalies</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button 
                    className="w-full"
                    data-testid="button-run-detection"
                    onClick={async () => {
                      if (scanId) {
                        await runDetection.mutateAsync({
                          scanId,
                          sensitivity: sensitivity[0],
                          confidence: confidence[0],
                          detectionType
                        });
                      }
                    }}
                    disabled={!scanId || runDetection.isPending}
                  >
                    <span className="mr-2">▶</span>
                    {runDetection.isPending ? 'Running...' : 'Run Detection'}
                  </Button>
                </div>
              </div>
              
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-md font-medium text-foreground">Detection Results</h3>
                <DetectionOverlay />
                
                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-accent/5 border-accent/20 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">Detected Aneurysms</span>
                      <span className="text-accent">⚠</span>
                    </div>
                    <p className="text-2xl font-bold text-accent" data-testid="detected-aneurysms">{aneurysmsCount}</p>
                    <p className="text-xs text-muted-foreground">High priority findings</p>
                  </Card>
                  
                  <Card className="bg-secondary/5 border-secondary/20 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">Total Detections</span>
                      <span className="text-secondary">🔍</span>
                    </div>
                    <p className="text-2xl font-bold text-secondary" data-testid="total-detections">{totalDetections}</p>
                    <p className="text-xs text-muted-foreground">All anomalies found</p>
                  </Card>
                </div>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>

      {/* Phase 3: Analysis Report */}
      <Card className="shadow-sm">
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
                  <Button data-testid="button-download-pdf">
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
                      <span data-testid="viz-complexity-value">Advanced</span>
                      <span>Expert</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Report Format
                    </label>
                    <Select defaultValue="clinical">
                      <SelectTrigger data-testid="select-report-format">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="clinical">Clinical Summary</SelectItem>
                        <SelectItem value="technical">Technical Report</SelectItem>
                        <SelectItem value="patient">Patient-Friendly</SelectItem>
                        <SelectItem value="research">Research Format</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center mt-6">
                <Button 
                  className="w-full lg:w-auto px-8"
                  data-testid="button-generate-report"
                  onClick={async () => {
                    if (scanId) {
                      await generateReport.mutateAsync({
                        scanId,
                        detailLevel: detailLevel[0],
                        riskThreshold: riskThreshold[0],
                        vizComplexity: vizComplexity[0]
                      });
                    }
                  }}
                  disabled={!scanId || generateReport.isPending}
                >
                  <span className="mr-2">📊</span>
                  {generateReport.isPending ? 'Generating...' : 'Generate Analysis Report'}
                </Button>
              </div>
            </Card>
          </CardContent>
        </div>
      </Card>
    </div>
  );
}
