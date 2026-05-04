import 'dotenv/config';
import express from 'express';
import { GoogleGenAI } from '@google/genai';

const app = express();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
const model = 'gemini-3-flash-preview';

app.use(express.json({ limit: '25mb' }));

app.post('/api/analyze-space', async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'missing-gemini-key' });
    }

    const { inputs, refinementPrompt, isVideo } = req.body as {
      inputs: string | string[];
      refinementPrompt?: string;
      isVideo?: boolean;
    };

    const basePrompt = `
      You are an expert interior designer for "Maridadi Creations".
      Analyze the provided visual input(s) of a room and provide:
      1. Overall style analysis.
      2. 5 specific recommendations for home decor (wall art, furniture, lighting, plants).
      3. Suggest how Maridadi Creations services (Photo Mounts, Custom Furniture, Branding, Portraits) could improve this space.

      Format your response in professional Markdown.
    `;

    const prompt = refinementPrompt
      ? `Based on the previous analysis of this room, please refine the recommendations. The user specifically wants: ${refinementPrompt}. Provide creative and practical interior design advice including furniture, color palette, and decor based on the artisanal spirit of Maridadi.`
      : basePrompt;

    const parts: any[] = [{ text: prompt }];
    if (Array.isArray(inputs)) {
      inputs.forEach(base64 => {
        parts.push({ inlineData: { mimeType: 'image/jpeg', data: base64 } });
      });
    } else {
      parts.push({ inlineData: { mimeType: isVideo ? 'video/mp4' : 'image/jpeg', data: inputs } });
    }

    const response = await ai.models.generateContent({
      model,
      contents: [{ role: 'user', parts }]
    });

    res.json({ text: response.text || '' });
  } catch {
    res.status(500).json({ error: 'analysis-failed' });
  }
});

app.post('/api/admin-insights', async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'missing-gemini-key' });
    }

    const { orders = [], products = [] } = req.body as { orders?: any[]; products?: any[] };
    const prompt = `
      You are the data strategist for "Maridadi Creations", a luxury Kenyan artisanal brand.
      Analyze the current business state:
      - Total Orders: ${orders.length}
      - Catalog Size: ${products.length}
      - Recent Orders Summary: ${JSON.stringify(orders.slice(0, 3))}

      Provide a brief high-level strategic brief (Markdown):
      1. Business Performance Summary.
      2. Inventory Recommendations based on observable demand patterns.
      3. 2 growth opportunities specifically for Maridadi.
      Keep it brief, professional, and luxury-focused. Use Kenyan business context.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });

    res.json({ text: response.text || '' });
  } catch {
    res.status(500).json({ error: 'insights-failed' });
  }
});

const port = Number(process.env.PORT || 8787);
app.listen(port, () => {
  console.log(`Maridadi AI API listening on ${port}`);
});
