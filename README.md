# Mistral OCR Demo

En Next.js-applikation som använder Mistral AI för att analysera kvitton och extrahera strukturerad data.

## Funktioner

- 📸 Ladda upp kvitton som bilder (drag & drop eller filväljare)
- 🤖 AI-driven OCR-analys med Mistral Pixtral-modellen
- 📊 Visa resultat som både tabell och JSON
- 🎨 Clean shadcn/ui design
- 📱 Responsiv layout

## Installation

1. Klona repot:
```bash
git clone <repo-url>
cd mistral-ocr
```

2. Installera dependencies:
```bash
npm install
```

3. Konfigurera API-nyckel:
   - Kopiera `.env.local.example` till `.env.local`
   - Lägg till din Mistral API-nyckel från [Mistral Console](https://console.mistral.ai/)

4. Starta utvecklingsservern:
```bash
npm run dev
```

5. Öppna [http://localhost:3000](http://localhost:3000) i din webbläsare.

## Användning

1. Ladda upp en bild av ett kvitto genom att dra och släppa eller klicka för att välja fil
2. Vänta medan AI:n analyserar kvittot
3. Se resultatet i tabellformat eller som rå JSON-data
4. Kopiera JSON-data med kopieringsknappen

## Teknisk stack

- **Next.js 15** - React framework
- **TypeScript** - Typad JavaScript
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI-komponenter
- **Mistral AI** - OCR och textanalys
- **react-dropzone** - Filuppladdning

## API

Applikationen använder Mistral's Pixtral-modell för bildanalys. API:et förväntar sig:

- **Input**: Bildfil (JPG, PNG, GIF, BMP, WebP)
- **Output**: Strukturerad JSON med kvittodata

### Exempel på output:
```json
{
  "merchant": "ICA Supermarket",
  "date": "2024-01-15",
  "items": [
    {
      "name": "Mjölk 1L",
      "quantity": 2,
      "price": 12.50,
      "total": 25.00
    }
  ],
  "subtotal": 25.00,
  "tax": 6.25,
  "total": 31.25
}
```

## Utveckling

```bash
# Starta utvecklingsserver
npm run dev

# Bygg för produktion
npm run build

# Starta produktionsserver
npm start

# Lint kod
npm run lint
```

## Licens

MIT