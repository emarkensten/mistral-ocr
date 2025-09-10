/**
 * Optimerar bilder för OCR genom att balansera filstorlek med läsbarhet
 */

export interface ImageOptimizationResult {
  optimizedFile: File;
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
  dimensions: { width: number; height: number };
}

export class ImageOptimizer {
  // Förbättrade inställningar för OCR
  private static readonly MAX_WIDTH = 3000;  // Ökat för bättre textläsbarhet
  private static readonly MAX_HEIGHT = 3000;
  private static readonly MIN_WIDTH = 1200;  // Ökat minimum
  private static readonly MIN_HEIGHT = 900;
  private static readonly QUALITY = 0.92;    // Högre kvalitet för text
  private static readonly MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB för bättre kvalitet

  static async optimizeImage(file: File): Promise<ImageOptimizationResult> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      img.onload = () => {
        try {
          // Beräkna optimala dimensioner
          const { width, height } = this.calculateOptimalDimensions(
            img.width,
            img.height
          );

          // Sätt canvas-storlek
          canvas.width = width;
          canvas.height = height;

          // Förbättra rendering för text
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // Rita bilden med nya dimensioner
          ctx.drawImage(img, 0, 0, width, height);

          // Förbättra kontrast för bättre OCR
          this.enhanceForOCR(canvas, ctx);

          // Konvertera till blob med optimal kvalitet
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to create optimized blob'));
                return;
              }

              // Skapa ny fil
              const optimizedFile = new File(
                [blob],
                file.name.replace(/\.[^/.]+$/, '_optimized.jpg'),
                { type: 'image/jpeg' }
              );

              const result: ImageOptimizationResult = {
                optimizedFile,
                originalSize: file.size,
                optimizedSize: blob.size,
                compressionRatio: blob.size / file.size,
                dimensions: { width, height }
              };

              resolve(result);
            },
            'image/jpeg',
            this.QUALITY
          );
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      // Ladda bilden
      img.src = URL.createObjectURL(file);
    });
  }

  private static calculateOptimalDimensions(
    originalWidth: number,
    originalHeight: number
  ): { width: number; height: number } {
    let { width, height } = { width: originalWidth, height: originalHeight };

    // Om bilden är för stor, skala ner proportionellt
    if (width > this.MAX_WIDTH || height > this.MAX_HEIGHT) {
      const widthRatio = this.MAX_WIDTH / width;
      const heightRatio = this.MAX_HEIGHT / height;
      const ratio = Math.min(widthRatio, heightRatio);

      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }

    // Om bilden är för liten, skala upp (men inte för mycket)
    if (width < this.MIN_WIDTH && height < this.MIN_HEIGHT) {
      const widthRatio = this.MIN_WIDTH / width;
      const heightRatio = this.MIN_HEIGHT / height;
      const ratio = Math.max(widthRatio, heightRatio);

      // Begränsa uppskalning till max 2x
      const maxRatio = Math.min(ratio, 2);

      width = Math.round(width * maxRatio);
      height = Math.round(height * maxRatio);
    }

    return { width, height };
  }

  static shouldOptimize(file: File): boolean {
    // Optimera om filen är större än 1MB eller troligen större än optimal storlek
    return file.size > 1024 * 1024;
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  // Förbättra kontrast för bättre textläsning
  static enhanceForOCR(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Öka kontrast för bättre textläsning
    for (let i = 0; i < data.length; i += 4) {
      // Konvertera till gråskala med förbättrad kontrast
      const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
      const enhanced = gray > 128 ? Math.min(255, gray * 1.2) : Math.max(0, gray * 0.8);
      
      data[i] = enhanced;     // R
      data[i + 1] = enhanced; // G
      data[i + 2] = enhanced; // B
      // Alpha channel (data[i + 3]) förblir oförändrad
    }
    
    ctx.putImageData(imageData, 0, 0);
  }
}
