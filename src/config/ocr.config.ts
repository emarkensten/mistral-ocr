/**
 * OCR-konfiguration för olika miljöer och inställningar
 */

export const OCR_CONFIG = {
  models: {
    default: process.env.NEXT_PUBLIC_DEFAULT_MODEL || 'gpt-5-mini-2025-08-07',
    fallback: 'gpt-4o-mini-2024-07-18',
    available: [
      {
        id: "gpt-5-mini-2025-08-07",
        name: "GPT-5 Mini",
        description: "Snabb och kostnadseffektiv",
        tier: "premium"
      },
      {
        id: "gpt-5-2025-08-07", 
        name: "GPT-5",
        description: "Högsta prestanda",
        tier: "premium"
      },
      {
        id: "gpt-5-nano-2025-08-07",
        name: "GPT-5 Nano", 
        description: "Snabbast och billigast",
        tier: "premium"
      },
      {
        id: "gpt-4o-mini-2024-07-18",
        name: "GPT-4o Mini",
        description: "Balanserad prestanda", 
        tier: "standard"
      },
      {
        id: "chatgpt-4o-latest",
        name: "ChatGPT-4o Latest",
        description: "Senaste versionen",
        tier: "standard"
      }
    ]
  },
  
  timeouts: {
    'gpt-5': 120000, // 2 minuter för GPT-5 modeller
    'gpt-4o': 60000, // 1 minut för GPT-4o modeller  
    'default': 30000 // 30 sekunder default
  },
  
  retries: {
    max: parseInt(process.env.NEXT_PUBLIC_MAX_RETRIES || '3'),
    delay: parseInt(process.env.NEXT_PUBLIC_RETRY_DELAY || '1000'),
    exponential: true
  },
  
  optimization: {
    enabled: process.env.NEXT_PUBLIC_ENABLE_OPTIMIZATION !== 'false',
    quality: parseFloat(process.env.NEXT_PUBLIC_IMAGE_QUALITY || '0.92'),
    maxWidth: parseInt(process.env.NEXT_PUBLIC_MAX_WIDTH || '3000'),
    maxHeight: parseInt(process.env.NEXT_PUBLIC_MAX_HEIGHT || '3000'),
    minWidth: parseInt(process.env.NEXT_PUBLIC_MIN_WIDTH || '1200'),
    minHeight: parseInt(process.env.NEXT_PUBLIC_MIN_HEIGHT || '900'),
    maxFileSize: parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || '4194304'), // 4MB
    contrastEnhancement: process.env.NEXT_PUBLIC_CONTRAST_ENHANCEMENT !== 'false'
  },
  
  caching: {
    enabled: process.env.NEXT_PUBLIC_ENABLE_CACHE !== 'false',
    maxAge: parseInt(process.env.NEXT_PUBLIC_CACHE_MAX_AGE || '300000'), // 5 minuter
    maxEntries: parseInt(process.env.NEXT_PUBLIC_CACHE_MAX_ENTRIES || '100')
  },
  
  validation: {
    enabled: process.env.NEXT_PUBLIC_ENABLE_VALIDATION !== 'false',
    strictMode: process.env.NEXT_PUBLIC_STRICT_VALIDATION === 'true',
    requiredConfidence: parseFloat(process.env.NEXT_PUBLIC_MIN_CONFIDENCE || '0.7'),
    supportedCurrencies: ['SEK', 'EUR', 'NOK', 'DKK'],
    maxAmount: parseInt(process.env.NEXT_PUBLIC_MAX_AMOUNT || '100000')
  },
  
  performance: {
    monitoring: process.env.NODE_ENV === 'development',
    logLevel: process.env.NEXT_PUBLIC_LOG_LEVEL || 'info'
  },
  
  features: {
    export: process.env.NEXT_PUBLIC_ENABLE_EXPORT !== 'false',
    progressIndicator: process.env.NEXT_PUBLIC_ENABLE_PROGRESS !== 'false',
    darkMode: process.env.NEXT_PUBLIC_ENABLE_DARK_MODE !== 'false'
  }
};

// Helper-funktioner
export const getModelConfig = (modelId: string) => {
  return OCR_CONFIG.models.available.find(m => m.id === modelId);
};

export const getTimeoutForModel = (modelId: string): number => {
  if (modelId.includes('gpt-5')) {
    return OCR_CONFIG.timeouts['gpt-5'];
  }
  if (modelId.includes('gpt-4o')) {
    return OCR_CONFIG.timeouts['gpt-4o'];
  }
  return OCR_CONFIG.timeouts.default;
};

export const getTokenLimitForModel = (modelId: string): number => {
  if (modelId.includes('gpt-5')) {
    return 50000; // Hög limit för GPT-5
  }
  return 4000; // Standard för andra modeller
};

export const isDevelopment = (): boolean => {
  return process.env.NODE_ENV === 'development';
};

export const isProduction = (): boolean => {
  return process.env.NODE_ENV === 'production';
};
