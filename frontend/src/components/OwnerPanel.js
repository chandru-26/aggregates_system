import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./OwnerPanel.css";
import "bootstrap/dist/css/bootstrap.min.css";

import bg1 from "../assets/images/bg1.jpg";
import bg2 from "../assets/images/bg2.jpg";
import bg3 from "../assets/images/bg3.jpg";
import bg4 from "../assets/images/bg4.jpg";
import logo from "../assets/images/logo.png";

const images = [bg1, bg2, bg3, bg4];

function OwnerPanel({ user }) {
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
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/products`);

        if (Array.isArray(res.data)) {
          setProducts(res.data);
        } else if (res.data.products) {
          setProducts(res.data.products);
        } else {
          console.error("❗ Unexpected data format:", res.data);
          setProducts([]);
        }
      } catch (error) {
        console.error("❗ Error fetching products:", error);
        setProducts([]);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="container-fluid owner-panel-container">
      <button className="back-button" onClick={() => navigate(-1)}>
        ⬅ Back
      </button>

      <div className="slideshow-container">
        {images.map((image, index) => (
          <div
            key={index}
            className={`slide ${index === currentSlide ? "active" : ""}`}
            style={{ backgroundImage: `url(${image})` }}
          />
        ))}
      </div>

      <div className="row justify-content-center align-items-center min-vh-100">
        <div className="col-md-6 col-lg-4 text-center owner-content">
          <div className="logo-container">
            <img src={logo} alt="Logo" className="logo" />
          </div>

          <h2 className="text-white mb-3">📦 Add New Product</h2>
          <button
            className="AddProd btn-success btn-lg m-2"
            onClick={() => navigate('/AddProd')}
          >
            ADD Products
          </button>

          <button
            className="ShowProd btn-light mt-4"
            onClick={() => setShowOrders(!showOrders)}
          >
            {showOrders ? " Hide Products" : "📂 Show Products"}
          </button>

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
          <button
            className="ShowOrders btn-success btn-lg m-2"
            onClick={() => navigate('/ShowOrd')}
          >
            Show Orders
          </button>
          {loadingOrders && <p className="text-white">⏳ Loading orders...</p>}
        </div>
      </div>
    </div>
  );
}

export default OwnerPanel;
