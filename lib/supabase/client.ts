import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from './database.types';

export const supabase = createClientComponentClient<Database>({
  cookieOptions: {
    name: 'sb-auth-token',
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    domain: ''
  }
});
