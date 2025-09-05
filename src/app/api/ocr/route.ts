import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'Ingen bild hittades' }, { status: 400 });
    }

    // Konvertera bilden till base64
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');
    const mimeType = file.type;
    const dataUrl = `data:${mimeType};base64,${base64}`;

    // Mistral API-anrop
    const mistralResponse = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'pixtral-12b-2409',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analysera detta kvitto och extrahera följande information i JSON-format:
                {
                  "merchant": "butikens namn",
                  "date": "datum i YYYY-MM-DD format",
                  "items": [
                    {
                      "name": "produktnamn",
                      "quantity": antal,
                      "price": pris_per_enhet,
                      "total": total_pris
                    }
                  ],
                  "subtotal": "delsumma före moms",
                  "tax": "momsbelopp",
                  "total": "totalbelopp"
                }
                
                Om någon information saknas, använd null för det fältet.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: dataUrl
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.1
      })
    });

    if (!mistralResponse.ok) {
      const errorData = await mistralResponse.text();
      console.error('Mistral API error:', errorData);
      return NextResponse.json(
        { error: 'Fel vid OCR-analys' }, 
        { status: mistralResponse.status }
      );
    }

    const result = await mistralResponse.json();
    const content = result.choices[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: 'Inget resultat från OCR-analys' }, 
        { status: 500 }
      );
    }

    // Försök att parsa JSON från responsen
    let parsedData;
    try {
      // Extrahera JSON från texten om det finns annan text runt omkring
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
      } else {
        parsedData = JSON.parse(content);
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return NextResponse.json(
        { error: 'Kunde inte parsa OCR-resultat', rawContent: content }, 
        { status: 500 }
      );
    }

    return NextResponse.json({ data: parsedData });

  } catch (error) {
    console.error('OCR API error:', error);
    return NextResponse.json(
      { error: 'Ett fel uppstod vid bildanalys' }, 
      { status: 500 }
    );
  }
}
