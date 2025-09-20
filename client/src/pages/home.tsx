import { useState } from "react";
import MedicalSidebar from "@/components/medical-sidebar";
import PatientDetailsSidebar from "@/components/patient-details-sidebar";
import AnalysisAccordion from "@/components/analysis-accordion";
import { useProcessingState } from "@/hooks/use-processing-state";

export default function Home() {
  const [currentView, setCurrentView] = useState("analysis");
  const [currentStep, setCurrentStep] = useState(1);
  const { setCurrentScan } = useProcessingState();

  const handleScanSelect = (scanId: string) => {
    setCurrentScan(scanId);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Left Sidebar - Navigation */}
      <MedicalSidebar 
        currentView={currentView} 
        onViewChange={setCurrentView}
        onScanSelect={handleScanSelect}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-16 border-b border-border bg-card px-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground" data-testid="app-title">
              {currentView === "analysis" ? "MRI Analysis Workspace" : 
               currentView === "scans" ? "MRI Scan Library" :
               currentView === "dashboard" ? "Medical Dashboard" :
               "NeuroScan Platform"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {currentView === "analysis" ? "Advanced 3D analysis and anomaly detection" :
               currentView === "scans" ? "Manage and review patient scans" :
               currentView === "dashboard" ? "System overview and metrics" :
               "Professional medical imaging analysis"}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-xs text-muted-foreground">
              Research Mode | v2.1.4
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-medical-success"></div>
              <span className="text-xs text-muted-foreground">System Online</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Center Content */}
          <div className="flex-1 bg-muted/10">
            {currentView === "analysis" ? (
              <AnalysisAccordion 
                onStepChange={(step) => {
                  setCurrentStep(step);
                }}
              />
            ) : currentView === "dashboard" ? (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  <div className="medical-card p-6">
                    <h3 className="text-lg font-semibold mb-2">Total Scans</h3>
                    <div className="text-3xl font-bold text-primary">127</div>
                    <p className="text-sm text-muted-foreground">+12 this month</p>
                  </div>
                  <div className="medical-card p-6">
                    <h3 className="text-lg font-semibold mb-2">Anomalies Detected</h3>
                    <div className="text-3xl font-bold text-medical-risk-high">23</div>
                    <p className="text-sm text-muted-foreground">18% detection rate</p>
                  </div>
                  <div className="medical-card p-6">
                    <h3 className="text-lg font-semibold mb-2">Processing Time</h3>
                    <div className="text-3xl font-bold text-medical-success">2.3s</div>
                    <p className="text-sm text-muted-foreground">Average per scan</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="medical-card p-6">
                    <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary"></div>
                        <div className="text-sm">
                          <span className="font-medium">PAT-2025-001</span> analysis completed
                        </div>
                        <div className="text-xs text-muted-foreground ml-auto">2m ago</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-medical-risk-high"></div>
                        <div className="text-sm">
                          <span className="font-medium">PAT-2025-002</span> anomaly detected
                        </div>
                        <div className="text-xs text-muted-foreground ml-auto">5m ago</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-medical-success"></div>
                        <div className="text-sm">
                          <span className="font-medium">PAT-2025-003</span> scan uploaded
                        </div>
                        <div className="text-xs text-muted-foreground ml-auto">8m ago</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="medical-card p-6">
                    <h3 className="text-lg font-semibold mb-4">System Health</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">CPU Usage</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-muted rounded-full">
                            <div className="w-1/3 h-full bg-primary rounded-full"></div>
                          </div>
                          <span className="text-xs text-muted-foreground">34%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Memory</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-muted rounded-full">
                            <div className="w-1/2 h-full bg-medical-success rounded-full"></div>
                          </div>
                          <span className="text-xs text-muted-foreground">56%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Storage</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-muted rounded-full">
                            <div className="w-1/4 h-full bg-medical-warning rounded-full"></div>
                          </div>
                          <span className="text-xs text-muted-foreground">23%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 flex items-center justify-center">
                <div className="text-center">
                  <h2 className="text-2xl font-semibold mb-2 text-foreground">
                    {currentView === "scans" ? "Scan Library" :
                     currentView === "reports" ? "Analysis Reports" :
                     currentView === "metrics" ? "Performance Metrics" :
                     currentView === "settings" ? "System Settings" : "Feature"}
                  </h2>
                  <p className="text-muted-foreground">
                    This section is currently under development.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar - Patient Details (only show for analysis view) */}
          {currentView === "analysis" && (
            <PatientDetailsSidebar />
          )}
        </div>
      </div>
    </div>
  );
}