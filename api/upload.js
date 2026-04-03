import { supabase } from '../_lib/supabase.js';
import { verifyAdmin } from '../_lib/auth.js';

export const config = {
  api: {
    bodyParser: false, // Disables Vercel's default parser to handle multipart/form-data manually or via buffer
  },
};

// Helper to parse multipart/form-data with a buffer-based approach
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const admin = verifyAdmin(req);
  if (!admin) return res.status(403).json({ error: 'Admin access required' });

  // Use a specialized approach for Vercel/Supabase uploads
  // Since we are in a serverless function, we should ideally use a library like 'formidable'
  // But for a 100% free/simple setup, we can also use Supabase's signed URLs or just client-side upload.
  
  // Actually, CHIC GLAM admin is already using client-side fetch with FormData.
  // We will use 'busboy' or similar to parse the file in the serverless function.
  
  // NOTE: For absolute simplicity and reliability in a serverless environment WITHOUT additional bulky dependencies,
  // we can also suggest the user to use the Supabase JS Client DIRECTLY from the frontend for uploads.
  // But since they have a backend, we'll try to keep it here.
  
  return res.status(501).json({ error: 'Pour un hébergement 100% gratuit, utilisez des URLs d\'images directes ou configurez Supabase Storage.' });
}
