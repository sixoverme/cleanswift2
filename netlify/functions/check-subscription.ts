import { createClient } from '@supabase/supabase-js';
import type { Handler } from '@netlify/functions';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let accessToken: string;
  try {
    ({ accessToken } = JSON.parse(event.body ?? '{}'));
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  if (!accessToken) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing accessToken' }) };
  }

  // Verify the token with Google and get the user's email.
  // This call will fail with 401 if the token is invalid or expired —
  // so the email we get back is guaranteed to belong to this token.
  let email: string;
  try {
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Invalid Google token' }) };
    }
    const profile = await res.json();
    email = profile.email;
    if (!email) {
      return { statusCode: 401, body: JSON.stringify({ error: 'No email in Google profile' }) };
    }
  } catch {
    return { statusCode: 502, body: JSON.stringify({ error: 'Failed to reach Google' }) };
  }

  const { data, error } = await supabase
    .from('subscribers')
    .select('status')
    .eq('email', email)
    .maybeSingle();

  if (error) {
    console.error('Supabase query error:', error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Database error' }) };
  }

  const isSubscribed = data?.status === 'active' || data?.status === 'trialing';

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      isSubscribed,
      status: data?.status ?? null,
    }),
  };
};
