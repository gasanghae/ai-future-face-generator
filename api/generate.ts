import { GoogleGenAI, Modality } from '@google/genai';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: 'GEMINI_API_KEY is not set' });
      return;
    }

    // Ensure JSON body is parsed
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { imageBase64, mimeType, gender } = body || {};
    if (!imageBase64 || !mimeType || !gender) {
      res.status(400).json({ error: 'imageBase64, mimeType, gender are required' });
      return;
    }

    const ai = new GoogleGenAI({ apiKey });

    const professions = [
      '운동선수', '의사', '교사', '아이돌', '만화가', '경찰', '요리사', 
      '변호사', 'IT전문가', '군인', '디자이너', '간호사', '사업가'
    ];

    const genderPrompt = gender === 'male' ? '20대 남자' : '20대 여자';
    const basePrompt = '아이의 20대 모습, 아시아, 한국인, 아이폰으로 찍은 것 같은 사실적인 사진';
    const randomProfession = professions[Math.floor(Math.random() * professions.length)];
    const finalPrompt = `${genderPrompt}, ${basePrompt}, ${randomProfession}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: imageBase64,
              mimeType: mimeType,
            },
          },
          {
            text: finalPrompt,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const generatedBase64 = part.inlineData.data;
        const generatedMimeType = part.inlineData.mimeType;
        res.status(200).json({ dataUrl: `data:${generatedMimeType};base64,${generatedBase64}` });
        return;
      }
    }

    res.status(502).json({ error: 'AI가 이미지를 생성하지 못했습니다. 다른 사진으로 시도해보세요.' });
  } catch (error) {
    console.error('Error generating image (api):', error);
    res.status(500).json({ error: '이미지 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' });
  }
}
