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
      const formData = new FormData();
      formData.append('mriFile', file);
      
      const response = await apiRequest('POST', '/api/scans/upload', formData);
      return response.json();
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
