import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom"; // ✅ Ensure Router is imported
import LandingPage from "./components/LandingPage";
import Register from "./components/Register";
import Login from "./components/Login";
import LoginOwner from "./components/LoginOwner";
import Dashboard from "./components/Dashboard";
import OwnerPanel from "./components/OwnerPanel";
import "bootstrap/dist/css/bootstrap.min.css";
import AddProduct from "./components/AddProduct";
import ShowOrders from "./components/ShowOrders";

function App() {
  const [user, setUser] = useState(null);

  // Load user from local storage on page refresh
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Save user to local storage when it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  return (
    <Router>
      {" "}
      {/* ✅ Wrap Routes inside BrowserRouter */}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/loginOwner" element={<LoginOwner setUser={setUser} />} />
        <Route path="/owner" element={<OwnerPanel />} />
        <Route path="/AddProd" element={<AddProduct />} />
        <Route path="/ShowOrd" element={<ShowOrders />} />

        {/* Protected Route */}
        <Route
          path="/dashboard"
          element={
            user ? <Dashboard user={user} /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/owner"
          element={
            user ? (
              <OwnerPanel user={user} />
            ) : (
              <Navigate to="/loginOwner" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
