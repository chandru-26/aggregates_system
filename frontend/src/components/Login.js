import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import bg1 from '../assets/images/bg1.jpg';
import bg2 from '../assets/images/bg2.jpg';
import bg3 from '../assets/images/bg3.jpg';
import bg4 from '../assets/images/bg4.jpg';
import logo from '../assets/images/logo.png';

const images = [bg1, bg2, bg3, bg4];

function Login({ setUser }) {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/login`, formData);
      if (response.data.success) {
        setUser(response.data.user);
        alert('✅ Login successful! Redirecting to dashboard...');
        navigate('/dashboard');
      } else {
        alert('❗ Invalid email or password');
      }
    } catch (error) {
      alert('❗ Unable to log in. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid login-container">
      <button className="back-button" onClick={() => navigate(-1)}>⬅ Back</button>
      <div className="slideshow-container">
        {images.map((image, index) => (
          <div
            key={index}
            className={`slide ${index === currentSlide ? 'active' : ''}`}
            style={{ backgroundImage: `url(${image})` }}
          />
        ))}
      </div>
      <div className="row justify-content-center align-items-center min-vh-100">
        <div className="col-md-6 col-lg-4 text-center login-content">
          <div className="logo-container">
            <img src={logo} alt="Logo" className="logo" />
          </div>
          <h2 className="text-white mb-3">🔐 Customer Login</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
