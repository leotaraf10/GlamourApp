console.log('NODE IS WORKING');
import { createClient } from '@supabase/supabase-js';
console.log('SUPABASE SDK LOADED');
const supabase = createClient('https://zplnrgzlvqdunuizpldq.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwbG5yZ3psdnFkdW51aXpwbGRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyMTczMTAsImV4cCI6MjA5MDc5MzMxMH0.5ZJQekU4VLmgRi1__7SWd1ev2F-W9FFOaMSeFeHt7l0');
console.log('CLIENT INITIALIZED');
const { data, error } = await supabase.from('products').select('*');
if (error) console.error('SUPABASE ERROR:', error);
else console.log('SUPABASE SUCCESS:', data.length, 'products found');
process.exit(0);
