"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X, Loader2, Zap } from "lucide-react";
import { ImageOptimizer } from "@/utils/imageOptimizer";

interface ImageUploadProps {
  onImageUpload: (file: File) => void;
  isLoading?: boolean;
}

export function ImageUpload({ onImageUpload, isLoading = false }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [optimizationInfo, setOptimizationInfo] = useState<string | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setIsOptimizing(true);
      
      try {
        let finalFile = file;
        let optimizationMessage = null;

        // Optimera bilden om den är stor
        if (ImageOptimizer.shouldOptimize(file)) {
          const result = await ImageOptimizer.optimizeImage(file);
          finalFile = result.optimizedFile;
          
          const savings = ((1 - result.compressionRatio) * 100).toFixed(0);
          optimizationMessage = `Optimerad: ${ImageOptimizer.formatFileSize(result.originalSize)} → ${ImageOptimizer.formatFileSize(result.optimizedSize)} (${savings}% mindre)`;
        }

        // Visa förhandsvisning
        const reader = new FileReader();
        reader.onload = () => {
          setPreview(reader.result as string);
          setOptimizationInfo(optimizationMessage);
        };
        reader.readAsDataURL(finalFile);
        
        // Skicka den optimerade filen
        onImageUpload(finalFile);
      } catch (error) {
        console.error('Bildoptimering misslyckades:', error);
        // Fallback: använd originalfilen
        const reader = new FileReader();
        reader.onload = () => {
          setPreview(reader.result as string);
          setOptimizationInfo("Optimering misslyckades, använder original");
        };
        reader.readAsDataURL(file);
        onImageUpload(file);
      } finally {
        setIsOptimizing(false);
      }
    }
  }, [onImageUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp']
    },
    multiple: false,
    disabled: isLoading
  });

  const clearImage = () => {
    setPreview(null);
    setOptimizationInfo(null);
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        {!preview ? (
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-primary/50'
              }
              ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <input {...getInputProps()} />
            {isOptimizing ? (
              <>
                <Loader2 className="mx-auto h-12 w-12 text-primary mb-4 animate-spin" />
                <p className="text-lg font-medium mb-2">Optimerar bild...</p>
                <p className="text-sm text-muted-foreground">
                  Anpassar storlek för bästa OCR-resultat
                </p>
              </>
            ) : (
              <>
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">
                  {isDragActive ? "Släpp kvittot här..." : "Ladda upp kvitto"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Dra och släpp en bild eller klicka för att välja fil
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Stödda format: JPG, PNG, GIF, BMP, WebP
                </p>
                <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
                  <Zap className="h-3 w-3" />
                  Stora bilder optimeras automatiskt
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Kvitto försiktighetsvisning"
              className="w-full h-auto max-h-96 object-contain rounded-lg border"
            />
            <Button
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={clearImage}
              disabled={isLoading}
            >
              <X className="h-4 w-4" />
            </Button>
            {optimizationInfo && (
              <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                <Zap className="h-3 w-3" />
                {optimizationInfo}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
