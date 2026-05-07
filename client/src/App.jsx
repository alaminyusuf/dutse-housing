import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Property from "./pages/Property";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

export default function App() {
	return (
		<div>
			<nav style={{ padding: 10, borderBottom: "1px solid #ccc" }}>
				<Link to="/">Home</Link> | <Link to="/register">Register</Link> |{" "}
				<Link to="/login">Login</Link> |{" "}
				<Link to="/dashboard">Dashboard</Link>
			</nav>
			<div style={{ padding: 10 }}>
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/property/:id" element={<Property />} />
					<Route path="/register" element={<Register />} />
					<Route path="/login" element={<Login />} />
					<Route path="/dashboard" element={<Dashboard />} />
				</Routes>
			</div>
		</div>
	);
}
