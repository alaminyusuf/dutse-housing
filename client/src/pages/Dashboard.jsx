import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard() {
	const [orders, setOrders] = useState([]);
	const token = localStorage.getItem("token");

	useEffect(() => {
		if (!token) return;
		axios
			.get("/api/orders/me", {
				headers: { Authorization: `Bearer ${token}` },
			})
			.then((res) => setOrders(res.data))
			.catch((err) => console.error(err));
	}, [token]);

	const download = (orderId) => {
		if (!token) return alert("Please login");
		window.open(`/api/orders/${orderId}/pdf?token=${token}`, "_blank");
	};

	return (
		<div>
			<h2>Your Purchases</h2>
			{orders.length === 0 && <p>No purchases yet</p>}
			{orders.map((o) => (
				<div
					key={o._id}
					style={{ border: "1px solid #ccc", margin: 8, padding: 8 }}
				>
					<div>
						<strong>{o.property.title}</strong>
					</div>
					<div>
						{o.property.houseNumber} — {o.property.location}
					</div>
					<div>Status: {o.status}</div>
					<div>Amount: ${o.amount}</div>
					<button onClick={() => download(o._id)}>
						Download Certificate
					</button>
				</div>
			))}
		</div>
	);
}
