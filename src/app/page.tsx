"use client";

import { useState } from "react";
import { ImageUpload } from "@/components/ImageUpload";
import { JsonDisplay } from "@/components/JsonDisplay";
import { ReceiptTable } from "@/components/ReceiptTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Table } from "lucide-react";

interface ReceiptData {
  merchant?: string;
  date?: string;
  total?: number;
  items?: Array<{
    name: string;
    quantity?: number;
    price?: number;
    total?: number;
  }>;
  tax?: number;
  subtotal?: number;
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = async (file: File) => {
    setIsLoading(true);
    setError(null);
    setReceiptData(null);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/ocr', {
        method: 'POST',
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
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            Mistral OCR Demo
          </h1>
          <p className="text-xl text-muted-foreground">
            Ladda upp ett kvitto och se hur AI tolkar innehållet
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