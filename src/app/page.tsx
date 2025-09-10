"use client";

import { useState } from "react";
import { ImageUpload } from "@/components/ImageUpload";
import { JsonDisplay } from "@/components/JsonDisplay";
import { ReceiptTable } from "@/components/ReceiptTable";
import { ModelSelector } from "@/components/ModelSelector";
import { LoadingProgress } from "@/components/LoadingProgress";
import { ExportButton } from "@/components/ExportButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Table, Clock, CheckCircle2, AlertTriangle } from "lucide-react";
import { ValidatedReceiptData } from "@/utils/receiptValidator";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [receiptData, setReceiptData] = useState<ValidatedReceiptData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState("gpt-5-mini-2025-08-07");
  const [loadingStage, setLoadingStage] = useState('');
  const [performanceData, setPerformanceData] = useState<{ total_time_ms?: number; cache_hit?: boolean } | null>(null);

  const handleImageUpload = async (file: File) => {
    setIsLoading(true);
    setError(null);
    setReceiptData(null);
    setPerformanceData(null);

    try {
      setLoadingStage('upload');
      
      const formData = new FormData();
      formData.append('image', file);

      setLoadingStage('api');

      const response = await fetch('/api/ocr', {
        method: 'POST',
        headers: {
          'X-Model': selectedModel,
        },
        body: formData,
      });

      setLoadingStage('validate');

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Ett fel uppstod');
      }

      setReceiptData(result.data);
      setPerformanceData(result.performance);
      
      setLoadingStage('complete');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ett oväntat fel uppstod');
    } finally {
      setIsLoading(false);
      setLoadingStage('');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <h1 className="text-4xl font-bold tracking-tight">
              SJ Kvitto OCR
            </h1>
            <ModelSelector 
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
            />
          </div>
          <p className="text-xl text-muted-foreground">
            Ladda upp ett kvitto och få strukturerad data för SJ förseningsersättning
          </p>
        </div>

        {/* Upload Section */}
        <div className="mb-8">
          <ImageUpload 
            onImageUpload={handleImageUpload} 
            isLoading={isLoading}
          />
        </div>

        {/* Loading Progress */}
        {isLoading && (
          <LoadingProgress stage={loadingStage} model={selectedModel} />
        )}

        {/* Error Display */}
        {error && (
          <Card className="mb-8 border-destructive">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <p className="text-destructive font-medium">Fel: {error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Section */}
        {receiptData && (
          <div className="space-y-6">
            {/* Performance & Export Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {performanceData && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{(performanceData.total_time_ms! / 1000).toFixed(1)}s</span>
                    {performanceData.cache_hit && (
                      <span className="text-green-600">(Cache)</span>
                    )}
                  </div>
                )}
                {receiptData.requires_manual_review && (
                  <div className="flex items-center gap-2 text-sm text-amber-600">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Kräver granskning</span>
                  </div>
                )}
                {!receiptData.requires_manual_review && receiptData.confidence_score && receiptData.confidence_score > 0.8 && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Hög säkerhet</span>
                  </div>
                )}
              </div>
              <ExportButton data={receiptData} />
            </div>
          <Tabs defaultValue="table" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="table" className="flex items-center gap-2">
                <Table className="h-4 w-4" />
                Tabellvy
              </TabsTrigger>
              <TabsTrigger value="json" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                JSON-data
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="table" className="mt-6">
              <ReceiptTable data={receiptData} />
            </TabsContent>
            
            <TabsContent value="json" className="mt-6">
              <JsonDisplay data={receiptData} title="OCR Resultat" />
            </TabsContent>
          </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}