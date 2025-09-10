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
  // Optimala inställningar för OCR
  private static readonly MAX_WIDTH = 2048;
  private static readonly MAX_HEIGHT = 2048;
  private static readonly MIN_WIDTH = 800;
  private static readonly MIN_HEIGHT = 600;
  private static readonly QUALITY = 0.85; // 85% kvalitet för bra balans
  private static readonly MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB max

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
}
