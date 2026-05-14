import { createClient } from '@supabase/supabase-js';
import type { Handler } from '@netlify/functions';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function parseSessionCookie(cookieHeader: string | undefined): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.split(';').find(c => c.trim().startsWith('cleanswift_session='));
  return match ? match.split('=')[1].trim() : null;
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const sessionId = parseSessionCookie(event.headers.cookie);
  if (sessionId) {
    await supabase.from('sessions').delete().eq('id', sessionId);
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': 'cleanswift_session=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/',
    },
    body: JSON.stringify({ ok: true }),
  };
};
