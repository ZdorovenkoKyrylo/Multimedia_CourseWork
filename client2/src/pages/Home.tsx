// src/pages/Home.tsx
import React, { useState, useEffect, useRef } from 'react';
import ProductCard from '../components/ProductCard';
import Assistant3D from '../components/Assistant3D';
import { Product } from '../types/Product';
import { productAPI, orderAPI, reviewAPI, assistantAPI, userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import AssistantAudioRecorder from '../components/AssistantAudioRecorder';
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
  const { user, logout, setUser } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price'>('name');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [assistantQuery, setAssistantQuery] = useState('');
  const [assistantResponse, setAssistantResponse] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isConfused, setIsConfused] = useState(false);
  const [isTalking, setIsTalking] = useState(false);
  const [isReacting, setIsReacting] = useState(false);
  const [reactionType, setReactionType] = useState<'approval' | 'shoulders' | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [productReviews, setProductReviews] = useState<{[key: string]: any[]}>({});
  const confusedTimerRef = useRef<number | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const reactingTimerRef = useRef<number | null>(null);

  // Reusable function to fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productAPI.getAll();
      setProducts(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Using local data.');
      // Fallback to sample data if API fails
      setProducts([
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
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Load products from API on mount
  useEffect(() => {
    fetchProducts();
  }, []);

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

  const openProductDetails = async (product: Product) => {
    setSelectedProduct(product);
    // Fetch reviews for this product
    try {
      const reviews = await reviewAPI.getAll({ productId: product._id });
      setProductReviews(prev => ({ ...prev, [product._id]: reviews }));
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  };
  const closeProductDetails = () => setSelectedProduct(null);


  // Find the user's completed order for a product
  const getOrderIdForProduct = async (productId: string): Promise<string | null> => {
    if (!user) return null;
    try {
      // Fetch all orders for the user (optionally filter by status if available)
      const orders = await orderAPI.getAll({ userId: user._id });
      // Find an order that contains the productId
      const foundOrder = (orders || []).find((order: any) => {
        return Array.isArray(order.items) && order.items.some((item: any) => {
          const itemProductId = item.product?.id || item.product?._id || item.product;
          return itemProductId === productId;
        });
      });
      return foundOrder ? foundOrder._id : null;
    } catch (err) {
      console.error('Error fetching user orders:', err);
      return null;
    }
  };

  const addReview = async (productId: string, review: Review) => {
    if (!user) {
      alert('Please login to add a review');
      return;
    }
    // Get orderId for this product (should be from user's completed orders)
    const orderId = await getOrderIdForProduct(productId);
    if (!orderId) {
      alert('You must have purchased this product to leave a review.');
      return;
    }
    try {
      await reviewAPI.create({
        productId,
        orderId,
        userId: user._id,
        rating: review.rating,
        comment: review.comment,
      });
      // Refresh reviews for this product
      const updatedReviews = await reviewAPI.getAll({ productId });
      setProductReviews(prev => ({ ...prev, [productId]: updatedReviews }));
      // Refetch products to get updated data
      await fetchProducts();
      alert('Review submitted successfully!');
    } catch (err) {
      console.error('Error creating review:', err);
      alert('Failed to submit review. Please try again.');
    }
  };

  const totalCartItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  

  // Unified handler for both text and audio assistant responses
  const handleAssistantResponse = (response: any) => {
    // Clear any pending timers or audio from previous responses
    if (confusedTimerRef.current) {
      clearTimeout(confusedTimerRef.current);
      confusedTimerRef.current = null;
    }
    if (reactingTimerRef.current) {
      clearTimeout(reactingTimerRef.current);
      reactingTimerRef.current = null;
    }
    if (currentAudioRef.current) {
      try {
        currentAudioRef.current.pause();
        currentAudioRef.current.onended = null;
        currentAudioRef.current.onerror = null;
      } catch (e) {
        /* ignore */
      }
      currentAudioRef.current = null;
    }
    // reset visuals before handling new response
    setIsTalking(false);
    setIsConfused(false);
    setIsReacting(false);
    setReactionType(null);
    setAssistantResponse(`Action: ${response.action || ''}`);

    const hasAudio = response.audio && typeof response.audio === 'string' && response.audio.startsWith('data:audio');
    

    // Handle actions (perform state changes immediately, but sequence visuals/audio below)
    switch (response.action) {
      case 'show_cart':
        setIsCartOpen(true);
        setAssistantResponse('Opening cart...');
        break;
      case 'sort_and_filter':
        if (response.params?.sortBy === 'price') {
          setSortBy('price');
          setAssistantResponse('Sorted by price');
        }
        if (response.params?.sortBy === 'name') {
          setSortBy('name');
          setAssistantResponse('Sorted by name');
        }
        if (response.params?.filter?.price?.lt) {
          setMaxPrice(response.params.filter.price.lt);
          setAssistantResponse(`Filtering products under $${response.params.filter.price.lt}`);
        }
        if (response.params?.filter?.category) {
          setFilter(response.params.filter.category);
          setAssistantResponse(`Filtering products: ${response.params.filter.category}`);
        }
        if (response.params?.filter?.search) {
          setFilter(response.params.filter.search);
          setAssistantResponse(`Searching for: ${response.params.filter.search}`);
        }
        break;
      case 'unknown':
        setAssistantResponse("Sorry, I didn't understand that command");
        // Show shoulders reaction for 1 second, then show confused animation for 3 seconds
        setIsReacting(true);
        setReactionType('shoulders');
        reactingTimerRef.current = window.setTimeout(() => {
          setIsReacting(false);
          setReactionType(null);
          setIsConfused(true);
          
          confusedTimerRef.current = window.setTimeout(() => {
            setIsConfused(false);
            confusedTimerRef.current = null;
          }, 3000);
          
          reactingTimerRef.current = null;
        }, 1000);
        break;
      default:
        if (response.action) {
          setAssistantResponse(`Command received: ${response.action}`);
        }
    }

    // If there's audio to play and the action was not 'unknown', show approval reaction for 1 second, then play audio and show talking
    if (hasAudio && response.action !== 'unknown') {
      setIsReacting(true);
      setReactionType('approval');
      
      reactingTimerRef.current = window.setTimeout(() => {
        setIsReacting(false);
        setReactionType(null);
        setIsTalking(true);
        
        const audio = new Audio(response.audio);
        currentAudioRef.current = audio;
        audio.play().catch((e) => {
          console.error('Audio playback error', e);
          setIsTalking(false);
          currentAudioRef.current = null;
        });
        audio.onended = () => {
          setIsTalking(false);
          currentAudioRef.current = null;
        };
        audio.onerror = () => {
          setIsTalking(false);
          currentAudioRef.current = null;
        };
        
        reactingTimerRef.current = null;
      }, 1000);
    }
  };

  const handleAssistantQuery = async () => {
    if (!assistantQuery.trim()) {
      setAssistantResponse('Please enter a query');
      return;
    }
    try {
      const response = await assistantAPI.query(assistantQuery);
      handleAssistantResponse(response);
    } catch (err) {
      console.error('Assistant query error:', err);
      setAssistantResponse('Failed to process query');
    }
  };

  return (
    <div className="main-container">
      {loading && <div style={{ textAlign: 'center', padding: '20px' }}>Loading products...</div>}
      {error && <div style={{ color: 'orange', textAlign: 'center', padding: '10px' }}>{error}</div>}
      
      {/* Right panel */}
      <div className="right-panel">
        <div className="assistant-panel">
          <h3>Assistant Panel</h3>
          <textarea 
            placeholder="Type your message..." 
            value={assistantQuery}
            onChange={(e) => setAssistantQuery(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAssistantQuery();
              }
            }}
          />
          <button onClick={handleAssistantQuery}>Send to Assistant</button>
            {/* Voice Recorder */}
            <AssistantAudioRecorder
              isRecording={isRecording}
              onRecordingChange={setIsRecording}
              onAssistantResult={({ response }) => handleAssistantResponse(response)}
            />
          {assistantResponse && (
            <div style={{ 
              marginTop: '10px', 
              padding: '10px', 
              backgroundColor: '#e7f3ff', 
              borderRadius: '5px',
              fontSize: '14px'
            }}>
              {assistantResponse}
            </div>
          )}
        </div>
        <div className="assistant-placeholder">
          <Assistant3D isRecording={isRecording} isConfused={isConfused} isTalking={isTalking} isReacting={isReacting} reactionType={reactionType}/>
        </div>
      </div>

      {/* Left area */}
      <div className="left-area">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>Appliance Store</h1>
          {user && (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span 
                onClick={() => setIsProfileOpen(true)}
                style={{ 
                  cursor: 'pointer', 
                  textDecoration: 'underline',
                  color: '#007bff'
                }}
                title="Click to edit profile"
              >
                Welcome, {user.email}
              </span>
              <button 
                onClick={() => {
                  if (window.confirm('Are you sure you want to logout?')) {
                    logout();
                    window.location.href = '/login';
                  }
                }}
                style={{ padding: '5px 15px' }}
              >
                Logout
              </button>
            </div>
          )}
        </div>

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
          <button
            onClick={() => {
              setFilter('');
              setMinPrice('');
              setMaxPrice('');
              setSortBy('name');
            }}
            style={{
              padding: '8px 15px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              marginLeft: '10px'
            }}
          >
            Clear Filters
          </button>
        </div>
        <div style={{ marginBottom: '10px', color: '#666' }}>
          Showing {displayedProducts.length} of {products.length} products
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
                onClick={async () => {
                  if (!user) {
                    alert('Please login to place an order');
                    return;
                  }
                  
                  try {
                    await orderAPI.create({
                      user: user._id,
                      items: cart.map(item => ({
                        product: item.product._id,
                        quantity: item.quantity,
                      })),
                      shippingAddress: '123 Main St', // Should be collected from user
                    });
                    
                    alert('Payment successful! Order completed.');
                    setCart([]);
                    setIsPaymentOpen(false);
                    setIsCartOpen(false);
                    // Refetch products to update stock quantities
                    await fetchProducts();
                  } catch (err) {
                    console.error('Error creating order:', err);
                    alert('Failed to complete order. Please try again.');
                  }
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

              {!productReviews[selectedProduct._id] || productReviews[selectedProduct._id].length === 0 ? (
                <p>No reviews yet</p>
              ) : (
                <ul>
                  {productReviews[selectedProduct._id]?.map((r: any, idx: number) => (
                    <li key={idx}>
                      <strong>{r.user?.firstName || r.user?.lastName ? `${r.user.firstName} ${r.user.lastName}` : 'Anonymous'}</strong> - {r.rating}⭐: {r.comment}
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

        {/* Profile Edit Modal */}
        {isProfileOpen && user && (
          <ProfileEditModal
            user={user}
            onClose={() => setIsProfileOpen(false)}
            onUpdate={(updatedUser) => {
              setUser(updatedUser);
              setIsProfileOpen(false);
            }}
          />
        )}
      </div>
    </div>
  );
};

// ---------------- ProfileEditModal ----------------
interface ProfileEditModalProps {
  user: any;
  onClose: () => void;
  onUpdate: (user: any) => void;
}

const ProfileEditModal: React.FC<ProfileEditModalProps> = ({ user, onClose, onUpdate }) => {
  const [email, setEmail] = useState(user.email || '');
  const [firstName, setFirstName] = useState(user.firstName || '');
  const [lastName, setLastName] = useState(user.lastName || '');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const updateData: any = {
        email,
        firstName,
        lastName,
      };
      // Only include password if it's being changed
      if (password.trim()) {
        updateData.password = password;
      }
      const updatedUser = await userAPI.update(user._id, updateData);
      alert('Profile updated successfully!');
      onUpdate(updatedUser);
    } catch (err: any) {
      console.error('Update profile error:', err);
      alert(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="product-modal" onClick={onClose}>
      <div className="product-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        <button className="close-button" onClick={onClose}>×</button>
        <h2>Edit Profile</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '14px',
                border: '1px solid #ccc',
                borderRadius: '5px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>First Name:</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '14px',
                border: '1px solid #ccc',
                borderRadius: '5px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Last Name:</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '14px',
                border: '1px solid #ccc',
                borderRadius: '5px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>New Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave blank to keep current password"
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '14px',
                border: '1px solid #ccc',
                borderRadius: '5px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button
              onClick={handleSave}
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                fontSize: '16px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.6 : 1
              }}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={onClose}
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                fontSize: '16px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.6 : 1
              }}
            >
              Cancel
            </button>
          </div>
        </div>
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
