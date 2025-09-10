"use client";

import { useState } from "react";
import { ImageUpload } from "@/components/ImageUpload";
import { JsonDisplay } from "@/components/JsonDisplay";
import { ReceiptTable } from "@/components/ReceiptTable";
import { ModelSelector } from "@/components/ModelSelector";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Table } from "lucide-react";

interface ReceiptData {
  merchant_name?: string;
  date?: string;
  time?: string;
  total_amount?: number;
  currency?: string;
  expense_category?: string;
  items?: Array<{
    description: string;
    price: number;
  }>;
  payment_method?: string;
  confidence_score?: number;
  requires_manual_review?: boolean;
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState("gpt-5-mini-2025-08-07");

  const handleImageUpload = async (file: File) => {
    setIsLoading(true);
    setError(null);
    setReceiptData(null);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/ocr', {
        method: 'POST',
        headers: {
          'X-Model': selectedModel,
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Ett fel uppstod');
      }

      setReceiptData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ett oväntat fel uppstod');
    } finally {
      setIsLoading(false);
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

        {/* Error Display */}
        {error && (
          <Card className="mb-8 border-destructive">
            <CardContent className="pt-6">
              <p className="text-destructive font-medium">Fel: {error}</p>
            </CardContent>
          </Card>
        )}

        {/* Results Section */}
        {receiptData && (
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
        )}

        {/* Loading State */}
        {isLoading && (
          <Card className="mt-8">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <p className="text-muted-foreground">Analyserar kvitto...</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}