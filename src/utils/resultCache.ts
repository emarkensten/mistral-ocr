/**
 * Enkel caching för att undvika duplicerade API-anrop
 */

interface CacheEntry {
  data: unknown;
  timestamp: number;
}

export class ResultCache {
  private static cache = new Map<string, CacheEntry>();
  private static readonly MAX_AGE = 5 * 60 * 1000; // 5 minuter
  
  static async getOrCompute<T>(
    key: string, 
    computeFn: () => Promise<T>
  ): Promise<T> {
    const cached = this.cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < this.MAX_AGE) {
      console.log(`[Cache] Hit for key: ${key.substring(0, 20)}...`);
      return cached.data as T;
    }
    
    console.log(`[Cache] Miss for key: ${key.substring(0, 20)}...`);
    const result = await computeFn();
    this.cache.set(key, {
      data: result,
      timestamp: Date.now()
    });
    
    // Rensa gamla entries
    this.cleanup();
    
    return result;
  }
  
  static generateImageKey(file: File, model: string): string {
    // Skapa en nyckel baserad på filstorlek, namn och modell
    return `${file.name}_${file.size}_${file.lastModified}_${model}`;
  }
  
  private static cleanup() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.MAX_AGE) {
        this.cache.delete(key);
      }
    }
  }
  
  static clear() {
    this.cache.clear();
  }
  
  static getSize(): number {
    return this.cache.size;
  }
}
