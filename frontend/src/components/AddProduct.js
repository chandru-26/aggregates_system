import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AddProduct.css";
import "bootstrap/dist/css/bootstrap.min.css";

import bg1 from "../assets/images/bg1.jpg";
import bg2 from "../assets/images/bg2.jpg";
import bg3 from "../assets/images/bg3.jpg";
import bg4 from "../assets/images/bg4.jpg";
import logo from "../assets/images/logo.png";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const images = [bg1, bg2, bg3, bg4];

function AddProduct({ user }) {
  // ✅ Accept user as a prop
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    image_url: "",
    quantity: "",
  });

  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [showOrders, setShowOrders] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/products`);


        // Make sure it's an array
        if (Array.isArray(res.data)) {
          setProducts(res.data);
        } else if (res.data.products) {
          setProducts(res.data.products); // in case API returns { products: [...] }
        } else {
          console.error("❗ Unexpected data format:", res.data);
          setProducts([]); // fallback
        }
      } catch (error) {
        console.error("❗ Error fetching products:", error);
        setProducts([]); // fallback to empty array on error
      }
    };

    fetchProducts();
  }, []);

  // Background Slideshow Effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Fetch cart items

  // Handle Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Submit New Product
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      
await axios.post(`${API_BASE_URL}/api/products`, formData);

      alert("✅ Product added successfully!");
      setFormData({ name: "", image_url: "", quantity: "" });
    } catch (error) {
      console.error("❗ Error adding product:", error);
      alert("❗ Failed to add product.");
    }
  };

  return (
    <div className="container-fluid owner-panel-container">
      <button className="back-button" onClick={() => navigate(-1)}>
        ⬅ Back
      </button>
  

      {/* Background Slideshow */}
      <div className="slideshow-container">
        {images.map((image, index) => (
          <div
            key={index}
            className={`slide ${index === currentSlide ? "active" : ""}`}
            style={{ backgroundImage: `url(${image})` }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="row justify-content-center align-items-center min-vh-100">
        <div className="col-md-6 col-lg-4 text-center owner-content">
          <div className="logo-container">
            <img src={logo} alt="Logo" className="logo" />
          </div>

          <h2 className="text-white mb-3">📦 Add New Product</h2>
          <form onSubmit={handleSubmit} className="add-product-form">
            <input
              type="text"
              name="name"
              placeholder="Product Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="image_url"
              placeholder="Image URL"
              value={formData.image_url}
              onChange={handleChange}
              required
            />
            <input
              type="number"
              name="quantity"
              placeholder="Quantity"
              value={formData.quantity}
              onChange={handleChange}
              required
            />
            <button type="submit">Add Product</button>
          </form>

          {/* Toggle Button for Products */}
          <button
            className="btn btn-light mt-4"
            onClick={() => setShowOrders(!showOrders)}
          >
            {showOrders ? " Hide Products" : "📂 Show Products"}
          </button>

          {/* Conditionally Show Products */}
          {showOrders && (
            <>
              <h3 className="text-white mt-4">🛍 Existing Products</h3>
              <div className="product-list">
                {products.length === 0 ? (
                  <p className="text-white">No products available.</p>
                ) : (
                  products.map((product) => (
                    <div key={product.id} className="product-card">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        style={{
                          width: "100px",
                          height: "100px",
                          objectFit: "cover",
                        }}
                        onError={(e) =>
                          (e.target.src = "https://via.placeholder.com/100")
                        }
                      />
                      <h5 className="text-black mt-2">{product.name}</h5>
                      <p className="text-black">🆔 ID: {product.id}</p>
                      <p className="text-black">
                        📅 Created At:{" "}
                        {new Date(product.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {loadingOrders && <p className="text-white">⏳ Loading orders...</p>}
        </div>
      </div>
    </div>
  );
}

export default AddProduct;
