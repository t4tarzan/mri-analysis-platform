import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, Clock } from "lucide-react";
import { useProcessingState } from "@/hooks/use-processing-state";
import { useStart3DConversion } from "@/hooks/use-scan-data";

export default function ConversionProgress() {
  const processingState = useProcessingState();
  const start3DConversion = useStart3DConversion();

  const {
    currentScanId,
    currentScan,
    hasUploadedFiles,
    processingProgress,
    processingStage,
    isProcessing
  } = processingState;

  // Check if we have a current scan with uploaded status
  const hasValidScan = currentScan && currentScan.processingStatus !== undefined;
  const canStartProcessing = hasValidScan && currentScan?.processingStatus === 'pending';

  // Handle process button click
  const handleStartProcessing = () => {
    if (currentScanId && canStartProcessing) {
      start3DConversion.mutate(currentScanId);
    }
  };

  // Get stage display info
  const getStageInfo = (stage: typeof processingStage) => {
    switch (stage) {
      case 'idle':
        return { 
          name: 'Ready to Process', 
          icon: <Clock className="w-4 h-4" />, 
          status: 'pending' as const
        };
      case 'starting':
        return { 
          name: 'Initializing Processing', 
          icon: <Loader2 className="w-4 h-4 animate-spin" />, 
          status: 'processing' as const
        };
      case 'image_processing':
        return { 
          name: 'Image Processing', 
          icon: <CheckCircle className="w-4 h-4 text-green-500" />, 
          status: 'completed' as const
        };
      case 'mesh_generation':
        return { 
          name: 'Mesh Generation', 
          icon: <Loader2 className="w-4 h-4 animate-spin text-blue-500" />, 
          status: 'processing' as const
        };
      case 'texture_mapping':
        return { 
          name: 'Texture Mapping', 
          icon: <Clock className="w-4 h-4 text-gray-400" />, 
          status: 'pending' as const
        };
      case 'completed':
        return { 
          name: 'Processing Complete', 
          icon: <CheckCircle className="w-4 h-4 text-green-500" />, 
          status: 'completed' as const
        };
      case 'failed':
        return { 
          name: 'Processing Failed', 
          icon: <Clock className="w-4 h-4 text-red-500" />, 
          status: 'failed' as const
        };
      default:
        return { 
          name: 'Unknown Stage', 
          icon: <Clock className="w-4 h-4" />, 
          status: 'pending' as const
        };
    }
  };

  const stageInfo = getStageInfo(processingStage);

  return (
    <div className="space-y-4">
      <h3 className="text-md font-medium text-foreground">3D Model Generation</h3>
      
      <Card className="p-6 bg-muted/30">
        <div className="space-y-4">
          {/* Progress Header */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Conversion Progress</span>
            <span className="text-sm text-primary" data-testid="conversion-progress">
              {processingProgress}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300 ease-in-out" 
              style={{ width: `${processingProgress}%` }} 
            />
          </div>

          {/* Processing Stages */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                {stageInfo.icon}
                <span className="text-foreground">{stageInfo.name}</span>
              </div>
              {processingStage === 'completed' && (
                <span className="text-green-600 text-xs">✓ Done</span>
              )}
            </div>
          </div>

          {/* Process Button */}
          {canStartProcessing && (
            <div className="flex justify-center pt-2">
              <Button 
                onClick={handleStartProcessing}
                disabled={start3DConversion.isPending || isProcessing}
                className="w-full"
                data-testid="button-start-processing"
              >
                {start3DConversion.isPending || isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Processing...
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

          {/* Status Messages */}
          {!hasValidScan && (
            <div className="text-center py-2">
              <p className="text-sm text-muted-foreground">
                Upload an MRI scan to begin 3D processing
              </p>
            </div>
          )}
          
          {processingStage === 'completed' && (
            <div className="text-center py-2">
              <p className="text-sm text-green-600">
                ✓ 3D model generated successfully
              </p>
            </div>
          )}
          
          {processingStage === 'failed' && (
            <div className="text-center py-2">
              <p className="text-sm text-red-600">
                ✗ Processing failed. Please try again.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}