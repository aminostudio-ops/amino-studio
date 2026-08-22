import { products } from '../lib/products';
import ProductGrid from '../components/ProductGrid';
import LockButton from '../components/LockButton';

export default function HomePage() {
  return (
    <div className="container">
      <div className="topbar">
        <div className="brand">
          Amino Studio
          <small>Shop</small>
        </div>
        <LockButton />
      </div>

      <h2 style={{ fontSize: 22, marginBottom: 4 }}>Available items</h2>
      <p style={{ color: 'var(--ink-soft)', fontSize: 13, marginTop: 4 }}>
        Add items to your cart, then head to checkout.
      </p>

      <ProductGrid products={products} />
    </div>
  );
}
