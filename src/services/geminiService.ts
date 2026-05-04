import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function analyzeSpace(inputs: string | string[], refinementPrompt?: string, isVideo = false) {
  try {
    const model = "gemini-3-flash-preview";
    
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
        parts.push({
          inlineData: {
            mimeType: "image/jpeg",
            data: base64
          }
        });
      });
    } else {
      parts.push({
        inlineData: {
          mimeType: isVideo ? "video/mp4" : "image/jpeg",
          data: inputs
        }
      });
    }

    const response = await ai.models.generateContent({
      model: model,
      contents: [{ role: 'user', parts }]
    });

    return response.text || "No recommendations generated. Please try again.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
}

export async function generateAdminInsights(orders: any[], products: any[]) {
  try {
    const model = "gemini-3-flash-preview";
    const prompt = `
      You are the data strategist for "Maridadi Creations", a luxury Kenyan artisanal brand.
      Analyze the current business state:
      - Total Orders: ${orders.length}
      - Catalog Size: ${products.length}
      - Recent Orders Summary: ${JSON.stringify(orders.slice(0, 3).map(o => ({ status: o.status, type: o.type })))}

      Provide a brief high-level strategic brief (Markdown):
      1. Business Performance Summary.
      2. Inventory Recommendations (What styles should we source more of based on trends?).
      3. 2 Growth Opportunities specifically for Maridadi.
      Keep it brief, professional, and luxury-focused. Use Kenyan business context.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });

    return response.text || "Strategy data unavailable.";
  } catch (error) {
    console.error("Insight Error:", error);
    return "Market analysis failed.";
  }
}
