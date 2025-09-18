import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface UploadedFile {
  name: string;
  size: number;
  status: "uploading" | "uploaded" | "error";
  id?: string;
  uploadedFilename?: string; // The actual filename saved on server
}

export function useFileUpload() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      // Step 1: Get presigned upload URL from backend
      const uploadUrlResponse = await apiRequest('POST', '/api/scans/upload-url');
      const { uploadURL } = await uploadUrlResponse.json();

      // Step 2: Upload file directly to Object Storage using presigned URL
      const uploadResponse = await fetch(uploadURL, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.status}`);
      }

      // Step 3: Create scan record in database
      const scanData = {
        filename: `mri-scan-${Date.now()}-${file.name}`,
        originalName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        uploadURL: uploadURL,
      };

      const createResponse = await apiRequest('POST', '/api/scans/create', scanData);
      return createResponse.json();
    },
    onSuccess: (data, file) => {
      setUploadedFiles(prev => 
        prev.map(f => 
          f.name === file.name 
            ? { ...f, status: "uploaded" as const, id: data.id, uploadedFilename: data.filename }
            : f
        )
      );
      toast({
        title: "Upload successful",
        description: `${file.name} has been uploaded successfully. Click 'Process' to start analysis.`,
      });
    },
    onError: (error, file) => {
      console.error("Upload error:", error);
      setUploadedFiles(prev => 
        prev.map(f => 
          f.name === file.name 
            ? { ...f, status: "error" as const }
            : f
        )
      );
      toast({
        title: "Upload failed",
        description: `Failed to upload ${file.name}. Please try again.`,
        variant: "destructive",
      });
    },
  });

  const uploadFile = (file: File) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Only JPG and PNG files are allowed.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "File size must be less than 50MB.",
        variant: "destructive",
      });
      return;
    }

    // Add file to the list immediately
    const newFile: UploadedFile = {
      name: file.name,
      size: file.size,
      status: "uploading"
    };
    
    setUploadedFiles(prev => [...prev, newFile]);
    
    // Start upload
    uploadMutation.mutate(file);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return {
    uploadedFiles,
    uploadFile,
    removeFile,
    isUploading: uploadMutation.isPending,
  };
}