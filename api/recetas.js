export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  const { ingredientes } = req.body;
  if (!ingredientes) { res.status(400).json({ error: 'Faltan ingredientes' }); return; }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Tengo estos ingredientes disponibles en casa: ${ingredientes}. Sugerime 3 recetas simples que pueda hacer con lo que tengo, priorizando usar lo que ya está disponible. Para cada receta escribí el nombre, los ingredientes que uso de mi lista y los pasos básicos en no más de 4 líneas. Respondé en español rioplatense, de forma amigable y práctica.`
          }]
        }],
        generationConfig: { maxOutputTokens: 1000 }
      })
    });

    const data = await response.json();
    if (data.error) { res.status(500).json({ error: data.error.message }); return; }
    const texto = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sin respuesta';
    res.status(200).json({ texto });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
