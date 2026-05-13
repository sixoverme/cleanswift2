import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import type { Handler } from '@netlify/functions';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const sig = event.headers['stripe-signature'];
  if (!sig) {
    return { statusCode: 400, body: 'Missing stripe-signature header' };
  }

  let stripeEvent: Stripe.Event;
  try {
    stripeEvent = stripe.webhooks.constructEvent(
      event.body!,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return { statusCode: 400, body: 'Invalid signature' };
  }

  try {
    switch (stripeEvent.type) {
      case 'checkout.session.completed': {
        const session = stripeEvent.data.object as Stripe.Checkout.Session;
        const email = session.customer_details?.email ?? session.customer_email;
        if (!email) break;
        await supabase.from('subscribers').upsert({
          email,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
          status: 'active',
        }, { onConflict: 'email' });
        break;
      }

      case 'customer.subscription.updated': {
        const sub = stripeEvent.data.object as Stripe.Subscription;
        const status = sub.status === 'active' ? 'active'
          : sub.status === 'past_due' ? 'past_due'
          : sub.status === 'canceled' ? 'canceled'
          : sub.status === 'trialing' ? 'trialing'
          : 'canceled';
        await supabase.from('subscribers')
          .update({ status, stripe_subscription_id: sub.id })
          .eq('stripe_customer_id', sub.customer as string);
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = stripeEvent.data.object as Stripe.Subscription;
        await supabase.from('subscribers')
          .update({ status: 'canceled' })
          .eq('stripe_customer_id', sub.customer as string);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = stripeEvent.data.object as Stripe.Invoice;
        await supabase.from('subscribers')
          .update({ status: 'past_due' })
          .eq('stripe_customer_id', invoice.customer as string);
        break;
      }
    }
  } catch (err) {
    console.error('Error processing webhook event:', err);
    return { statusCode: 500, body: 'Internal server error' };
  }

  return { statusCode: 200, body: JSON.stringify({ received: true }) };
};
