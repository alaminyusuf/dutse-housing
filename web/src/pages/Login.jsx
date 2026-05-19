import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const navigate = useNavigate();

	const submit = async (e) => {
		e.preventDefault();
		try {
			const res = await axios.post("/api/auth/login", { email, password });
			if (res.data.token) {
				localStorage.setItem("token", res.data.token);
				localStorage.setItem("role", res.data.user.role || "user");
				// Full reload to update navbar state cleanly
				window.location.href = "/dashboard";
			}
		} catch (err) {
			console.error(err);
			alert(err.response?.data?.message || "Login failed");
		}
	};

	return (
		<div className="form-container">
			<h2 className="header-title" style={{ textAlign: "center", marginBottom: 8 }}>Sign In</h2>
			<p className="sub-header" style={{ textAlign: "center", marginBottom: 28, fontSize: "0.9rem" }}>
				Enter your details to access your account.
			</p>
			
			<form onSubmit={submit}>
				<div className="form-group">
					<label htmlFor="email" className="form-label">Email Address</label>
					<input
						id="email"
						type="email"
						placeholder="name@example.com"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						className="form-input"
						required
					/>
				</div>
				<div className="form-group" style={{ marginBottom: 28 }}>
					<label htmlFor="password" className="form-label">Password</label>
					<input
						id="password"
						type="password"
						placeholder="Enter password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						className="form-input"
						required
					/>
				</div>
				<button type="submit" className="btn" style={{ width: "100%" }}>
					Sign In
				</button>
			</form>
			
			<div style={{ marginTop: 24, textAlign: "center", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
				Don't have an account? <Link to="/register" style={{ color: "var(--text-primary)", fontWeight: 600 }}>Sign up</Link>
			</div>
		</div>
	);
}
