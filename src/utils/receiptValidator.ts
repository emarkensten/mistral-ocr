/**
 * Validering och efterbearbetning av kvittodata
 */

export interface ValidatedReceiptData {
  merchant_name: string;
  date: string;
  time: string | null;
  total_amount: number;
  currency: string;
  expense_category: string;
  items: Array<{ description: string; price: number }>;
  payment_method: string | null;
  confidence_score: number;
  requires_manual_review: boolean;
  
  // Tillagda valideringsfält
  calculated_total?: number;
  total_mismatch?: boolean;
  validation_errors?: string[];
}

export class ReceiptValidator {
  static validateAndEnhance(data: unknown): ValidatedReceiptData {
    const errors: string[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dataAny = data as any;
    const enhancedData = { ...dataAny } as ValidatedReceiptData;

    // Validera datum
    if (dataAny.date && !this.isValidDate(dataAny.date)) {
      errors.push('Ogiltigt datum format');
      enhancedData.requires_manual_review = true;
      enhancedData.confidence_score = Math.min(enhancedData.confidence_score, 0.7);
    }

    // Validera belopp
    if (dataAny.total_amount <= 0 || dataAny.total_amount > 100000) {
      errors.push('Orealistiskt totalbelopp');
      enhancedData.requires_manual_review = true;
    }

    // Kontrollera svenska valutor
    if (!['SEK', 'EUR', 'NOK', 'DKK'].includes(dataAny.currency)) {
      errors.push(`Okänd valuta: ${dataAny.currency}`);
      enhancedData.currency = 'SEK'; // Default till SEK
      enhancedData.confidence_score = Math.min(enhancedData.confidence_score, 0.8);
    }

    // Summera items om de finns
    if (dataAny.items && Array.isArray(dataAny.items) && dataAny.items.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const calculatedTotal = dataAny.items.reduce((sum: number, item: any) => 
        sum + (parseFloat(item.price) || 0), 0
      );

      enhancedData.calculated_total = Math.round(calculatedTotal * 100) / 100;

      // Om summan inte stämmer, flagga för granskning
      const difference = Math.abs(calculatedTotal - dataAny.total_amount);
      if (difference > 0.01) {
        enhancedData.total_mismatch = true;
        enhancedData.requires_manual_review = true;
        errors.push(`Summan stämmer inte: beräknad ${calculatedTotal}, total ${dataAny.total_amount}`);
      }
    }

    // Validera handlarnamn
    if (!dataAny.merchant_name || dataAny.merchant_name.trim().length < 2) {
      errors.push('Handlarnamn saknas eller för kort');
      enhancedData.requires_manual_review = true;
    }

    // Kontrollera om confidence score är för lågt
    if (dataAny.confidence_score < 0.7) {
      enhancedData.requires_manual_review = true;
    }

    // Lägg till valideringsfel om de finns
    if (errors.length > 0) {
      enhancedData.validation_errors = errors;
    }

    return enhancedData;
  }

  private static isValidDate(dateStr: string): boolean {
    const date = new Date(dateStr);
    return date instanceof Date && !isNaN(date.getTime()) 
      && date.getFullYear() > 2000 
      && date <= new Date();
  }

  static formatCurrency(amount: number, currency: string): string {
    try {
      return new Intl.NumberFormat('sv-SE', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2
      }).format(amount);
    } catch {
      return `${amount} ${currency}`;
    }
  }

  static getValidationSummary(data: ValidatedReceiptData): string {
    const issues: string[] = [];

    if (data.requires_manual_review) {
      issues.push('Kräver manuell granskning');
    }

    if (data.total_mismatch) {
      issues.push('Summering stämmer inte');
    }

    if (data.confidence_score < 0.8) {
      issues.push('Låg säkerhet');
    }

    if (data.validation_errors && data.validation_errors.length > 0) {
      issues.push(`${data.validation_errors.length} valideringsfel`);
    }

    return issues.length > 0 ? issues.join(', ') : 'Validering OK';
  }
}
