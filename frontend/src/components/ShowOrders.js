import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AddProduct.css";
import "bootstrap/dist/css/bootstrap.min.css";

import bg1 from "../assets/images/bg1.jpg";
import bg2 from "../assets/images/bg2.jpg";
import bg3 from "../assets/images/bg3.jpg";
import bg4 from "../assets/images/bg4.jpg";
import logo from "../assets/images/logo.png";

const images = [bg1, bg2, bg3, bg4];

function ShowOrders() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await axios.get("https://aggregates-systembck.onrender.com");
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error("❗ Error fetching orders:", err);
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleStatus = async (orderId, currentStatus) => {
    const newStatus = currentStatus === "Fulfilled" ? "Pending" : "Fulfilled";
    const fulfilledAt =
      newStatus === "Fulfilled" ? new Date().toISOString() : null;

    try {
      await axios.put(
        `https://aggregates-systembck.onrender.com/api/orders/${orderId}/status`,
        {
          status: newStatus,
          fulfilled_at: fulfilledAt,
        }
      );

      // Update the local state to reflect changes
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId
            ? { ...order, status: newStatus, fulfilled_at: fulfilledAt }
            : order
        )
      );
    } catch (err) {
      console.error("❗ Error updating order status:", err);
    }
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
        <div className="col-md-10 text-center owner-content">
          <div className="logo-container mb-4">
            <img src={logo} alt="Logo" className="logo" />
          </div>

          <h2 className="text-white mb-3">📦 Orders</h2>

          {loadingOrders ? (
            <p className="text-white">⏳ Loading orders...</p>
          ) : orders.length === 0 ? (
            <p className="text-white">No orders found.</p>
          ) : (
            <div className="table-responsive order-table">
              <table className="table table-striped table-dark table-bordered">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>User ID</th>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Status</th>
                    <th>Ordered At</th>
                    <th>Action</th>
                    <th>Fulfilled At</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td>{order.id}</td>
                      <td>{order.user_id}</td>
                      <td>{order.product_name || order.product_id}</td>
                      <td>{order.quantity}</td>
                      <td>{order.status || "Pending"}</td>
                      <td>{new Date(order.ordered_at).toLocaleString()}</td>
                      <td>
                        <button
                          className={`btn btn-sm ${
                            order.status === "Fulfilled"
                              ? "btn-warning"
                              : "btn-success"
                          }`}
                          onClick={() =>
                            handleToggleStatus(order.id, order.status)
                          }
                        >
                          {order.status === "Fulfilled" ? "Pending" : "Fulfill"}
                        </button>
                      </td>
                      <td>
                        {order.fulfilled_at
                          ? new Date(order.fulfilled_at).toLocaleString()
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ShowOrders;
