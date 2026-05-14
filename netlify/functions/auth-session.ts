import { createClient } from '@supabase/supabase-js';
import type { Handler } from '@netlify/functions';

const GOOGLE_CLIENT_ID = '339121394936-rguue4bt22dau41ldkj0kipt9fodggm3.apps.googleusercontent.com';

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
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const sessionId = parseSessionCookie(event.headers.cookie);
  if (!sessionId) {
    return { statusCode: 401, body: JSON.stringify({ error: 'No session' }) };
  }

  const { data: session, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', sessionId)
    .maybeSingle();

  if (error || !session) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Invalid session' }) };
  }

  if (new Date(session.expires_at) < new Date()) {
    await supabase.from('sessions').delete().eq('id', sessionId);
    return { statusCode: 401, body: JSON.stringify({ error: 'Session expired' }) };
  }

  let accessToken: string = session.access_token;

  // Refresh Google access token if expiring within 5 minutes
  const tokenExpiry = new Date(session.token_expires_at);
  if (tokenExpiry < new Date(Date.now() + 5 * 60 * 1000) && session.refresh_token) {
    try {
      const refreshRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          refresh_token: session.refresh_token,
          client_id: GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
          grant_type: 'refresh_token',
        }),
      });

      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        accessToken = refreshData.access_token;
        const newExpiry = new Date(Date.now() + (refreshData.expires_in ?? 3600) * 1000);
        await supabase.from('sessions').update({
          access_token: accessToken,
          token_expires_at: newExpiry.toISOString(),
        }).eq('id', sessionId);
      }
    } catch (err) {
      console.error('Token refresh failed:', err);
      // Fall through and return the existing token; Sheets will 401 if truly expired
    }
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accessToken, email: session.email }),
  };
};
