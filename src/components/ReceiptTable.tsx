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

interface ReceiptItem {
  name: string;
  quantity?: number;
  price?: number;
  total?: number;
}

interface ReceiptData {
  merchant?: string;
  date?: string;
  total?: number;
  items?: ReceiptItem[];
  tax?: number;
  subtotal?: number;
}

interface ReceiptTableProps {
  data: ReceiptData;
}

export function ReceiptTable({ data }: ReceiptTableProps) {
  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined) return "N/A";
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'SEK'
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Butik</h4>
              <p className="text-lg">{data.merchant || "N/A"}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Datum</h4>
              <p className="text-lg">{formatDate(data.date)}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-muted-foreground">Totalt</h4>
              <p className="text-lg font-semibold">{formatCurrency(data.total)}</p>
            </div>
          </div>

          {/* Items Table */}
          {data.items && data.items.length > 0 && (
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-3">Varor</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produkt</TableHead>
                    <TableHead className="text-right">Antal</TableHead>
                    <TableHead className="text-right">Pris</TableHead>
                    <TableHead className="text-right">Totalt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="text-right">
                        {item.quantity || "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.price)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(item.total)}
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
              {data.subtotal && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delsumma:</span>
                  <span>{formatCurrency(data.subtotal)}</span>
                </div>
              )}
              {data.tax && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Moms:</span>
                  <span>{formatCurrency(data.tax)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-lg border-t pt-2">
                <span>Totalt:</span>
                <span>{formatCurrency(data.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
