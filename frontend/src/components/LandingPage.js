import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css'; // Import CSS
import 'bootstrap/dist/css/bootstrap.min.css'; // Bootstrap CSS

import logo from '../assets/images/logo.png'; // Import logo
import bg1 from '../assets/images/bg1.jpg';
import bg2 from '../assets/images/bg2.jpg';
import bg3 from '../assets/images/bg3.jpg';
import bg4 from '../assets/images/bg4.jpg';

const images = [bg1, bg2, bg3, bg4];

function LandingPage() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Change slides every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container-fluid landing-container">
      {/* Background slideshow */}
      <div className="slideshow-container">
        {images.map((image, index) => (
          <div
            key={index}
            className={`slide ${index === currentSlide ? 'active' : ''}`}
            style={{ 
              backgroundImage: `url(${image})`, 
              backgroundSize: 'cover', 
              backgroundPosition: 'center' 
            }}
            onError={(e) => (e.target.style.backgroundImage = `url(${bg1})`)}
          />
        ))}
      </div>

      {/* Main content with logo */}
      <div className="row justify-content-center align-items-center min-vh-100">
        <div className="col-md-6 col-lg-4 text-center landing-content">
          {/* Logo Section */}
          <div className="logo-container">
            <img src={logo} alt="Logo" className="logo" />
          </div>

          <h1 className="landing-title">🏗️ Welcome to Aggregates Ordering System</h1>
          <p className="landing-description">
            Easily manage orders, view products, and track deliveries in real-time!
          </p>
          <div className="btn-container">
            <button
              className="btn btn-primary btn-lg m-2"
              onClick={() => navigate('/register')}
            >
              📝 Register
            </button>
            <button
              className="btn btn-success btn-lg m-2"
              onClick={() => navigate('/login')}
            >
              🔐 Login
            </button>
            <button
              className="btn btn-warning btn-lg m-2"
              onClick={() => navigate('/owner')}
            >
              📊 Owner Panel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
