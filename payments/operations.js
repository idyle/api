import 'dotenv/config';

import Stripe from 'stripe';
import { setUserClaims } from '../users/operations';

const stripe = new Stripe(process.env.STRIPE_KEY);

// needs some mechanism to check if the uid already has a plan, probably via users API

export const getCheckoutLink = async (uid, planId) => {
    if (!uid || !planId) return false;
    try {
        const config = {
            line_items: [ { price: planId, quantity: 1 }],
            success_url: "http://localhost:8080/payments/confirm/{CHECKOUT_SESSION_ID}",
            mode: 'subscription',
            client_reference_id: uid
        };
    
        const session = await stripe.checkout.sessions.create(config);
        if (!session) return false;
        return session.url;
    } catch (e) {
        console.error(e);
        return false;
    }
};

export const confirmCheckoutSession = async (uid, sessionId) => {
    if (!uid || !sessionId) return false;
    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId); 
        if (!session) return false;
        // verify that the ref id is the same as the calling user
        if (session.client_reference_id !== uid) return false;
        const set = await setSubscription(uid, session.subscription);
        if (!set) return false;
        return true;

    } catch (e) {
        console.error(e);
        return false;
    }
};

// handler to set subscription - used directly to also renew a subscription

export const setSubscription = async (uid, subId) => {
    if (!uid || !subId) return false;
    try {   
        const subscription = await stripe.subscriptions.retrieve(subId);
        if (!subscription) return false;
        const { id: planId, status, current_period_end: planEnd, items } = subscription;
        // if the subscription is no longer active
        if (status !== 'active' || planEnd < (Date.now() / 1000)) return false;
        const planType = items?.data[0]?.price?.id;
        if (!planType || !planEnd || !planId) return false;
        const set = await setUserClaims(uid, { planType, planEnd, planId });
        if (!set) return false;
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
};


