import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

export default function Property() {
	const { id } = useParams();
	const [prop, setProp] = useState(null);
	const [token, setToken] = useState(localStorage.getItem("token"));
	const [paymentPin, setPaymentPin] = useState("");

	useEffect(() => {
		axios
			.get(`/api/properties/${id}`)
			.then((res) => setProp(res.data))
			.catch(console.error);
	}, [id]);

	const buy = async () => {
		if (!token) return alert("Please login/register first");
		if (!paymentPin) return alert("Please enter your 4-Digit Payment PIN");
		if (paymentPin.length !== 4 || isNaN(Number(paymentPin))) {
			return alert("Please enter a valid 4-digit numeric PIN (e.g. 1234)");
		}

		try {
			const res = await axios.post(
				"/api/checkout/create-session",
				{ propertyId: id, pin: paymentPin },
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
					<label htmlFor="paymentPin" className="form-label">
						Enter 4-Digit Payment PIN:
					</label>
					<input
						id="paymentPin"
						type="text"
						maxLength={4}
						placeholder="1234"
						value={paymentPin}
						onChange={(e) => setPaymentPin(e.target.value.replace(/\D/g, ""))}
						className="form-input"
						style={{ maxWidth: "200px", display: "block", letterSpacing: "0.2em", fontSize: "1.2rem", textAlign: "center" }}
					/>
				</div>

				<button onClick={buy} className="btn" style={{ width: "100%", maxWidth: "360px", marginTop: 8 }}>
					Buy Property
				</button>
			</div>
		</div>
	);
}
