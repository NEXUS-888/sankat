# 💳 Payment System Setup Guide (Stripe Integration)

## Overview

Your Sankat project now has a fully integrated Stripe payment system for processing donations. This guide will help you set up and configure the payment processing.

---

## 🚀 Quick Setup

### 1. Get Stripe API Keys

1. Go to https://dashboard.stripe.com/register
2. Create a free Stripe account
3. Navigate to **Developers** → **API keys**
4. Copy both keys:
   - **Publishable key** (starts with `pk_test_...`)
   - **Secret key** (starts with `sk_test_...`)

### 2. Configure Frontend

Add to `/home/nexus/Sankat/sankat/.env`:

```bash
# Stripe Publishable Key (Test Mode)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_ACTUAL_KEY_HERE
```

### 3. Configure Backend

Add to `/home/nexus/Sankat/sankat/backend/.env`:

```bash
# Stripe Secret Key (Test Mode)
STRIPE_SECRET_KEY=sk_test_YOUR_ACTUAL_SECRET_KEY_HERE
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_ACTUAL_KEY_HERE

# Webhook secret (get this after setting up webhooks)
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
```

### 4. Restart Servers

```bash
# Terminal 1: Frontend
cd /home/nexus/Sankat/sankat
npm run dev

# Terminal 2: Backend
cd /home/nexus/Sankat/sankat/backend
source ../.venv/bin/activate
python -m uvicorn app.main:app --reload --port 8000
```

---

## 🎯 Features Implemented

### ✅ Payment Processing
- Secure Stripe payment integration
- Support for credit/debit cards, Apple Pay, Google Pay
- PCI-compliant (Stripe handles all card data)
- httpOnly cookies for authentication
- CSRF protection for security

### ✅ Donation Flow
1. **Amount Selection**
   - Preset amounts: $10, $25, $50, $100, $250, $500
   - Custom amount input
   - Optional donor name and email

2. **Payment Processing**
   - Stripe Payment Element (handles all payment methods)
   - Real-time validation
   - 3D Secure (SCA) support for European cards

3. **Confirmation**
   - Success message with amount
   - Optional email receipt (if configured)
   - Webhook notifications to backend

### ✅ UI Components Created
- `DonationModal.tsx` - Beautiful modal for donation
- `PaymentForm.tsx` - Multi-step payment form
- Responsive design with Tailwind CSS
- Animated transitions with Framer Motion
- Loading states and error handling

### ✅ Backend Endpoints
- `POST /payments/create-intent` - Initialize payment
- `GET /payments/status/{id}` - Check payment status
- `POST /payments/webhook` - Stripe webhook handler

---

## 🔐 Security Features

1. **PCI Compliance**
   - Card data never touches your server
   - Stripe handles all sensitive information
   - Payment Element uses Stripe's secure iframe

2. **httpOnly Cookies**
   - JWT tokens in httpOnly cookies (XSS protection)
   - Automatic CSRF token management

3. **Webhook Signature Verification**
   - All Stripe webhooks are verified
   - Prevents webhook spoofing attacks

4. **Amount Validation**
   - Minimum $1.00 donation
   - Server-side amount verification

---

## 📝 Usage Example

### Integrate Donation Button in Your App

```tsx
import { useState } from 'react';
import { DonationModal } from '@/components/DonationModal';

function CrisisCard({ crisis }) {
  const [donationOpen, setDonationOpen] = useState(false);

  return (
    <div>
      <h3>{crisis.title}</h3>
      <button onClick={() => setDonationOpen(true)}>
        Donate Now
      </button>

      <DonationModal
        isOpen={donationOpen}
        onClose={() => setDonationOpen(false)}
        crisisId={crisis.id}
        crisisTitle={crisis.title}
      />
    </div>
  );
}
```

---

## 🧪 Testing

### Test Card Numbers (Stripe Test Mode)

| Card Number | Scenario | CVC | Date |
|-------------|----------|-----|------|
| 4242 4242 4242 4242 | Success | Any 3 digits | Any future date |
| 4000 0027 6000 3184 | 3D Secure required | Any 3 digits | Any future date |
| 4000 0000 0000 0002 | Card declined | Any 3 digits | Any future date |
| 4000 0000 0000 9995 | Insufficient funds | Any 3 digits | Any future date |

### Test the Payment Flow

1. Click "Donate" button on any crisis
2. Select amount ($50 recommended for testing)
3. Fill in optional name/email
4. Click "Donate $50"
5. Enter test card: `4242 4242 4242 4242`
6. Enter any future expiry (e.g., 12/25)
7. Enter any CVC (e.g., 123)
8. Click "Complete Donation"
9. See success message

---

## 📊 Stripe Dashboard

### View Test Payments
1. Go to https://dashboard.stripe.com/test/payments
2. See all test donations
3. Click any payment to see details:
   - Amount
   - Crisis ID (in metadata)
   - Donor email
   - Payment status

