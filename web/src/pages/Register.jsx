import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const navigate = useNavigate();

	const submit = async (e) => {
		e.preventDefault();
		try {
			const res = await axios.post(
				"/api/auth/register",
				{ name, email, password },
				{ withCredentials: true },
			);
			if (res.status === 200) window.location.href = "/dashboard";
		} catch (err) {
			console.error(err);
			alert(err.response?.data?.message || "Registration failed");
		}
	};

	return (
		<div className="form-container">
			<h2
				className="header-title"
				style={{ textAlign: "center", marginBottom: 8 }}
			>
				Create Account
			</h2>
			<p
				className="sub-header"
				style={{
					textAlign: "center",
					marginBottom: 28,
					fontSize: "0.9rem",
				}}
			>
				Join Dutse Housing to purchase verified premium properties.
			</p>

			<form onSubmit={submit}>
				<div className="form-group">
					<label htmlFor="name" className="form-label">
						Full Name
					</label>
					<input
						id="name"
						placeholder="Jane Doe"
						value={name}
						onChange={(e) => setName(e.target.value)}
						className="form-input"
						required
					/>
				</div>
				<div className="form-group">
					<label htmlFor="email" className="form-label">
						Email Address
					</label>
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
					<label htmlFor="password" className="form-label">
						Password
					</label>
					<input
						id="password"
						type="password"
						placeholder="Create password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						className="form-input"
						required
					/>
				</div>
				<button type="submit" className="btn" style={{ width: "100%" }}>
					Sign Up
				</button>
			</form>

			<div
				style={{
					marginTop: 24,
					textAlign: "center",
					fontSize: "0.9rem",
					color: "var(--text-secondary)",
				}}
			>
				Already have an account?{" "}
				<Link
					to="/login"
					style={{ color: "var(--text-primary)", fontWeight: 600 }}
				>
					Sign in
				</Link>
			</div>
		</div>
	);
}
