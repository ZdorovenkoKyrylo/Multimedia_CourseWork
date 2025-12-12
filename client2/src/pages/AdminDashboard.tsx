import React, { useState, useEffect } from 'react';
import { Product } from '../types/Product';
import { Order, OrderStatus, OrderItem } from '../types/Order';
import { User, UserRole } from '../types/User';
import { CartItem } from '../types/CartItem';
import { productAPI, orderAPI, userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const AdminDashboard: React.FC = () => {
  const { user: currentUser, setUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'users'>('products');
  const [loading, setLoading] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // ---------------- Products ----------------
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Load products from API
  useEffect(() => {
    if (activeTab === 'products') {
      loadProducts();
    }
  }, [activeTab]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productAPI.getAll();
      setProducts(data);
    } catch (err) {
      console.error('Error loading products:', err);
      alert('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const addProduct = () => {
    setEditingProduct({
      _id: '',
      name: '',
      price: 0,
      category: '',
      description: '',
      stockQuantity: 0,
      images: [],
      specs: {}
    } as Product);
    setEditingOrder(null);
    setEditingUser(null);
    setModalOpen(true);
  };

  const saveProduct = async () => {
    if (!editingProduct) return;
    try {
      const { _id, ...productData } = editingProduct;
      if (_id && _id.length > 0) {
        // Update existing product - exclude _id from payload
        const updatedProduct = await productAPI.update(_id, productData);
        console.log('Updated product from API:', updatedProduct);
        setProducts(products.map(p => (p._id === _id ? updatedProduct : p)));
      } else {
        // Create new product - _id already excluded
        console.log('Creating product with data:', productData);
        const newProduct = await productAPI.create(productData);
        console.log('New product from API:', newProduct);
        setProducts([...products, newProduct]);
      }
      setModalOpen(false);
    } catch (err) {
      console.error('Error saving product:', err);
      alert('Failed to save product');
    }
  };

  const deleteProduct = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await productAPI.delete(id);
      setProducts(products.filter(p => p._id !== id));
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Failed to delete product');
    }
  };

  const openEditProductModal = (product: Product) => {
    console.log('Opening edit modal for product:', product);
    console.log('Product _id:', product._id, 'Type:', typeof product._id, 'Length:', product._id?.length);
    setEditingProduct({ 
      ...product,
      images: product.images || [],
      specs: product.specs || {}
    });
    setEditingOrder(null);
    setEditingUser(null);
    setModalOpen(true);
  };

  // ---------------- Orders ----------------
  const [orders, setOrders] = useState<Order[]>([]);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  // Load orders from API
  useEffect(() => {
    if (activeTab === 'orders') {
      loadOrders();
    }
  }, [activeTab]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await orderAPI.getAll();
      setOrders(data);
    } catch (err) {
      console.error('Error loading orders:', err);
      alert('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const addOrder = () => {
    setEditingOrder({
      _id: '',
      userId: '',
      items: [],
      shippingAddress: '',
      status: OrderStatus.PENDING,
      orderDate: new Date()
    } as Order);
    setEditingProduct(null);
    setEditingUser(null);
    setModalOpen(true);
  };

  const saveOrder = async () => {
    if (!editingOrder) return;
    try {
      const orderId = editingOrder._id;
      if (orderId && orderId.length > 0) {
        // Update existing order - only send status
        const updatedOrder = await orderAPI.update(orderId, { status: editingOrder.status });
        setOrders(orders.map(o => (o._id === orderId ? updatedOrder : o)));
      } else {
        // Create new order - don't include _id or orderDate
        const newOrder = await orderAPI.create({
          user: editingOrder.userId,
          items: editingOrder.items.map(item => ({
            product: item.product?._id || '',
            quantity: item.quantity
          })),
          shippingAddress: editingOrder.shippingAddress,
          status: editingOrder.status
        });
        setOrders([...orders, newOrder]);
      }
      setModalOpen(false);
    } catch (err) {
      console.error('Error saving order:', err);
      alert('Failed to save order');
    }
  };

  const deleteOrder = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return;
    try {
      await orderAPI.delete(id);
      setOrders(orders.filter(o => o._id !== id));
    } catch (err) {
      console.error('Error deleting order:', err);
      alert('Failed to delete order');
    }
  };

  const openEditOrderModal = (order: Order) => {
    setEditingOrder({ ...order });
    setEditingProduct(null);
    setEditingUser(null);
    setModalOpen(true);
  };

  // ---------------- Users ----------------
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Load users from API
  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    }
  }, [activeTab]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userAPI.getAll();
      setUsers(data);
    } catch (err) {
      console.error('Error loading users:', err);
      alert('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const addUser = () => {
    setEditingUser({
      _id: '',
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      role: UserRole.USER,
      cart: [],
      orders: []
    } as User);
    setEditingProduct(null);
    setEditingOrder(null);
    setModalOpen(true);
  };

  const saveUser = async () => {
    if (!editingUser) return;
    try {
      const userId = editingUser._id;
      if (userId && userId.length > 0) {
        // Update existing user - don't include _id, password, cart, or orders
        const updatedUser = await userAPI.update(userId, {
          email: editingUser.email,
          firstName: editingUser.firstName,
          lastName: editingUser.lastName,
          role: editingUser.role,
        });
        setUsers(users.map(u => (u._id === userId ? updatedUser : u)));
      } else {
        // Create new user - don't include _id, cart, or orders
        if (!editingUser.password) {
          alert('Password is required for new users');
          return;
        }
        const newUser = await userAPI.create({
          email: editingUser.email,
          password: editingUser.password,
          firstName: editingUser.firstName,
          lastName: editingUser.lastName,
          role: editingUser.role,
        });
        setUsers([...users, newUser]);
      }
      setModalOpen(false);
    } catch (err) {
      console.error('Error saving user:', err);
      alert('Failed to save user');
    }
  };

  const deleteUser = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await userAPI.delete(id);
      setUsers(users.filter(u => u._id !== id));
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Failed to delete user');
    }
  };

  const openEditUserModal = (user: User) => {
    setEditingUser({ ...user });
    setEditingProduct(null);
    setEditingOrder(null);
    setModalOpen(true);
  };

  // ---------------- Modal Control ----------------
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Admin Dashboard</h1>
        {currentUser && (
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
              Admin: {currentUser.email}
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
      {loading && <div style={{ textAlign: 'center', padding: '10px', color: '#666' }}>Loading...</div>}

      {/* Tabs */}
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => setActiveTab('products')}>Products</button>
        <button onClick={() => setActiveTab('orders')} style={{ marginLeft: '10px' }}>Orders</button>
        <button onClick={() => setActiveTab('users')} style={{ marginLeft: '10px' }}>Users</button>
      </div>

      <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
        {/* ---------------- Products Tab ---------------- */}
        {activeTab === 'products' && (
          <div>
            <button onClick={addProduct} style={{ padding: '8px 12px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px' }}>Add Product</button>
            <table style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f0f0f0' }}>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Name</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Category</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Price</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product._id}>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{product.name}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{product.category}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>${product.price.toFixed(2)}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                      <button onClick={() => openEditProductModal(product)} style={{ marginRight: '10px' }}>Edit</button>
                      <button onClick={() => deleteProduct(product._id)} style={{ background: 'red', color: 'white' }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ---------------- Orders Tab ---------------- */}
        {activeTab === 'orders' && (
          <div>
            <button onClick={addOrder} style={{ padding: '8px 12px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px' }}>Add Order</button>
            <table style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f0f0f0' }}>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>User</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Status</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Items</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order._id}>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                      {order.user ? `${order.user.email} (${order.user.id})` : order.userId || 'N/A'}
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{order.status}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                      {order.items.map(i => `${i.name} x${i.quantity}`).join(', ')}
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                      <button onClick={() => openEditOrderModal(order)} style={{ marginRight: '10px' }}>Edit</button>
                      <button onClick={() => deleteOrder(order._id)} style={{ background: 'red', color: 'white' }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ---------------- Users Tab ---------------- */}
        {activeTab === 'users' && (
          <div>
            <button onClick={addUser} style={{ padding: '8px 12px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px' }}>Add User</button>
            <table style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f0f0f0' }}>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Email</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Name</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Role</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id}>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{user.email}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{user.firstName} {user.lastName}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{user.role}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                      <button onClick={() => openEditUserModal(user)} style={{ marginRight: '10px' }}>Edit</button>
                      <button onClick={() => deleteUser(user._id)} style={{ background: 'red', color: 'white' }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ---------------- Modal ---------------- */}
      {modalOpen && editingProduct && (() => {
        console.log('Modal rendering - editingProduct._id:', editingProduct._id, 'Type:', typeof editingProduct._id, 'Length:', editingProduct._id?.length);
        return null;
      })()}
      {modalOpen && editingProduct && (
        <div style={modalOverlay}>
          <div style={modalStyle}>
            <h2>{editingProduct._id && editingProduct._id.length > 0 ? 'Edit Product' : 'Add New Product'}</h2>
            {/* Product form here — keep exactly your existing inputs */}
            {/* Name */}
            <label>Name: *</label>
            <input type="text" value={editingProduct.name} onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })} style={{ width: '100%', marginBottom: '10px' }} required />
            {/* Description */}
            <label>Description: *</label>
            <textarea rows={3} value={editingProduct.description} onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })} style={{ width: '100%', marginBottom: '10px' }} required />
            {/* Price */}
            <label>Price: *</label>
            <input type="number" value={editingProduct.price} onChange={e => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })} style={{ width: '100%', marginBottom: '10px' }} required />
            {/* Category */}
            <label>Category: *</label>
            <input type="text" value={editingProduct.category} onChange={e => setEditingProduct({ ...editingProduct, category: e.target.value })} style={{ width: '100%', marginBottom: '10px' }} required />
            {/* Stock */}
            <label>Stock Quantity:</label>
            <input type="number" value={editingProduct.stockQuantity} onChange={e => setEditingProduct({ ...editingProduct, stockQuantity: Number(e.target.value) })} style={{ width: '100%', marginBottom: '20px' }} />
            {/* Images */}
            <h3>Images</h3>
            {editingProduct.images?.map((img, i) => (
              <div key={i} style={{ display: 'flex', marginBottom: '10px' }}>
                <input type="text" value={img} onChange={e => { const newImages = [...editingProduct.images]; newImages[i] = e.target.value; setEditingProduct({ ...editingProduct, images: newImages }); }} style={{ flexGrow: 1 }} />
                <button onClick={() => setEditingProduct({ ...editingProduct, images: editingProduct.images.filter((_, idx) => idx !== i) })} style={{ marginLeft: '10px' }}>Delete</button>
              </div>
            ))}
            <button onClick={() => setEditingProduct({ ...editingProduct, images: [...editingProduct.images, ''] })} style={{ marginBottom: '20px' }}>Add Image</button>
            {/* Specs */}
            <h3>Specifications</h3>
            {Object.entries(editingProduct.specs || {}).map(([key, value]) => (
              <div key={key} style={{ display: 'flex', marginBottom: '10px', gap: '10px' }}>
                <input type="text" value={key} readOnly style={{ width: '40%' }} />
                <input type="text" value={value} onChange={e => { const newSpecs = { ...editingProduct.specs }; newSpecs[key] = e.target.value; setEditingProduct({ ...editingProduct, specs: newSpecs }); }} style={{ width: '60%' }} />
              </div>
            ))}
            <button onClick={() => { const key = prompt('Enter new spec name:'); if (!key) return; setEditingProduct({ ...editingProduct, specs: { ...editingProduct.specs, [key]: '' } }); }}>Add Specification</button>

            <br /><br />
            <button onClick={saveProduct} style={{ marginRight: '10px' }}>Save</button>
            <button onClick={() => setModalOpen(false)} style={{ background: 'gray', color: 'white' }}>Cancel</button>
          </div>
        </div>
      )}

      {modalOpen && editingOrder && (
        <div style={modalOverlay}>
          <div style={modalStyle}>
            <h2>{editingOrder._id && editingOrder._id.length > 0 ? 'Edit Order' : 'Add New Order'}</h2>
            {(!editingOrder._id || editingOrder._id.length === 0) && (
              <>
                <label>User ID: *</label>
                <input 
                  type="text" 
                  value={editingOrder.userId} 
                  onChange={e => setEditingOrder({ ...editingOrder, userId: e.target.value })} 
                  style={{ width: '100%', marginBottom: '10px' }}
                  placeholder="Enter user ID"
                  required 
                />
                <label>Shipping Address: *</label>
                <textarea 
                  rows={2} 
                  value={editingOrder.shippingAddress} 
                  onChange={e => setEditingOrder({ ...editingOrder, shippingAddress: e.target.value })} 
                  style={{ width: '100%', marginBottom: '10px' }}
                  placeholder="Enter shipping address"
                  required 
                />
              </>
            )}
            <label>Status:</label>
            <select value={editingOrder.status} onChange={e => setEditingOrder({ ...editingOrder, status: e.target.value as OrderStatus })} style={{ width: '100%', marginBottom: '20px' }}>
              {Object.values(OrderStatus).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <button onClick={saveOrder} style={{ marginRight: '10px' }}>Save</button>
            <button onClick={() => setModalOpen(false)} style={{ background: 'gray', color: 'white' }}>Cancel</button>
          </div>
        </div>
      )}

      {modalOpen && editingUser && (
        <div style={modalOverlay}>
          <div style={modalStyle}>
            <h2>{editingUser._id && editingUser._id.length > 0 ? 'Edit User' : 'Add New User'}</h2>
            <label>Email: *</label>
            <input type="email" value={editingUser.email} onChange={e => setEditingUser({ ...editingUser, email: e.target.value })} style={{ width: '100%', marginBottom: '10px' }} required />
            {(!editingUser._id || editingUser._id.length === 0) && (
              <>
                <label>Password: *</label>
                <input type="password" value={editingUser.password || ''} onChange={e => setEditingUser({ ...editingUser, password: e.target.value })} style={{ width: '100%', marginBottom: '10px' }} placeholder="Enter password" required />
              </>
            )}
            <label>First Name:</label>
            <input type="text" value={editingUser.firstName || ''} onChange={e => setEditingUser({ ...editingUser, firstName: e.target.value })} style={{ width: '100%', marginBottom: '10px' }} />
            <label>Last Name:</label>
            <input type="text" value={editingUser.lastName || ''} onChange={e => setEditingUser({ ...editingUser, lastName: e.target.value })} style={{ width: '100%', marginBottom: '10px' }} />
            <label>Role:</label>
            <select value={editingUser.role} onChange={e => setEditingUser({ ...editingUser, role: e.target.value as UserRole })} style={{ width: '100%', marginBottom: '20px' }}>
              {Object.values(UserRole).map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <button onClick={saveUser} style={{ marginRight: '10px' }}>Save</button>
            <button onClick={() => setModalOpen(false)} style={{ background: 'gray', color: 'white' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Profile Edit Modal */}
      {isProfileOpen && currentUser && (
        <ProfileEditModal
          user={currentUser}
          onClose={() => setIsProfileOpen(false)}
          onUpdate={(updatedUser) => {
            setUser(updatedUser);
            setIsProfileOpen(false);
          }}
        />
      )}

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
    <div style={modalOverlay} onClick={onClose}>
      <div 
        style={{ 
          ...modalStyle, 
          maxWidth: '500px',
          display: 'flex',
          flexDirection: 'column',
          gap: '15px'
        }} 
        onClick={(e) => e.stopPropagation()}
      >
        <h2>Edit Profile</h2>
        
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
  );
};

// ---------------- Styles ----------------
const modalOverlay: React.CSSProperties = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  background: 'rgba(0,0,0,0.5)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 9999
};

const modalStyle: React.CSSProperties = {
  background: 'white',
  padding: '25px',
  width: '600px',
  borderRadius: '12px',
  maxHeight: '80vh',
  overflowY: 'auto'
};

export default AdminDashboard;