### Monitor Webhooks
1. Go to https://dashboard.stripe.com/test/webhooks
2. See webhook events
3. Debug failed webhooks

---

## 🔔 Webhook Setup (Optional but Recommended)

Webhooks notify your server when payments succeed/fail.

### Using Stripe CLI (Development)

```bash
# Install Stripe CLI
brew install stripe/stripe-brew/stripe

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:8000/payments/webhook

# Copy the webhook secret (whsec_...)
# Add it to backend/.env as STRIPE_WEBHOOK_SECRET
```

### Using Stripe Dashboard (Production)

1. Go to https://dashboard.stripe.com/webhooks
2. Click **Add endpoint**
3. URL: `https://yourdomain.com/payments/webhook`
4. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy webhook secret to `.env`

---

## 🌍 Production Deployment

### 1. Get Live API Keys

1. Complete Stripe account verification
2. Switch to **Live mode** in dashboard
3. Get live keys (start with `pk_live_...` and `sk_live_...`)

### 2. Update Environment Variables

**Frontend `.env`:**
```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_KEY
```

**Backend `.env`:**
```bash
STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_SECRET_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_LIVE_WEBHOOK_SECRET
```

### 3. Enable HTTPS

Update `backend/app/auth.py`:
```python
secure=True,  # Change from False to True
```

### 4. Set Up Webhooks

Create production webhook endpoint pointing to:
```
https://yourdomain.com/payments/webhook
```

---

## 💰 Pricing

### Stripe Fees
- **Card payments:** 2.9% + $0.30 per transaction
- **International cards:** +1% (3.9% total)
- **Currency conversion:** +1%

### Example:
- $100 donation = $97.10 received (after $2.90 fee)
- $50 donation = $48.05 received (after $1.95 fee)
- $10 donation = $9.41 received (after $0.59 fee)

---

## 🐛 Troubleshooting

### "Payment system is not configured"

**Solution:** Add Stripe keys to `.env` files and restart servers.

```bash
# Check frontend .env
cat .env | grep STRIPE

# Check backend .env
cat backend/.env | grep STRIPE

# Restart frontend
npm run dev

# Restart backend
cd backend && source ../.venv/bin/activate && uvicorn app.main:app --reload
```

### "Invalid API Key"

**Solution:** Make sure you're using the correct keys for the environment:
- Test mode: `pk_test_...` and `sk_test_...`
- Live mode: `pk_live_...` and `sk_live_...`

### "Webhook signature verification failed"

**Solution:** 
1. Get correct webhook secret from Stripe Dashboard
2. Update `STRIPE_WEBHOOK_SECRET` in `backend/.env`
3. Restart backend server

### Payment succeeds but not recorded

**Solution:** Check webhook endpoint is accessible:
```bash
# Test webhook endpoint
curl -X POST http://localhost:8000/payments/webhook \
  -H "Content-Type: application/json" \
  -d '{"type": "test"}'
```

---

## 📈 Next Steps

### Recommended Enhancements

1. **Database Integration**
   - Create `donations` table in PostgreSQL
   - Record all successful payments
   - Track donation history per user

2. **Email Receipts**
   - Set up SMTP in backend
   - Send email confirmation after donation
   - Include tax receipt information

3. **Recurring Donations**
   - Implement Stripe Subscriptions
   - Monthly/yearly donation options
   - Subscription management page

4. **Donation Analytics**
   - Dashboard for total donations
   - Crisis-specific donation metrics
   - Top donors leaderboard

5. **Tax Receipts**
   - Generate PDF receipts
   - Annual donation summaries
   - 501(c)(3) compliance (if applicable)

---

## 📚 Additional Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe React Integration](https://stripe.com/docs/stripe-js/react)
- [Testing Stripe](https://stripe.com/docs/testing)
- [Webhook Best Practices](https://stripe.com/docs/webhooks/best-practices)
- [PCI Compliance Guide](https://stripe.com/docs/security/guide)

---

## ✅ Verification Checklist

Before going live:

- [ ] Stripe account fully verified
- [ ] Live API keys configured
- [ ] HTTPS enabled on production
- [ ] Webhooks set up and tested
- [ ] Test donations completed successfully
- [ ] Error handling tested (declined cards, etc.)
- [ ] Email receipts configured (optional)
- [ ] Legal compliance checked (terms, privacy policy)
- [ ] Donation amounts validated server-side
- [ ] Security audit completed

---

## 🆘 Support

If you need help with Stripe integration:

1. **Stripe Support:** https://support.stripe.com
2. **Stripe Discord:** https://stripe.com/discord
3. **Documentation:** https://stripe.com/docs

For Sankat-specific issues:
- Check GitHub issues
- Review logs in browser console
- Check backend logs for errors

---

**Last Updated:** 2025-12-03  
**Version:** 1.0.0  
**Payment Provider:** Stripe
