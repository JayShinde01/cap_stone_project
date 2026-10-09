import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import Home from "./Pages/Home";
import Login from "./Pages/Login";
import Sidebar from "./components/Sidebar";
import Item from "./Pages/Item";
import Customer from "./Pages/CustomerForm";
import Search from "./Pages/Search";
import Report from "./Pages/Report";
import Sales from "./Pages/Sales";
import Loading from "./components/Loading"; // Optional extra route
import { AuthContext } from "./context/AuthContext";

// Custom loading icon
const antIcon = <LoadingOutlined style={{ fontSize: 40 }} spin />;

// ✅ Private Route wrapper
function PrivateRoute({ children }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          width: "100%",
        }}
      >
        <Spin indicator={antIcon} tip="Checking login..." size="large" />
      </div>
    );
  }

  return user ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <Routes>
      {/* 🔁 Default route redirects to login */}
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />

      {/* 🔒 Protected Routes */}
      <Route path="/sidebar" element={<PrivateRoute><Sidebar /></PrivateRoute>} />
      <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
      <Route path="/item" element={<PrivateRoute><Item /></PrivateRoute>} />
      <Route path="/sales" element={<PrivateRoute><Sales /></PrivateRoute>} />
      <Route path="/customer" element={<PrivateRoute><Customer /></PrivateRoute>} />
      <Route path="/search" element={<PrivateRoute><Search /></PrivateRoute>} />
      <Route path="/report" element={<PrivateRoute><Report /></PrivateRoute>} />
      <Route path="/load" element={<PrivateRoute><Loading /></PrivateRoute>} />
    </Routes>
  );
}

export default App;
