import { supabaseAdmin } from '../_lib/supabase.js';
import { verifyAdmin } from '../_lib/auth.js';

// Vercel serverless config: disable default body parser to handle raw buffer
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const admin = verifyAdmin(req);
  if (!admin) return res.status(403).json({ error: 'Admin access required' });

  try {
    const contentType = req.headers['content-type'] || '';

    // Handle base64 data URL uploads (from frontend canvas/FileReader)
    if (contentType.includes('application/json')) {
      const { file: base64Data, filename, mimeType } = req.body;

      if (!base64Data || !filename) {
        return res.status(400).json({ error: 'Missing file data or filename' });
      }

      // Decode base64
      const base64 = base64Data.replace(/^data:[^;]+;base64,/, '');
      const buffer = Buffer.from(base64, 'base64');
      const filePath = `uploads/${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

      const { data, error } = await supabaseAdmin.storage
        .from('products')
        .upload(filePath, buffer, {
          contentType: mimeType || 'image/jpeg',
          upsert: false,
        });

      if (error) {
        console.error('Supabase upload error:', error);
        if (error.message.includes('Bucket not found') || error.message.includes('bucket')) {
          return res.status(500).json({
            error: 'Bucket "products" introuvable. Créez-le dans Supabase → Storage → New Bucket → "products" (Public)',
          });
        }
        return res.status(500).json({ error: error.message });
      }

      const { data: { publicUrl } } = supabaseAdmin.storage.from('products').getPublicUrl(filePath);
      return res.status(200).json({ url: publicUrl, path: filePath });
    }

    return res.status(400).json({ error: 'Content-Type application/json avec base64 requis' });
  } catch (err) {
    console.error('Upload handler error:', err);
    return res.status(500).json({ error: err.message });
  }
}
