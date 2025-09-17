import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, CheckCircle, X, FileImage } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFileUpload } from "@/hooks/use-file-upload";

export default function UploadArea() {
  const { uploadedFiles, uploadFile, removeFile, isUploading } = useFileUpload();

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

  return (
    <div className="space-y-4">
      <Card
        {...getRootProps()}
        className={`border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
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
        <div className="space-y-2">
          {uploadedFiles.map((file, index) => (
            <Card key={index} className="flex items-center justify-between p-3 bg-muted/30">
              <div className="flex items-center space-x-3">
                <FileImage className="text-primary h-5 w-5" />
                <div>
                  <p className="text-sm font-medium text-foreground" data-testid={`file-name-${index}`}>
                    {file.name}
                  </p>
                  <p className="text-xs text-muted-foreground" data-testid={`file-status-${index}`}>
                    {(file.size / (1024 * 1024)).toFixed(1)} MB • {file.status}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {file.status === "uploaded" && (
                  <CheckCircle className="text-secondary h-4 w-4" />
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

      {isUploading && (
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 text-sm text-primary">
            <div className="animate-spin rounded-full h-4 w-4 border-b border-primary" />
            <span>Processing uploads...</span>
          </div>
        </div>
      )}
    </div>
  );
}
