"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileText, FileSpreadsheet } from "lucide-react";
import { ValidatedReceiptData } from "@/utils/receiptValidator";

interface ExportButtonProps {
  data: ValidatedReceiptData;
}

export function ExportButton({ data }: ExportButtonProps) {
  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const convertToCSV = (data: ValidatedReceiptData): string => {
    const headers = [
      'Handlare',
      'Datum', 
      'Tid',
      'Totalsumma',
      'Valuta',
      'Kategori',
      'Betalningsmetod',
      'Förtroende',
      'Manuell granskning',
      'Antal varor'
    ];

    const values = [
      data.merchant_name || '',
      data.date || '',
      data.time || '',
      data.total_amount?.toString() || '',
      data.currency || '',
      data.expense_category || '',
      data.payment_method || '',
      data.confidence_score?.toFixed(2) || '',
      data.requires_manual_review ? 'Ja' : 'Nej',
      data.items?.length?.toString() || '0'
    ];

    let csv = headers.join(',') + '\n';
    csv += values.map(value => `"${value}"`).join(',') + '\n';

    // Lägg till varor om de finns
    if (data.items && data.items.length > 0) {
      csv += '\n"Varor:"\n';
      csv += '"Beskrivning","Pris"\n';
      data.items.forEach(item => {
        csv += `"${item.description}","${item.price}"\n`;
      });
    }

    return csv;
  };

  const exportAsCSV = () => {
    const csv = convertToCSV(data);
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `kvitto_${data.merchant_name?.replace(/[^a-zA-Z0-9]/g, '_') || 'unknown'}_${timestamp}.csv`;
    downloadFile(csv, filename, 'text/csv;charset=utf-8');
  };

  const exportAsJSON = () => {
    const json = JSON.stringify(data, null, 2);
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `kvitto_${data.merchant_name?.replace(/[^a-zA-Z0-9]/g, '_') || 'unknown'}_${timestamp}.json`;
    downloadFile(json, filename, 'application/json');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          Exportera
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Välj format</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={exportAsCSV} className="gap-2">
          <FileSpreadsheet className="h-4 w-4" />
          Som CSV (Excel)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportAsJSON} className="gap-2">
          <FileText className="h-4 w-4" />
          Som JSON (Data)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
