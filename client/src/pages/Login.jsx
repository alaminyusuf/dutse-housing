import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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
				navigate("/dashboard");
			}
		} catch (err) {
			console.error(err);
			alert("Login failed");
		}
	};

	return (
		<div>
			<h2>Login</h2>
			<form onSubmit={submit}>
				<div>
					<input
						placeholder="Email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
					/>
				</div>
				<div>
					<input
						type="password"
						placeholder="Password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
					/>
				</div>
				<button type="submit">Login</button>
			</form>
		</div>
	);
}
