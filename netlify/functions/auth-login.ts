import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import type { Handler } from '@netlify/functions';

const GOOGLE_CLIENT_ID = '339121394936-rguue4bt22dau41ldkj0kipt9fodggm3.apps.googleusercontent.com';
const SESSION_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let code: string;
  try {
    ({ code } = JSON.parse(event.body ?? '{}'));
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  if (!code) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing code' }) };
  }

  // Exchange authorization code for tokens server-side
  let accessToken: string;
  let refreshToken: string | undefined;
  let tokenExpiresIn: number;

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: 'postmessage',
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      console.error('Google token exchange failed:', await tokenRes.text());
      return { statusCode: 401, body: JSON.stringify({ error: 'Token exchange failed' }) };
    }

    const tokenData = await tokenRes.json();
    accessToken = tokenData.access_token;
    refreshToken = tokenData.refresh_token;
    tokenExpiresIn = tokenData.expires_in ?? 3600;
  } catch (err) {
    console.error('Token exchange error:', err);
    return { statusCode: 502, body: JSON.stringify({ error: 'Failed to exchange code' }) };
  }

  // Verify token and get email from Google
  let email: string;
  try {
    const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!userRes.ok) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Failed to get user info' }) };
    }
    const profile = await userRes.json();
    email = profile.email;
    if (!email) {
      return { statusCode: 401, body: JSON.stringify({ error: 'No email in Google profile' }) };
    }
  } catch {
    return { statusCode: 502, body: JSON.stringify({ error: 'Failed to reach Google' }) };
  }

  // Check subscription
  const { data: subData, error: subError } = await supabase
    .from('subscribers')
    .select('status')
    .eq('email', email)
    .maybeSingle();

  if (subError) {
    console.error('Supabase error:', subError);
    return { statusCode: 500, body: JSON.stringify({ error: 'Database error' }) };
  }

  const isSubscribed = subData?.status === 'active' || subData?.status === 'trialing';

  if (!isSubscribed) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isSubscribed: false, email }),
    };
  }

  // Create session record in Supabase
  const sessionId = randomUUID();
  const tokenExpiresAt = new Date(Date.now() + tokenExpiresIn * 1000);
  const sessionExpiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000);

  const { error: insertError } = await supabase.from('sessions').insert({
    id: sessionId,
    email,
    access_token: accessToken,
    refresh_token: refreshToken ?? null,
    token_expires_at: tokenExpiresAt.toISOString(),
    expires_at: sessionExpiresAt.toISOString(),
  });

  if (insertError) {
    console.error('Session insert error:', insertError);
    return { statusCode: 500, body: JSON.stringify({ error: 'Failed to create session' }) };
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': `cleanswift_session=${sessionId}; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_MAX_AGE}; Path=/`,
    },
    body: JSON.stringify({ isSubscribed: true, accessToken }),
  };
};
