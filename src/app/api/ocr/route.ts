import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('[OCR] API route hit');
  
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;
    const selectedModel = request.headers.get('X-Model') || 'gpt-5-mini-2025-08-07';
    
    console.log('[OCR] Request details:', {
      hasFile: !!file,
      model: selectedModel,
      fileSize: file?.size
    });
    
    if (!file) {
      return NextResponse.json({ error: 'Ingen bild hittades' }, { status: 400 });
    }

    // Konvertera bilden till base64
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');
    const mimeType = file.type;
    const dataUrl = `data:${mimeType};base64,${base64}`;

    console.log('[OCR] Image converted to base64, size:', base64.length);

    // Använd Chat Completions API för alla modeller (inklusive GPT-5)
    const isGPT5Model = selectedModel.includes('gpt-5');
    const apiEndpoint = 'https://api.openai.com/v1/chat/completions';
    
    console.log(`[OCR] Using Chat Completions API for model: ${selectedModel}`);

    // Schema för strukturerad utdata
    const receiptSchema = {
      "type": "object",
      "properties": {
        "merchant_name": { "type": "string", "description": "Butikens namn" },
        "date": { "type": "string", "description": "Datum för köp (YYYY-MM-DD)" },
        "time": { "type": ["string", "null"], "description": "Tid för köp" },
        "total_amount": { "type": "number", "minimum": 0, "description": "Totalsumma" },
        "currency": { "type": "string", "enum": ["SEK", "EUR", "NOK", "DKK"], "description": "Valuta" },
        "expense_category": { "type": "string", "enum": ["Mat/Dryck", "Boende", "Transport", "Annat"], "description": "Typ av kostnad" },
        "items": {
          "type": "array",
          "description": "Varor på kvittot (om tydligt läsbara)",
          "items": {
            "type": "object",
            "properties": {
              "description": { "type": "string", "description": "Beskrivning av varan" },
              "price": { "type": "number", "minimum": 0, "description": "Pris för varan" }
            },
            "required": ["description", "price"],
            "additionalProperties": false
          }
        },
        "payment_method": { "type": ["string", "null"], "description": "Betalningsmetod om synlig" },
        "confidence_score": { "type": "number", "minimum": 0, "maximum": 1, "description": "Förtroende för OCR-avläsningen (0-1)" },
        "requires_manual_review": { "type": "boolean", "description": "Behöver manuell granskning" }
      },
      "required": ["merchant_name", "date", "time", "total_amount", "currency", "expense_category", "items", "payment_method", "confidence_score", "requires_manual_review"],
      "additionalProperties": false
    };

    // Använd Chat Completions format för alla modeller
    const requestBody = {
      model: selectedModel,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analysera detta kvitto och extrahera information enligt schemat. Fokusera på att identifiera butikens namn, datum, totalsumma, valuta och kostnadskategori. Om information saknas eller är otydlig, sätt confidence_score lägre och requires_manual_review till true.`
            },
            {
              type: 'image_url',
              image_url: { url: dataUrl }
            }
          ]
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "receipt_analysis",
          strict: true,
          schema: receiptSchema
        }
      },
      max_completion_tokens: isGPT5Model ? 50000 : 4000
    };

    console.log('[OCR] Making API request...');

    // Längre timeout för GPT-5 (120s), kortare för andra (60s)
    const timeoutMs = isGPT5Model ? 120000 : 60000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    console.log(`[OCR] Timeout set to ${timeoutMs/1000} seconds`);

    try {
      const openaiResponse = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify(requestBody)
      });

      clearTimeout(timeoutId);
      console.log('[OCR] OpenAI response status:', openaiResponse.status);

      if (!openaiResponse.ok) {
        let errorBody;
        try {
          errorBody = await openaiResponse.json();
        } catch {
          errorBody = await openaiResponse.text();
        }
        console.error('[OCR] OpenAI API error:', errorBody);
        
        const errorMessage = isGPT5Model 
          ? `GPT-5 modell (${selectedModel}) stöds inte eller är inte tillgänglig. Försök med en annan modell.`
          : `Fel vid OCR-analys med ${selectedModel}. Kontrollera att modellen stöder multimodal input och structured outputs.`;
        
        return NextResponse.json({
          error: errorMessage,
          model: selectedModel,
          api_used: isGPT5Model ? 'Responses API' : 'Chat Completions API',
          status: openaiResponse.status,
          details: errorBody,
        }, { status: openaiResponse.status });
      }

      const result = await openaiResponse.json();
      console.log('[OCR] API response received, parsing...');
      
      // Debug: logga strukturen
      console.log('[OCR] Response keys:', Object.keys(result));
      if (result?.choices?.[0]) {
        console.log('[OCR] First choice keys:', Object.keys(result.choices[0]));
        if (result.choices[0]?.message) {
          console.log('[OCR] Message keys:', Object.keys(result.choices[0].message));
        }
      }

      // Parse Chat Completions response (samma format för alla modeller nu)
      const message = result?.choices?.[0]?.message;
      const content = message?.content;
      const refusal = message?.refusal;
      let parsedData = null;
      
      const finishReason = result?.choices?.[0]?.finish_reason;
      
      console.log('[OCR] Content:', content ? `"${content.substring(0, 100)}..."` : 'null/empty');
      console.log('[OCR] Refusal:', refusal ? `"${refusal}"` : 'null');
      console.log('[OCR] Finish reason:', finishReason);
      
      if (refusal) {
        console.log('[OCR] Request was refused by the model:', refusal);
        return NextResponse.json({
          error: `Modellen vägrade att bearbeta bilden: ${refusal}`,
          model: selectedModel,
          refusal: refusal
        }, { status: 400 });
      }
      
      if (finishReason === 'length') {
        console.log('[OCR] Response truncated due to token limit');
        return NextResponse.json({
          error: `Svaret trunkerades pga token-gräns. Modellen ${selectedModel} behöver fler tokens.`,
          model: selectedModel,
          finish_reason: finishReason,
          suggestion: 'Försök med en kortare bild eller en annan modell'
        }, { status: 413 });
      }
      
      if (content) {
        try {
          parsedData = JSON.parse(content);
          console.log('[OCR] Successfully parsed response');
        } catch (e: unknown) {
          const errorMessage = e instanceof Error ? e.message : 'Unknown error';
          console.log('[OCR] Failed to parse response:', errorMessage);
          console.log('[OCR] Raw content (first 200 chars):', content.substring(0, 200));
        }
      } else {
        console.log('[OCR] No content found in response');
        console.log('[OCR] Response structure:', Object.keys(result));
        if (result?.choices?.[0]) {
          console.log('[OCR] First choice keys:', Object.keys(result.choices[0]));
        }
      }

      if (!parsedData) {
        console.error('[OCR] No parsed data found');
        return NextResponse.json({
          error: `Inget strukturerat resultat från ${selectedModel}`,
          model: selectedModel,
          api_used: 'Chat Completions API',
          raw_response: result 
        }, { status: 500 });
      }

      console.log('[OCR] Successfully parsed data');
      return NextResponse.json({ data: parsedData });

    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error('[OCR] Fetch error:', fetchError);
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return NextResponse.json({
          error: `Timeout efter ${timeoutMs/1000} sekunder för modell ${selectedModel}. Modellen svarar för långsamt.`,
          model: selectedModel,
          timeout: true,
          timeout_seconds: timeoutMs/1000
        }, { status: 408 });
      }
      
      throw fetchError;
    }

  } catch (error) {
    console.error('[OCR] API error:', error);
    
    return NextResponse.json({
      error: `Ett oväntat fel uppstod vid bildanalys`,
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}