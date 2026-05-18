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
		<div className="orders-container">
			<h2 className="header-title">Your Purchase History</h2>
			<p className="sub-header">Review your owned local properties and download official generated purchase certificates.</p>
			
			{orders.length === 0 ? (
				<div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-secondary)", border: "1px dashed var(--border-color)", borderRadius: 12 }}>
					No property purchases found. Go browse and buy properties using payment-cli tokens!
				</div>
			) : (
				<div className="orders-grid">
					{orders.map((o) => (
						<div key={o._id} className="order-card">
							<div className="order-title">{o.property.title}</div>
							<div className="order-details">
								House Number: {o.property.houseNumber} &bull; Location: {o.property.location}
							</div>
							<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
								<div>
									<div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: 2 }}>Amount Paid</div>
									<div style={{ fontWeight: "700" }}>${o.amount.toLocaleString()}</div>
								</div>
								<span className={`badge ${o.status === 'paid' ? 'badge-paid' : o.status === 'pending' ? 'badge-pending' : 'badge-failed'}`}>
									{o.status}
								</span>
							</div>
							
							{o.status === "paid" && (
								<button onClick={() => download(o._id)} className="btn btn-secondary" style={{ marginTop: 16, width: "100%" }}>
									Download PDF Certificate
								</button>
							)}
						</div>
					))}
				</div>
			)}
		</div>
	);
}
