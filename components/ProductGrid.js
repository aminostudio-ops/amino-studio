'use client';

import Link from 'next/link';
import { useCart } from './CartProvider';

export default function ProductGrid({ products }) {
  const { items, setQty, totalItems, hydrated } = useCart();

  return (
    <>
      <div className="grid">
        {products.map((p) => {
          const qty = items[p.id] || 0;
          return (
            <div className="card" key={p.id}>
              <div className="thumb">
                {p.image ? <img src={p.image} alt={p.name} /> : 'Amino Studio'}
              </div>
              <h3>{p.name}</h3>
              <div className="desc">{p.description}</div>
              <div className="price">₱{p.price.toLocaleString()}</div>
              <div className="qty-row">
                <div className="stepper">
                  <button type="button" onClick={() => setQty(p.id, Math.max(0, qty - 1))} aria-label="Decrease quantity">
                    −
                  </button>
                  <span>{qty}</span>
                  <button type="button" onClick={() => setQty(p.id, qty + 1)} aria-label="Increase quantity">
                    +
                  </button>
                </div>
                <button className="btn" type="button" onClick={() => setQty(p.id, qty === 0 ? 1 : qty)}>
                  {qty > 0 ? 'In cart' : 'Add'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {hydrated && totalItems > 0 && (
        <Link href="/checkout" className="cartbar">
          <span>Go to checkout</span>
          <span className="count">{totalItems}</span>
        </Link>
      )}
    </>
  );
}
