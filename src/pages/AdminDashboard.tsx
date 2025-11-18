import React, { useState } from 'react';
import { Product } from '../types/Product';
import { Order, OrderStatus, OrderItem } from '../types/Order';
import { User, UserRole } from '../types/User';
import { CartItem } from '../types/CartItem';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'users'>('products');

  // ---------------- Products ----------------
  const [products, setProducts] = useState<Product[]>([
    {
      _id: '1',
      name: 'Washing Machine',
      price: 499.99,
      category: 'Appliances',
      description: 'Powerful washing machine',
      stockQuantity: 5,
      images: ['https://via.placeholder.com/200'],
      specs: { color: 'white', warranty: '2 years' }
    },
    {
      _id: '2',
      name: 'Refrigerator',
      price: 799.99,
      category: 'Appliances',
      description: 'Energy-efficient fridge',
      stockQuantity: 3,
      images: ['https://via.placeholder.com/200'],
      specs: { color: 'silver', warranty: '3 years' }
    }
  ]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const addProduct = () => {
    const newProduct: Product = {
      _id: Date.now().toString(),
      name: 'New Product',
      price: 0,
      category: 'Other',
      description: '',
      stockQuantity: 0,
      images: [],
      specs: {}
    };
    setProducts([...products, newProduct]);
  };

  const saveProduct = () => {
    if (!editingProduct) return;
    setProducts(products.map(p => (p._id === editingProduct._id ? editingProduct : p)));
    setModalOpen(false);
  };

  const deleteProduct = (id: string) => setProducts(products.filter(p => p._id !== id));

  const openEditProductModal = (product: Product) => {
    setEditingProduct({ ...product });
    setEditingOrder(null);
    setEditingUser(null);
    setModalOpen(true);
  };

  // ---------------- Orders ----------------
  const [orders, setOrders] = useState<Order[]>([
    {
      _id: 'o1',
      userId: 'u1',
      items: [
        { product: products[0], name: products[0].name, price: products[0].price, quantity: 1 }
      ],
      shippingAddress: '123 Main St',
      status: OrderStatus.PENDING,
      orderDate: new Date(),
    }
  ]);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  const addOrder = () => {
    const newOrder: Order = {
      _id: Date.now().toString(),
      userId: '',
      items: [],
      shippingAddress: '',
      status: OrderStatus.PENDING,
      orderDate: new Date()
    };
    setOrders([...orders, newOrder]);
  };

  const saveOrder = () => {
    if (!editingOrder) return;
    setOrders(orders.map(o => (o._id === editingOrder._id ? editingOrder : o)));
    setModalOpen(false);
  };

  const deleteOrder = (id: string) => setOrders(orders.filter(o => o._id !== id));

  const openEditOrderModal = (order: Order) => {
    setEditingOrder({ ...order });
    setEditingProduct(null);
    setEditingUser(null);
    setModalOpen(true);
  };

  // ---------------- Users ----------------
  const [users, setUsers] = useState<User[]>([
    {
      _id: 'u1',
      email: 'user1@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: UserRole.USER,
      cart: [],
      orders: []
    }
  ]);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const addUser = () => {
    const newUser: User = {
      _id: Date.now().toString(),
      email: '',
      firstName: '',
      lastName: '',
      role: UserRole.USER,
      cart: [],
      orders: []
    };
    setUsers([...users, newUser]);
  };

  const saveUser = () => {
    if (!editingUser) return;
    setUsers(users.map(u => (u._id === editingUser._id ? editingUser : u)));
    setModalOpen(false);
  };

  const deleteUser = (id: string) => setUsers(users.filter(u => u._id !== id));

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
      <h1>Admin Dashboard</h1>

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
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>User ID</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Status</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Items</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order._id}>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{order.userId}</td>
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
      {modalOpen && editingProduct && (
        <div style={modalOverlay}>
          <div style={modalStyle}>
            <h2>Edit Product</h2>
            {/* Product form here — keep exactly your existing inputs */}
            {/* Name */}
            <label>Name:</label>
            <input type="text" value={editingProduct.name} onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })} style={{ width: '100%', marginBottom: '10px' }} />
            {/* Description */}
            <label>Description:</label>
            <textarea rows={3} value={editingProduct.description} onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })} style={{ width: '100%', marginBottom: '10px' }} />
            {/* Price */}
            <label>Price:</label>
            <input type="number" value={editingProduct.price} onChange={e => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })} style={{ width: '100%', marginBottom: '10px' }} />
            {/* Category */}
            <label>Category:</label>
            <input type="text" value={editingProduct.category} onChange={e => setEditingProduct({ ...editingProduct, category: e.target.value })} style={{ width: '100%', marginBottom: '10px' }} />
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
            <h2>Edit Order</h2>
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
            <h2>Edit User</h2>
            <label>Email:</label>
            <input type="text" value={editingUser.email} onChange={e => setEditingUser({ ...editingUser, email: e.target.value })} style={{ width: '100%', marginBottom: '10px' }} />
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
