import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard() {
	const [orders, setOrders] = useState([]);
	const [user, setUser] = useState(null);
	const [pin, setPin] = useState("");
	const [pinLoading, setPinLoading] = useState(false);
	const [reqPin, setReqPin] = useState("");
	const [reqAmount, setReqAmount] = useState("");
	const [reqLoading, setReqLoading] = useState(false);

	// using cookie-based auth; requests should include credentials

	const fetchOrders = async () => {
		try {
			const { data } = await axios.get("/api/orders/me", {
				withCredentials: true,
			});
			setOrders(data);
		} catch (e) {
			console.error(e);
		}
	};

	const fetchUser = async () => {
		try {
			const { data } = await axios.get("/api/auth/me", {
				withCredentials: true,
			});
			setUser(data);
		} catch (e) {
			console.error(e);
		}
	};
	useEffect(() => {
		fetchOrders();
		fetchUser();
	}, []);

	const requestDeposit = async (e) => {
		e && e.preventDefault();
		if (!/^[0-9]{4}$/.test(reqPin))
			return alert("PIN must be exactly 4 digits");
		const amt = Number(reqAmount);
		if (!amt || amt <= 0) return alert("Enter a valid deposit amount in NGN");
		setReqLoading(true);
		try {
			const res = await axios.post(
				"/api/deposit/generate",
				{ amount: Math.round(amt * 100), pin: reqPin },
				{ withCredentials: true },
			);
			setReqAmount("");
			setReqPin("");
			alert(
				res.data.message ||
					"Deposit request created and is pending admin approval.",
			);
		} catch (err) {
			console.error(err);
			alert(err.response?.data?.message || "Failed to request deposit");
		} finally {
			setReqLoading(false);
		}
	};

	const submitPin = async (e) => {
		e && e.preventDefault();
		if (!/^[0-9]{4}$/.test(pin)) return alert("PIN must be exactly 4 digits");
		setPinLoading(true);
		try {
			await axios.post("/api/auth/pin", { pin }, { withCredentials: true });
			setUser((u) => ({ ...u, pinSet: true }));
			setPin("");
			alert("PIN set successfully");
		} catch (err) {
			console.error(err);
			alert(err.response?.data?.message || "Failed to set PIN");
		} finally {
			setPinLoading(false);
		}
	};

	const download = (orderId) => {
		window.open(`/api/orders/${orderId}/pdf`, "_blank");
	};

	return (
		<div className="orders-container">
			<h2 className="header-title">Your Purchase History</h2>
			{user && (
				<div
					style={{
						marginTop: 8,
						marginBottom: 12,
						color: "var(--text-secondary)",
					}}
				>
					<strong>Balance:</strong> N
					{(user.balance).toLocaleString()}
				</div>
			)}
			<p className="sub-header">
				Review your owned local properties and download official generated
				purchase certificates.
			</p>

			{user && !user.pinSet && (
				<div
					style={{
						margin: "18px 0",
						padding: 16,
						border: "1px solid var(--border-color)",
						borderRadius: 8,
					}}
				>
					<h3 style={{ margin: 0, marginBottom: 8 }}>
						Set a 4-digit payment PIN
					</h3>
					<p
						style={{
							margin: 0,
							marginBottom: 12,
							color: "var(--text-secondary)",
						}}
					>
						This PIN authorizes payments via tokens and can only be set
						once.
					</p>
					<form onSubmit={submitPin} style={{ display: "flex", gap: 8 }}>
						<input
							value={pin}
							onChange={(e) => setPin(e.target.value)}
							placeholder="1234"
							maxLength={4}
							style={{ padding: "8px 10px", width: 120 }}
						/>
						<button
							className="btn btn-primary"
							disabled={pinLoading}
							style={{ minWidth: 120 }}
						>
							{pinLoading ? "Setting..." : "Set PIN"}
						</button>
					</form>
				</div>
			)}
			{user && user.pinSet && (
				<div
					style={{
						margin: "18px 0",
						padding: 16,
						border: "1px solid var(--border-color)",
						borderRadius: 8,
					}}
				>
					<h3 style={{ margin: 0, marginBottom: 8 }}>
						Generate a payment token
					</h3>
					<p
						style={{
							margin: 0,
							marginBottom: 12,
							color: "var(--text-secondary)",
						}}
					>
						Request a deposit to top up your account balance. Admin
						approval is required before funds reflect in your balance.
					</p>
					<form
						onSubmit={requestDeposit}
						style={{
							display: "flex",
							gap: 8,
							alignItems: "center",
							marginTop: 8,
						}}
					>
						<input
							value={reqAmount}
							onChange={(e) => setReqAmount(e.target.value)}
							placeholder="Amount (NGN)"
							style={{ padding: "8px 10px", width: 140 }}
						/>
						<input
							value={reqPin}
							onChange={(e) => setReqPin(e.target.value)}
							placeholder="Enter your PIN"
							maxLength={4}
							style={{ padding: "8px 10px", width: 120 }}
						/>
						<button
							className="btn btn-primary"
							disabled={reqLoading}
							style={{ minWidth: 160 }}
						>
							{reqLoading ? "Requesting..." : "Request Deposit"}
						</button>
					</form>
					{/* Token generation display removed */}
				</div>
			)}
			{orders.length === 0 ? (
				<div
					style={{
						padding: "40px 0",
						textAlign: "center",
						color: "var(--text-secondary)",
						border: "1px dashed var(--border-color)",
						borderRadius: 12,
					}}
				>
					No property purchases found. Go browse and buy properties using
					payment-cli tokens!
				</div>
			) : (
				<div className="orders-grid">
					{orders.map((o) => (
						<div key={o._id} className="order-card">
							<div className="order-title">{o.property.title}</div>
							<div className="order-details">
								House Number: {o.property.houseNumber} &bull; Location:{" "}
								{o.property.location}
							</div>
							<div
								style={{
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
									marginTop: 16,
								}}
							>
								<div>
									<div
										style={{
											fontSize: "0.8rem",
											color: "var(--text-secondary)",
											marginBottom: 2,
										}}
									>
										Amount Paid
									</div>
									<div style={{ fontWeight: "700" }}>
										${o.amount.toLocaleString()}
									</div>
								</div>
								<span
									className={`badge ${o.status === "paid" ? "badge-paid" : o.status === "pending" ? "badge-pending" : "badge-failed"}`}
								>
									{o.status}
								</span>
							</div>

							{o.status === "paid" && (
								<button
									onClick={() => download(o._id)}
									className="btn btn-secondary"
									style={{ marginTop: 16, width: "100%" }}
								>
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
