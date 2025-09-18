import { useState } from "react";
import { Upload, FileImage, CheckCircle, X } from "lucide-react";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useFileUpload } from "@/hooks/use-file-upload";
import { useStart3DConversion } from "@/hooks/use-scan-data";
import { useProcessingState } from "@/hooks/use-processing-state";
import ThreeDViewer from "./three-d-viewer";
import DetectionOverlay from "./detection-overlay";
import MetricsDashboard from "./metrics-dashboard";

interface AnalysisAccordionProps {
  onStepChange: (step: number) => void;
}

export default function AnalysisAccordion({ onStepChange }: AnalysisAccordionProps) {
  const { uploadedFiles, uploadFile, removeFile, isUploading } = useFileUpload();
  const start3DConversion = useStart3DConversion();
  const { setCurrentScan, currentScan, isProcessing, processingProgress, processingStage } = useProcessingState();

  // File upload handling
  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach(file => {
      uploadFile(file);
    });
  }, [uploadFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    multiple: true
  });

  // Check if we have uploaded files
  const uploadedFileIds = uploadedFiles.filter(f => f.status === "uploaded" && f.id).map(f => f.id!);
  const hasUploadedFiles = uploadedFileIds.length > 0;

  // Handle processing
  const handleProcessFiles = () => {
    if (uploadedFileIds.length > 0) {
      const scanId = uploadedFileIds[0];
      setCurrentScan(scanId);
      start3DConversion.mutate(scanId);
      onStepChange(2); // Move to processing stage
    }
  };

  // Handle PDF download
  const handleDownloadPDF = async () => {
    const scanId = uploadedFileIds[0];
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

  // Get processing status info
  const getStatusDisplay = () => {
    if (!hasUploadedFiles) return { text: "No files uploaded", color: "text-muted-foreground" };
    if (!isProcessing && processingProgress === 0) return { text: "Ready to process", color: "text-green-600" };
    if (isProcessing) return { text: `Processing ${processingProgress}%`, color: "text-blue-600" };
    if (processingProgress === 100) return { text: "Analysis complete", color: "text-green-600" };
    return { text: "Ready", color: "text-muted-foreground" };
  };

  const status = getStatusDisplay();
  const showResults = processingProgress === 100 && currentScan;

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">MRI Analysis Platform</h1>
        <p className="text-muted-foreground">Upload MRI scans for 3D analysis and medical reporting</p>
      </div>

      {/* Step 1: File Upload */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Step 1: Upload MRI Files</h2>
        
        <Card
          {...getRootProps()}
          className={`border-2 border-dashed p-8 text-center cursor-pointer transition-colors mb-4 ${
            isDragActive 
              ? "border-primary/50 bg-primary/5" 
              : "border-border hover:border-primary/50"
          }`}
          data-testid="upload-dropzone"
        >
          <input {...getInputProps()} />
          <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
            <Upload className="text-muted-foreground h-6 w-6" />
          </div>
          <p className="text-lg font-medium text-foreground mb-2">
            {isDragActive ? "Drop MRI files here" : "Drop MRI files here"}
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            or click to browse files
          </p>
          <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
            <span>ℹ️</span>
            <span>Supports JPG, PNG formats • Max 50MB per file</span>
          </div>
        </Card>

        {/* Uploaded Files Preview */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-2 mb-4">
            {uploadedFiles.map((file, index) => (
              <Card key={index} className="flex items-center justify-between p-3 bg-muted/30">
                <div className="flex items-center space-x-3">
                  <FileImage className="text-primary h-5 w-5" />
                  <div>
                    <p className="text-sm font-medium text-foreground" data-testid={`file-name-${index}`}>
                      {file.name}
                    </p>
                    {file.uploadedFilename && (
                      <p className="text-xs text-green-600 dark:text-green-400" data-testid={`uploaded-filename-${index}`}>
                        Saved as: {file.uploadedFilename}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground" data-testid={`file-status-${index}`}>
                      {(file.size / (1024 * 1024)).toFixed(1)} MB • {file.status}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {file.status === "uploaded" && (
                    <CheckCircle className="text-green-600 h-4 w-4" />
                  )}
                  {file.status === "uploading" && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="text-muted-foreground hover:text-accent"
                    data-testid={`button-remove-file-${index}`}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

      {/* Step 2: Process Files */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold">Step 2: Process & Analyze</h2>
            <p className={`text-sm ${status.color}`}>{status.text}</p>
          </div>
          <Button 
            onClick={handleProcessFiles}
            disabled={!hasUploadedFiles || isUploading || isProcessing}
            size="lg"
            data-testid="button-process-files"
            className="px-8"
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b border-white mr-2" />
                Uploading...
              </>
            ) : isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b border-white mr-2" />
                Processing...
              </>
            ) : hasUploadedFiles ? (
              <>
                <span className="mr-2">⚡</span>
                Process Files
              </>
            ) : (
              <>
                <span className="mr-2 opacity-50">⚡</span>
                Process Files
              </>
            )}
          </Button>
        </div>

        {/* Progress Bar */}
        {(isProcessing || processingProgress > 0) && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Processing Progress</span>
              <span className="text-muted-foreground">{processingProgress}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300" 
                style={{ width: `${processingProgress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1 capitalize">
              {processingStage.replace('_', ' ')}
            </p>
          </div>
        )}
      </Card>

      {/* Step 3: Results */}
      {showResults && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold">Step 3: Analysis Results</h2>
              <p className="text-sm text-muted-foreground">Review 3D model and download analysis report</p>
            </div>
            <Button 
              onClick={handleDownloadPDF}
              size="lg"
              data-testid="button-download-pdf"
              className="px-8"
            >
              <span className="mr-2">⬇</span>
              Download PDF Report
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card className="p-4">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Interactive 3D Model
              </h3>
              <ThreeDViewer />
            </Card>

            <Card className="p-4">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Detection Results
              </h3>
              <DetectionOverlay />
            </Card>
          </div>

          <MetricsDashboard />
        </Card>
      )}
    </div>
  );
}