export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  const { ingredientes } = req.body;
  if (!ingredientes) { res.status(400).json({ error: 'Faltan ingredientes' }); return; }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: `Tengo estos ingredientes disponibles en casa: ${ingredientes}. Sugerime 3 recetas simples que pueda hacer con lo que tengo, priorizando usar lo que ya está disponible. Para cada receta escribí el nombre, los ingredientes que uso de mi lista y los pasos básicos en no más de 4 líneas. Respondé en español rioplatense, de forma amigable y práctica.`
        }]
      })
    });

    const data = await response.json();
    if (data.error) { res.status(500).json({ error: data.error.message }); return; }
    res.status(200).json({ texto: data.content?.[0]?.text || 'Sin respuesta' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
