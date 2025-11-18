// src/pages/Home.tsx
import React, { useState } from 'react';
import ProductCard from '../components/ProductCard';
import { Product } from '../types/Product';
import '../styles/home.css';

interface CartItem {
  product: Product;
  quantity: number;
}

interface Review {
  userName: string;
  rating: number;
  comment: string;
}

const Home: React.FC = () => {
  const initialProducts: Product[] = [
    {
      _id: '1',
      name: 'Washing Machine',
      description: 'High-efficiency washing machine',
      price: 499.99,
      category: 'Box',
      stockQuantity: 5,
      images: ['/images/washing-machine.jpg'],
      specs: { brand: 'Samsung', capacity: '7kg', color: 'white' },
      reviews: [] as Review[],
    },
    {
      _id: '2',
      name: 'Refrigerator',
      description: 'Double-door fridge',
      price: 799.99,
      category: 'Appliances',
      stockQuantity: 3,
      images: ['https://via.placeholder.com/200x150'],
      specs: { brand: 'LG', capacity: '350L', color: 'silver' },
      reviews: [] as Review[],
    },
    {
      _id: '3',
      name: 'Microwave Oven',
      description: 'Compact microwave oven',
      price: 199.99,
      category: 'Appliances',
      stockQuantity: 10,
      images: ['https://via.placeholder.com/200x150'],
      specs: { brand: 'Panasonic', capacity: '20L', color: 'black' },
      reviews: [] as Review[],
    },
  ];

  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price'>('name');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const cartTotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const toggleCart = () => setIsCartOpen((prev) => !prev);

  const filterText = filter.trim().toLowerCase();

  const displayedProducts = products
    .filter(
      (p) =>
        (p.name.toLowerCase().includes(filterText) ||
          p.category.toLowerCase().includes(filterText)) &&
        (minPrice === '' || p.price >= minPrice) &&
        (maxPrice === '' || p.price <= maxPrice)
    )
    .sort((a, b) => (sortBy === 'name' ? a.name.localeCompare(b.name) : a.price - b.price));

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product._id === product._id);
      if (existing) {
        if (existing.quantity < product.stockQuantity) {
          return prev.map((item) =>
            item.product._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
          );
        }
        return prev;
      } else {
        return [...prev, { product, quantity: 1 }];
      }
    });
  };

  const openProductDetails = (product: Product) => setSelectedProduct(product);
  const closeProductDetails = () => setSelectedProduct(null);

  const addReview = (productId: string, review: Review) => {
    setProducts((prev) =>
      prev.map((p) =>
        p._id === productId ? { ...p, reviews: [review, ...(p.reviews || [])] } : p
      )
    );
  };

  const totalCartItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="main-container">
      {/* Right panel */}
      <div className="right-panel">
        <div className="assistant-panel">
          <h3>Assistant Panel</h3>
          <textarea placeholder="Type your message..." />
          <button>Get User Input</button>
          <button>Send to Assistant</button>
        </div>
        <div className="assistant-placeholder">
          <p>3D Assistant Placeholder</p>
        </div>
      </div>

      {/* Left area */}
      <div className="left-area">
        <h1>Appliance Store</h1>

        {/* Search & filters */}
        <div className="search-filter-container">
          <input
            type="text"
            placeholder="Search products..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'name' | 'price')}>
            <option value="name">Sort by name</option>
            <option value="price">Sort by price</option>
          </select>
          <input
            type="number"
            placeholder="Min Price"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value === '' ? '' : Number(e.target.value))}
          />
          <input
            type="number"
            placeholder="Max Price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value === '' ? '' : Number(e.target.value))}
          />
        </div>

        {/* Products */}
        <div className="products-container">
          {displayedProducts.map((product) => {
            const quantityInCart =
              cart.find((item) => item.product._id === product._id)?.quantity || 0;
            return (
              <div className="product-wrapper" key={product._id}>
                <ProductCard product={product} onClick={openProductDetails} />
                <button
                  onClick={() => addToCart(product)}
                  disabled={quantityInCart >= product.stockQuantity}
                >
                  Add to cart ({quantityInCart})
                </button>
              </div>
            );
          })}
        </div>

        {/* Cart toggle */}
        <button className="cart-toggle-button" onClick={toggleCart}>
          Cart ({totalCartItems})
        </button>

        {/* Cart panel */}
        {isCartOpen && (
          <div className="cart-panel">
            <h2>Your Cart</h2>
            {cart.length === 0 ? (
              <p>Cart is empty</p>
            ) : (
              <>
                <ul>
                  {cart.map((item) => (
                    <li key={item.product._id} style={{ marginBottom: '10px' }}>
                      <span
                        style={{ cursor: 'pointer', textDecoration: 'underline' }}
                        onClick={() => openProductDetails(item.product)}
                      >
                        {item.product.name}
                      </span>{' '}
                      - ${item.product.price.toFixed(2)} × {item.quantity}
                    </li>
                  ))}
                </ul>
                <p>
                  <strong>Total:</strong> ${cartTotal.toFixed(2)}
                </p>
                <button className="clear-cart-btn" onClick={() => setCart([])}>
                  Clear Cart
                </button>
                <button className="pay-btn" onClick={() => setIsPaymentOpen(true)}>
                  Finish Order
                </button>
              </>
            )}
          </div>
        )}

        {/* Payment modal */}
        {isPaymentOpen && (
          <div className="payment-modal" onClick={() => setIsPaymentOpen(false)}>
            <div className="payment-modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Confirm Payment</h2>
              <p>Total Amount: ${cartTotal.toFixed(2)}</p>
              <button
                className="pay-btn"
                onClick={() => {
                  alert('Payment successful! Order completed.');
                  setCart([]);
                  setIsPaymentOpen(false);
                  setIsCartOpen(false);
                }}
              >
                Pay Now
              </button>
              <button className="cancel-btn" onClick={() => setIsPaymentOpen(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Product modal */}
        {selectedProduct && (
          <div className="product-modal" onClick={closeProductDetails}>
            <div className="product-modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>{selectedProduct.name}</h2>
              <img
                src={selectedProduct.images?.[0] || 'https://via.placeholder.com/200x150'}
                alt={selectedProduct.name}
              />
              <p>{selectedProduct.description}</p>
              <p>Category: {selectedProduct.category}</p>
              <p>Price: ${selectedProduct.price.toFixed(2)}</p>
              <p>Stock: {selectedProduct.stockQuantity}</p>
              <p>Specifications:</p>
              <ul>
                {Object.entries(selectedProduct.specs || {}).map(([key, value]) => (
                  <li key={key}>
                    {key}: {String(value)}
                  </li>
                ))}
              </ul>

              <hr />
              <h3>Reviews</h3>
              <AddReviewForm
                product={selectedProduct}
                onAdd={(review) => addReview(selectedProduct._id, review)}
              />

              {selectedProduct.reviews?.length === 0 ? (
                <p>No reviews yet</p>
              ) : (
                <ul>
                  {selectedProduct.reviews?.map((r, idx) => (
                    <li key={idx}>
                      <strong>{r.userName}</strong> - {r.rating}⭐: {r.comment}
                    </li>
                  ))}
                </ul>
              )}

              <button className="cancel-btn" onClick={closeProductDetails}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ---------------- AddReviewForm ----------------
interface AddReviewFormProps {
  product: Product;
  onAdd: (review: Review) => void;
}

const AddReviewForm: React.FC<AddReviewFormProps> = ({ product, onAdd }) => {
  const [userName, setUserName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const submit = () => {
    if (!userName || !comment) return alert('Please enter your name and comment');
    onAdd({ userName, rating, comment });
    setUserName('');
    setComment('');
    setRating(5);
  };

  return (
    <div className="add-review-form">
      <h4>Add Review</h4>
      <input
        placeholder="Your Name"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
      />
      <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
        {[5, 4, 3, 2, 1].map((r) => (
          <option key={r} value={r}>
            {r}⭐
          </option>
        ))}
      </select>
      <textarea
        placeholder="Comment"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
      />
      <button onClick={submit}>Submit Review</button>
    </div>
  );
};

export default Home;
