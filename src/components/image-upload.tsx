"use client";

import { useCallback, useState } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value: string;
  onChange: (value: string) => void;
  onFileChange?: (file: File | null) => void;
  className?: string;
}

export function ImageUpload({ value, onChange, onFileChange, className }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState(value);

  const handleFile = useCallback(
    (file: File | null) => {
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("请选择图片文件");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("图片大小不能超过5MB");
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreview(result);
        onChange(result);
        onFileChange?.(file);
      };
      reader.readAsDataURL(file);
    },
    [onChange, onFileChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0] ?? null;
      handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] ?? null;
      handleFile(file);
    },
    [handleFile]
  );

  const handleRemove = useCallback(() => {
    setPreview("");
    onChange("");
    onFileChange?.(null);
  }, [onChange, onFileChange]);

  return (
    <div className={cn("space-y-2", className)}>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "relative border-2 border-dashed rounded-lg p-4 transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50"
        )}
      >
        {preview ? (
          <div className="relative aspect-square rounded-md overflow-hidden bg-muted">
            <img
              src={preview}
              alt="Preview"
              className="object-cover w-full h-full"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 p-1 bg-background rounded-full shadow-sm hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-2">
              拖拽图片到此处，或点击选择
            </p>
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleInputChange}
                className="hidden"
              />
              <span className="text-sm text-primary hover:underline">
                选择图片
              </span>
            </label>
            <p className="text-xs text-muted-foreground mt-2">
              支持 JPG、PNG、GIF，最大5MB
            </p>
          </div>
        )}
      </div>

      {/* URL Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={typeof value === "string" && !value.startsWith("data:") ? value : ""}
          onChange={(e) => {
            onChange(e.target.value);
            setPreview(e.target.value);
          }}
          placeholder="或输入图片 URL..."
          className="flex-1 h-10 px-3 rounded-md border border-input bg-background text-sm"
        />
      </div>
    </div>
  );
}
