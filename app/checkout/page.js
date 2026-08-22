'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useCart } from '../../components/CartProvider';
import { products } from '../../lib/products';
import { ADMIN_FEE, SHIPPING_RATES, getShippingFee } from '../../lib/shipping';

export default function CheckoutPage() {
  const { items, clearCart, hydrated } = useCart();
  const [locationId, setLocationId] = useState(SHIPPING_RATES[0].id);
  const [form, setForm] = useState({
    name: '',
    email: '',
    address: '',
    telegram: '',
    contact: '',
  });
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const cartItems = useMemo(() => {
    return Object.entries(items)
      .map(([id, qty]) => {
        const product = products.find((p) => p.id === id);
        if (!product) return null;
        return { ...product, qty, lineTotal: product.price * qty };
      })
      .filter(Boolean);
  }, [items]);

  const subtotal = cartItems.reduce((sum, i) => sum + i.lineTotal, 0);
  const shippingFee = getShippingFee(locationId);
  const total = subtotal + ADMIN_FEE + shippingFee;

  function updateField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (cartItems.length === 0) {
      setError('Your cart is empty.');
      return;
    }
    if (!file) {
      setError('Please upload a screenshot of your payment.');
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('email', form.email);
      fd.append('address', form.address);
      fd.append('telegram', form.telegram);
      fd.append('contact', form.contact);
      fd.append('locationLabel', SHIPPING_RATES.find((r) => r.id === locationId)?.label || '');
      fd.append('shippingFee', String(shippingFee));
      fd.append('adminFee', String(ADMIN_FEE));
      fd.append('subtotal', String(subtotal));
      fd.append('total', String(total));
      fd.append(
        'items',
        JSON.stringify(cartItems.map((i) => ({ name: i.name, qty: i.qty, price: i.price })))
      );
      fd.append('screenshot', file);

      const res = await fetch('/api/checkout', { method: 'POST', body: fd });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Something went wrong. Please try again.');
      }

      clearCart();
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="container">
        <div className="thankyou">
          <h1>Thank you!</h1>
          <p style={{ color: 'var(--ink-soft)', marginTop: 8 }}>
            Your order and payment screenshot were received. Amino Studio will confirm with you shortly.
          </p>
          <Link href="/" className="btn" style={{ display: 'inline-block', marginTop: 20, textDecoration: 'none' }}>
            Back to shop
          </Link>
        </div>
      </div>
    );
  }

  if (hydrated && cartItems.length === 0) {
    return (
      <div className="container">
        <div className="thankyou">
          <h1 style={{ fontSize: 26 }}>Your cart is empty</h1>
          <Link href="/" className="btn" style={{ display: 'inline-block', marginTop: 20, textDecoration: 'none' }}>
            Browse items
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="topbar">
        <div className="brand">
          Amino Studio
          <small>Checkout</small>
        </div>
        <Link href="/" className="pill-link">← Back to shop</Link>
      </div>

      <div className="checkout-layout">
        <form className="form-card" onSubmit={handleSubmit}>
          <div className="section-title">Your details</div>

          <div className="field">
            <label>Full name</label>
            <input required value={form.name} onChange={(e) => updateField('name', e.target.value)} />
          </div>
          <div className="field">
            <label>Email address</label>
            <input required type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} />
          </div>
          <div className="field">
            <label>Shipping address</label>
            <textarea required rows={3} value={form.address} onChange={(e) => updateField('address', e.target.value)} />
          </div>
          <div className="field">
            <label>Telegram username</label>
            <input required placeholder="@username" value={form.telegram} onChange={(e) => updateField('telegram', e.target.value)} />
          </div>
          <div className="field">
            <label>Contact number</label>
            <input required value={form.contact} onChange={(e) => updateField('contact', e.target.value)} />
          </div>
          <div className="field">
            <label>Shipping location</label>
            <select value={locationId} onChange={(e) => setLocationId(e.target.value)}>
              {SHIPPING_RATES.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label} — ₱{r.fee}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Screenshot of payment</label>
            <div className="file-drop">
              <input
                required
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              {file && <div style={{ marginTop: 8 }}>Selected: {file.name}</div>}
            </div>
          </div>

          {error && <div className="error">{error}</div>}

          <div style={{ marginTop: 20 }}>
            <button className="btn" type="submit" disabled={submitting} style={{ width: '100%' }}>
              {submitting ? 'Submitting…' : `Submit order — ₱${total.toLocaleString()}`}
            </button>
          </div>
        </form>

        <div className="receipt">
          <div className="section-title">Order summary</div>
          {cartItems.map((i) => (
            <div className="receipt-row item" key={i.id}>
              <span>{i.name} × {i.qty}</span>
              <span>₱{i.lineTotal.toLocaleString()}</span>
            </div>
          ))}
          <hr className="receipt-divider" />
          <div className="receipt-row">
            <span>Subtotal</span>
            <span>₱{subtotal.toLocaleString()}</span>
          </div>
          <div className="receipt-row">
            <span>Admin fee</span>
            <span>₱{ADMIN_FEE.toLocaleString()}</span>
          </div>
          <div className="receipt-row">
            <span>Shipping ({SHIPPING_RATES.find((r) => r.id === locationId)?.label})</span>
            <span>₱{shippingFee.toLocaleString()}</span>
          </div>
          <div className="perforation" />
          <div className="receipt-total">
            <span>Total</span>
            <span>₱{total.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
