"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ValidatedReceiptData } from "@/utils/receiptValidator";

interface ReceiptTableProps {
  data: ValidatedReceiptData;
}

export function ReceiptTable({ data }: ReceiptTableProps) {
  const formatCurrency = (amount: number | undefined, currency: string = 'SEK') => {
    if (amount === undefined) return "N/A";
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString('sv-SE');
    } catch {
      return dateString;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Kvittodata</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Merchant Info */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Butik</h4>
              <p className="text-lg">{data.merchant_name || "N/A"}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Datum</h4>
              <p className="text-lg">{formatDate(data.date)}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Tid</h4>
              <p className="text-lg">{data.time || "N/A"}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Totalt</h4>
              <p className="text-lg font-semibold">{formatCurrency(data.total_amount, data.currency)}</p>
            </div>
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Kategori</h4>
              <p className="text-lg">{data.expense_category || "N/A"}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Betalningsmetod</h4>
              <p className="text-lg">{data.payment_method || "N/A"}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Förtroende</h4>
              <p className="text-lg">
                {data.confidence_score ? `${Math.round(data.confidence_score * 100)}%` : "N/A"}
                {data.requires_manual_review && (
                  <span className="ml-2 text-orange-600 text-sm">(Kräver granskning)</span>
                )}
              </p>
            </div>
          </div>

          {/* Items Table */}
          {data.items && data.items.length > 0 && (
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-3">Varor</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Beskrivning</TableHead>
                    <TableHead className="text-right">Pris</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.description}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.price, data.currency)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Summary */}
          <div className="border-t pt-4">
            <div className="space-y-2">
              <div className="flex justify-between font-semibold text-lg">
                <span>Totalt:</span>
                <span>{formatCurrency(data.total_amount, data.currency)}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
