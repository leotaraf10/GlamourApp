export default function handler(req, res) {
  res.status(200).json({
    supabase_url_exists: !!process.env.SUPABASE_URL,
    supabase_anon_key_exists: !!process.env.SUPABASE_ANON_KEY,
    jwt_secret_exists: !!process.env.JWT_SECRET,
    node_env: process.env.NODE_ENV,
    url_preview: process.env.SUPABASE_URL ? process.env.SUPABASE_URL.substring(0, 10) + '...' : 'none'
  });
}
