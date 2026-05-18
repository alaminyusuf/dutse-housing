import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Register() {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const navigate = useNavigate();

	const submit = async (e) => {
		e.preventDefault();
		try {
			const res = await axios.post("/api/auth/register", {
				name,
				email,
				password,
			});
			if (res.data.token) {
				localStorage.setItem("token", res.data.token);
				navigate("/dashboard");
			}
		} catch (err) {
			console.error(err);
			alert("Registration failed");
		}
	};

	return (
		<div>
			<h2>Register</h2>
			<form onSubmit={submit}>
				<div>
					<input
						placeholder="Name"
						value={name}
						onChange={(e) => setName(e.target.value)}
						required
					/>
				</div>
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
				<button type="submit">Register</button>
			</form>
		</div>
	);
}
