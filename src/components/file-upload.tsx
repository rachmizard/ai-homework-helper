import * as React from "react";
import { Upload, Image, X } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  selectedFile: File | null;
  accept?: Record<string, string[]>;
  maxSize?: number; // in bytes
}

export function FileUpload({
  onFileSelect,
  onFileRemove,
  selectedFile,
  accept = { "image/*": [".jpeg", ".jpg", ".png"] },
  maxSize = 5 * 1024 * 1024, // 5MB in bytes
}: FileUploadProps) {
  const onDrop = React.useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      if (rejectedFiles.length > 0) {
        const error = rejectedFiles[0].errors[0];
        if (error.code === "file-invalid-type") {
          alert("Please select a valid image file (JPEG or PNG)");
        } else if (error.code === "file-too-large") {
          alert(`File size must be less than ${maxSize / 1024 / 1024}MB`);
        } else {
          alert(`File error: ${error.message}`);
        }
        return;
      }

      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect, maxSize]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
    disabled: !!selectedFile,
  });

  return (
    <div className="w-full">
      {!selectedFile ? (
        <div
          {...getRootProps()}
          className={cn(
            "relative rounded-lg border-2 border-dashed p-8 text-center transition-all cursor-pointer",
            isDragActive
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50 hover:bg-accent/50"
          )}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-sm font-medium">
            Drop your homework photo here, or click to browse 📸
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Supports JPEG & PNG (max {maxSize / 1024 / 1024}MB)
          </p>
        </div>
      ) : (
        <div className="relative rounded-lg border bg-muted/50 p-4">
          <div className="flex items-center gap-3">
            <Image className="h-10 w-10 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-medium truncate">
                {selectedFile.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onFileRemove();
              }}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
