export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // This runs securely on Vercel's backend edge network
    const API_URL = process.env.API_BASE_URL;
    
    if (!API_URL) {
      throw new Error("API_BASE_URL environment variable is not defined");
    }
    
    const backendResponse = await fetch(`${API_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body)
    });

    const data = await backendResponse.json();
    return res.status(backendResponse.status).json(data);
    
  } catch (error) {
    console.error("Vercel Function Error:", error);
    return res.status(500).json({ error: 'Internal Server Error fetching from backend' });
  }
}
