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

	if (!prop) return <div style={{ textAlign: "center", marginTop: 40 }}>Loading...</div>;

	return (
		<div className="details-container">
			<Link to="/" style={{ display: "inline-block", marginBottom: "24px", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
				&larr; Back to Listings
			</Link>
			
			<h2 className="header-title" style={{ marginBottom: 8 }}>{prop.title}</h2>
			<div className="sub-header" style={{ marginBottom: 24 }}>
				House Number: {prop.houseNumber} &bull; Location: {prop.location}
			</div>

			<div className="property-price" style={{ fontSize: "1.75rem", marginBottom: 24 }}>
				${prop.price.toLocaleString()}
			</div>

			<div style={{ lineHeight: 1.6, color: "var(--text-secondary)", marginBottom: 32 }}>
				{prop.description || "No description provided for this premium property."}
			</div>
			
			<div style={{ borderTop: "1px solid var(--border-color)", paddingTop: 32 }}>
				<div className="form-group">
					<label htmlFor="paymentToken" className="form-label">
						Enter Simulated Payment Token to Purchase:
					</label>
					<input
						id="paymentToken"
						type="text"
						placeholder="tok_..."
						value={paymentToken}
						onChange={(e) => setPaymentToken(e.target.value)}
						className="form-input"
						style={{ maxWidth: "360px", display: "block" }}
					/>
				</div>

				<button onClick={buy} className="btn" style={{ width: "100%", maxWidth: "360px", marginTop: 8 }}>
					Buy Property
				</button>
			</div>
		</div>
	);
}
