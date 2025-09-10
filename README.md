# SJ Kvitto OCR

En Next.js-applikation som använder OpenAI GPT-4o för att analysera kvitton och extrahera strukturerad data för SJ förseningsersättning.

## Funktioner

- 📸 Ladda upp kvitton som bilder (drag & drop eller filväljare)
- 🤖 AI-driven OCR-analys med OpenAI-modeller
- 🔄 Modellväljare för att byta mellan olika AI-modeller
- 📊 Strukturerad dataextraktion med JSON Schema
- 🎯 Specifikt anpassat för SJ förseningsersättning
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
   - Lägg till din OpenAI API-nyckel från [OpenAI Platform](https://platform.openai.com/api-keys)

4. Starta utvecklingsservern:
```bash
npm run dev
```

5. Öppna [http://localhost:3000](http://localhost:3000) i din webbläsare.

## Användning

1. Välj AI-modell från dropdown-menyn (GPT-5 Mini är standard)
2. Ladda upp en bild av ett kvitto genom att dra och släppa eller klicka för att välja fil
3. Vänta medan AI:n analyserar kvittot
4. Se resultatet i tabellformat eller som rå JSON-data
5. Kopiera JSON-data med kopieringsknappen

## Teknisk stack

- **Next.js 15** - React framework
- **TypeScript** - Typad JavaScript
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI-komponenter
- **OpenAI GPT-4o** - OCR och textanalys med structured output
- **react-dropzone** - Filuppladdning

## Tillgängliga modeller

Applikationen stöder flera OpenAI-modeller som du kan välja mellan:

- **GPT-5 Mini** (Standard) - Snabb och kostnadseffektiv
- **GPT-5** - Högsta prestanda och noggrannhet  
- **GPT-5 Nano** - Snabbast och billigast
- **GPT-4o Mini** - Balanserad prestanda och kostnad
- **ChatGPT-4o Latest** - Senaste versionen av GPT-4o

## API

Applikationen använder OpenAI-modeller med structured output för bildanalys. API:et förväntar sig:

- **Input**: Bildfil (JPG, PNG, GIF, BMP, WebP)
- **Output**: Strukturerad JSON med kvittodata

### Exempel på output:
```json
{
  "merchant_name": "ICA Supermarket",
  "date": "2024-01-15",
  "time": "14:30",
  "total_amount": 31.25,
  "currency": "SEK",
  "expense_category": "Mat/Dryck",
  "items": [
    {
      "description": "Mjölk 1L",
      "price": 12.50
    }
  ],
  "payment_method": "Kort",
  "confidence_score": 0.95,
  "requires_manual_review": false
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