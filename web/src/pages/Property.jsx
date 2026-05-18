import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

export default function Property() {
	const { id } = useParams();
	const [prop, setProp] = useState(null);
	const [token, setToken] = useState(localStorage.getItem("token"));
	const [paymentToken, setPaymentToken] = useState("");

	useEffect(() => {
		axios
			.get(`/api/properties/${id}`)
			.then((res) => setProp(res.data))
			.catch(console.error);
	}, [id]);

	const buy = async () => {
		if (!token) return alert("Please login/register first");
		if (!paymentToken) return alert("Please enter a Payment Token");

		try {
			const res = await axios.post(
				"/api/checkout/create-session",
				{ propertyId: id, token: paymentToken },
				{ headers: { Authorization: `Bearer ${token}` } },
			);
			if (res.data && res.data.url) {
				window.location.href = res.data.url;
			}
		} catch (err) {
			console.error(err);
			alert(err.response?.data?.message || "Checkout error occurred");
		}
	};

	if (!prop) return <div>Loading...</div>;

	return (
		<div>
			<Link to="/" style={{ display: "inline-block", marginBottom: "16px" }}>&larr; Back to Home</Link>
			<h2>{prop.title}</h2>
			<p>
				{prop.houseNumber} — {prop.location}
			</p>
			<p style={{ fontWeight: "bold", fontSize: "1.2rem" }}>${prop.price.toLocaleString()}</p>
			<p>{prop.description}</p>
			
			<div style={{ margin: "20px 0" }}>
				<label htmlFor="paymentToken" style={{ display: "block", marginBottom: 8, fontWeight: "bold" }}>
					Enter Payment Token to Purchase:
				</label>
				<input
					id="paymentToken"
					type="text"
					placeholder="tok_..."
					value={paymentToken}
					onChange={(e) => setPaymentToken(e.target.value)}
					style={{ width: "320px", padding: "8px", boxSizing: "border-box" }}
				/>
			</div>

			<button onClick={buy}>Buy with Token</button>
		</div>
	);
}
