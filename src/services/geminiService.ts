export async function analyzeSpace(inputs: string | string[], refinementPrompt?: string, isVideo = false) {
  try {
    const response = await fetch('/api/analyze-space', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inputs, refinementPrompt, isVideo })
    });

    if (!response.ok) throw new Error('analysis-request-failed');
    const data = await response.json();
    return data.text || "No recommendations generated. Please try again.";
  } catch (error) {
    throw error;
  }
}

export async function generateAdminInsights(orders: any[], products: any[]) {
  try {
    const response = await fetch('/api/admin-insights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orders: orders.slice(0, 25).map(o => ({ status: o.status, type: o.type })),
        products: products.slice(0, 50).map(p => ({ name: p.name, category: p.category, tags: p.tags }))
      })
    });

    if (!response.ok) throw new Error('insight-request-failed');
    const data = await response.json();
    return data.text || "Store insights unavailable.";
  } catch (error) {
    return "Store insights could not be created.";
  }
}
