import { useState } from "react";
import { Brain, Settings, Shield } from "lucide-react";
import AnalysisAccordion from "@/components/analysis-accordion";

export default function Home() {
  const [progress, setProgress] = useState(33);
  const [currentStep, setCurrentStep] = useState(1);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Brain className="text-primary-foreground h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground" data-testid="app-title">
                  MRI Research Platform
                </h1>
                <p className="text-xs text-muted-foreground">
                  Advanced 3D Analysis & Anomaly Detection
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4 text-secondary" />
                <span>HIPAA Compliant</span>
              </div>
              <button 
                className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                data-testid="settings-button"
              >
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Indicator */}
        <div className="mb-8" data-testid="progress-section">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Analysis Progress</span>
            <span className="text-sm text-muted-foreground" data-testid="progress-text">
              Step {currentStep} of 3
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full progress-bar transition-all duration-300 ease-in-out" 
              style={{ width: `${progress}%` }}
              data-testid="progress-bar"
            />
          </div>
        </div>

        {/* Analysis Accordion */}
        <AnalysisAccordion 
          onStepChange={(step) => {
            setCurrentStep(step);
            setProgress((step / 3) * 100);
          }}
        />

        {/* Action Buttons */}
        <div className="flex items-center justify-center space-x-4 mt-8">
          <button 
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            data-testid="button-new-analysis"
          >
            <span className="mr-2">+</span>
            New Analysis
          </button>
          <button 
            className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors font-medium"
            data-testid="button-export-results"
          >
            <span className="mr-2">⬇</span>
            Export All Results
          </button>
          <button 
            className="px-6 py-3 border border-border text-foreground rounded-lg hover:bg-muted/50 transition-colors font-medium"
            data-testid="button-share-analysis"
          >
            <span className="mr-2">⤴</span>
            Share Analysis
          </button>
        </div>
      </main>
    </div>
  );
}
