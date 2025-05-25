import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Dashboard.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Modal, Button } from "react-bootstrap";

import bg1 from "../assets/images/bg1.jpg";
import bg2 from "../assets/images/bg2.jpg";
import bg3 from "../assets/images/bg3.jpg";
import bg4 from "../assets/images/bg4.jpg";
import logo from "../assets/images/logo.png";

const images = [bg1, bg2, bg3, bg4];

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const ProductImage = ({ imageUrl, productName }) => {
  const [imgSrc, setImgSrc] = useState(
    imageUrl ? `/assets/products/${imageUrl}` : `/assets/products/default.jpg`
  );

  const handleError = () => {
    if (imgSrc !== `/assets/products/default.jpg`) {
      setImgSrc(`/assets/products/default.jpg`);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={productName || "Product Image"}
      onError={handleError}
      className="product-image"
    />
  );
};

function Dashboard({ user }) {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState({});
  const [showCart, setShowCart] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  const handleCloseCart = () => setShowCart(false);

  const handleViewCart = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/cart/${user?.id}`);
      setCartItems(res.data.cart);
      setShowCart(true);
    } catch (err) {
      console.error("❗ Error fetching cart:", err);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/cart/${user?.id}/${productId}`);
      handleViewCart();
    } catch (error) {
      console.error("❗ Error removing item from cart:", error);
      alert("❗ Failed to remove item.");
    }
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      alert("🛒 Your cart is empty.");
      return;
    }

    try {
      const res = await axios.post(`${API_BASE_URL}/api/orders`, {
        user_id: user?.id,
      });

      if (res.status === 200 || res.status === 201) {
        alert("✅ Order placed successfully!");
        setCartItems([]);
        setShowCart(false);
      } else {
        alert("❗ Failed to place order.");
      }
    } catch (err) {
      console.error("❗ Checkout error:", err);
      alert("❗ Error during checkout.");
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/products`);
      setProducts(response.data.products);
      setLoading(false);
    } catch (error) {
      console.error("❗ Error fetching products:", error);
      setLoading(false);
    }
  };

  const addToCart = async (productId) => {
    const qty = quantity[productId] || 1;
    try {
      await axios.post(`${API_BASE_URL}/api/cart`, {
        user_id: user?.id,
        product_id: productId,
        quantity: qty,
      });
      alert("✅ Item added to cart!");
    } catch (error) {
      console.error("❗ Error adding to cart:", error);
      alert("❗ Failed to add to cart.");
    }
  };

  const handleQuantityChange = (productId, value) => {
    const newQty = Math.max(1, parseInt(value));
    setQuantity({ ...quantity, [productId]: newQty });
  };

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <div className="container-fluid dashboard-container">
      <div className="slideshow-container">
        {images.map((image, index) => (
          <div
            key={index}
            className={`slide ${index === currentSlide ? "active" : ""}`}
            style={{ backgroundImage: `url(${image})` }}
          />
        ))}
      </div>

      <button
        className="logout-button btn btn-light mb-3"
        onClick={handleLogout}
      >
        🔒 Logout
      </button>

      <div className="ecommerce-header d-flex justify-content-between align-items-center p-3">
        <div className="logo-container">
          <img src={logo} alt="Logo" className="logo" />
        </div>

        <button
          className="cart-button btn-warning cart-button"
          onClick={handleViewCart}
        >
          🛍️ View Cart
        </button>
      </div>

      <div className="ecommerce-main px-3 pb-5">
        <h2 className="text-white mb-4 text-center">
          👋 Welcome, {user?.name || "Guest"}
        </h2>
        {loading ? (
          <p className="text-white text-center">Loading products...</p>
        ) : (
          <div className="row justify-content-center gap-4 product-grid">
            {products.map((product) => (
              <div key={product.id} className="col-sm-6 col-md-4 col-lg-3">
                <div className="product-card text-center p-3">
                  <ProductImage
                    imageUrl={product.image_url}
                    productName={product.name}
                  />
                  <h5 className="mt-2">{product.name}</h5>
                  <p>Available: {product.quantity}</p>
                  <div className="quantity-control d-flex justify-content-center align-items-center my-2">
                    <button
                      onClick={() =>
                        handleQuantityChange(
                          product.id,
                          (quantity[product.id] || 1) - 1
                        )
                      }
                      disabled={(quantity[product.id] || 1) <= 1}
                    >
                      -
                    </button>
                    <span className="mx-2">{quantity[product.id] || 1}</span>
                    <button
                      onClick={() =>
                        handleQuantityChange(
                          product.id,
                          (quantity[product.id] || 1) + 1
                        )
                      }
                    >
                      +
                    </button>
                  </div>
                  <button
                    className="btn btn-primary w-100"
                    onClick={() => addToCart(product.id)}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cart Modal */}
      <Modal show={showCart} onHide={handleCloseCart} centered>
        <Modal.Header closeButton>
          <Modal.Title>🛒 Your Cart</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {cartItems.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            <div
              className="cart-scrollable"
              style={{ maxHeight: "300px", overflowY: "auto" }}
            >
              <ul className="list-group">
                {cartItems.map((item, index) => (
                  <li
                    key={index}
                    className="list-group-item d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <strong>{item.name}</strong> <br />
                      <small>Qty: {item.quantity}</small>
                    </div>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => removeFromCart(item.product_id)}
                    >
                      ❌ Remove
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="success"
            onClick={handleCheckout}
            disabled={cartItems.length === 0}
          >
            ✅ Checkout
          </Button>
          <Button variant="secondary" onClick={handleCloseCart}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Dashboard;
