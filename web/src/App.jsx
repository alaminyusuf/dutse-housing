import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Property from "./pages/Property";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

export default function App() {
	const handleLogout = () => {
		localStorage.removeItem("token");
		window.location.href = "/login";
	};

	const hasToken = !!localStorage.getItem("token");

	return (
		<div className="app-container">
			<nav className="navbar">
				<Link to="/" className="nav-brand">Dutse Housing</Link>
				<div className="nav-links">
					<Link to="/" className="nav-link">Properties</Link>
					{hasToken ? (
						<>
							<Link to="/dashboard" className="nav-link">Dashboard</Link>
							<button onClick={handleLogout} className="btn btn-secondary" style={{ marginLeft: 8 }}>
								Logout
							</button>
						</>
					) : (
						<>
							<Link to="/login" className="nav-link">Login</Link>
							<Link to="/register" className="btn">Register</Link>
						</>
					)}
				</div>
			</nav>
			<main>
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/property/:id" element={<Property />} />
					<Route path="/register" element={<Register />} />
					<Route path="/login" element={<Login />} />
					<Route path="/dashboard" element={<Dashboard />} />
				</Routes>
			</main>
		</div>
	);
}
