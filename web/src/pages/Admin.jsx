import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Admin() {
	const navigate = useNavigate();
	const [activeTab, setActiveTab] = useState("property"); // "property" | "balance"
	
	// Property form state
	const [title, setTitle] = useState("");
	const [houseNumber, setHouseNumber] = useState("");
	const [location, setLocation] = useState("");
	const [price, setPrice] = useState("");
	const [description, setDescription] = useState("");
	const [coverImage, setCoverImage] = useState(null);
	
	// Balance form state
	const [customerEmail, setCustomerEmail] = useState("");
	const [creditAmount, setCreditAmount] = useState("");
	
	// UI Feedback states
	const [loading, setLoading] = useState(false);
	const [successMsg, setSuccessMsg] = useState("");
	const [errorMsg, setErrorMsg] = useState("");

	useEffect(() => {
		const token = localStorage.getItem("token");
		const role = localStorage.getItem("role");
		if (!token || role !== "admin") {
			navigate("/");
		}
	}, [navigate]);

	// Handle Property Upload
	const handlePropertySubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setSuccessMsg("");
		setErrorMsg("");

		if (!title || !houseNumber || !location || !price) {
			setErrorMsg("Please fill in all required property fields");
			setLoading(false);
			return;
		}

		try {
			const token = localStorage.getItem("token");
			const formData = new FormData();
			formData.append("title", title);
			formData.append("houseNumber", houseNumber);
			formData.append("location", location);
			formData.append("price", price);
			formData.append("description", description);
			if (coverImage) {
				formData.append("coverImage", coverImage);
			}

			const res = await axios.post("/api/properties", formData, {
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "multipart/form-data",
				},
			});

			setSuccessMsg(`Property "${res.data.title}" added successfully!`);
			// Reset fields
			setTitle("");
			setHouseNumber("");
			setLocation("");
			setPrice("");
			setDescription("");
			setCoverImage(null);
			// Reset file input element visually
			const fileInput = document.getElementById("coverImage");
			if (fileInput) fileInput.value = "";

		} catch (err) {
			console.error("Failed to add property:", err);
			setErrorMsg(err.response?.data?.message || "Failed to add property. Verify all fields.");
		} finally {
			setLoading(false);
		}
	};

	// Handle Balance Generation
	const handleBalanceSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setSuccessMsg("");
		setErrorMsg("");

		if (!customerEmail || !creditAmount || Number(creditAmount) <= 0) {
			setErrorMsg("Please provide a valid email and positive credit amount");
			setLoading(false);
			return;
		}

		try {
			const token = localStorage.getItem("token");
			const res = await axios.post(
				"/api/admin/generate-balance",
				{
					email: customerEmail,
					amount: Number(creditAmount),
				},
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			const roundedBal = (res.data.customer.balance / 100).toLocaleString("en-US", {
				style: "currency",
				currency: "USD",
			});
			setSuccessMsg(`Successfully credited $${Number(creditAmount).toLocaleString()}! User's total balance is now ${roundedBal}.`);
			setCustomerEmail("");
			setCreditAmount("");
		} catch (err) {
			console.error("Failed to credit balance:", err);
			setErrorMsg(err.response?.data?.message || "Failed to credit customer balance.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="admin-container" style={{ maxWidth: 800, margin: "40px auto", padding: "0 20px" }}>
			<div className="admin-header" style={{ marginBottom: 32 }}>
				<h1 className="header-title" style={{ fontSize: "2.2rem", marginBottom: 8 }}>Administrator Portal</h1>
				<p className="sub-header" style={{ fontSize: "0.95rem" }}>
					Add premium housing listings or top-up active simulated ledger customer accounts directly.
				</p>
			</div>

			{/* Tab Switcher */}
			<div className="admin-tabs" style={{ display: "flex", gap: 12, borderBottom: "1px solid var(--border-color)", paddingBottom: 12, marginBottom: 32 }}>
				<button
					onClick={() => { setActiveTab("property"); setSuccessMsg(""); setErrorMsg(""); }}
					className={`btn ${activeTab === "property" ? "" : "btn-secondary"}`}
					style={{ padding: "10px 20px", borderRadius: 8, fontSize: "0.95rem", fontWeight: 600 }}
				>
					🏢 Add New Property
				</button>
				<button
					onClick={() => { setActiveTab("balance"); setSuccessMsg(""); setErrorMsg(""); }}
					className={`btn ${activeTab === "balance" ? "" : "btn-secondary"}`}
					style={{ padding: "10px 20px", borderRadius: 8, fontSize: "0.95rem", fontWeight: 600 }}
				>
					💳 Credit User Balance
				</button>
			</div>

			{/* Notifications */}
			{successMsg && (
				<div className="alert alert-success" style={{ backgroundColor: "#e6f4ea", color: "#137333", border: "1px solid #c2e7cd", padding: 16, borderRadius: 8, marginBottom: 24, fontSize: "0.95rem", display: "flex", alignItems: "center", gap: 8 }}>
					<span>✅ {successMsg}</span>
				</div>
			)}
			{errorMsg && (
				<div className="alert alert-error" style={{ backgroundColor: "#fce8e6", color: "#c5221f", border: "1px solid #fad2cf", padding: 16, borderRadius: 8, marginBottom: 24, fontSize: "0.95rem", display: "flex", alignItems: "center", gap: 8 }}>
					<span>⚠️ {errorMsg}</span>
				</div>
			)}

			{/* Tab 1: Add Property Form */}
			{activeTab === "property" && (
				<div className="form-card" style={{ background: "rgba(255, 255, 255, 0.7)", backdropFilter: "blur(10px)", border: "1px solid var(--border-color)", padding: 32, borderRadius: 16, boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.04)" }}>
					<h3 style={{ fontSize: "1.3rem", fontWeight: 600, marginBottom: 24 }}>Listing Information</h3>
					<form onSubmit={handlePropertySubmit}>
						<div className="form-group" style={{ marginBottom: 20 }}>
							<label htmlFor="title" className="form-label" style={{ fontWeight: 600 }}>Property Title *</label>
							<input
								id="title"
								type="text"
								placeholder="e.g. Luxury Apartment"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								className="form-input"
								required
							/>
						</div>

						<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
							<div className="form-group">
								<label htmlFor="houseNumber" className="form-label" style={{ fontWeight: 600 }}>House Number *</label>
								<input
									id="houseNumber"
									type="text"
									placeholder="e.g. Apt-4B"
									value={houseNumber}
									onChange={(e) => setHouseNumber(e.target.value)}
									className="form-input"
									required
								/>
							</div>
							<div className="form-group">
								<label htmlFor="location" className="form-label" style={{ fontWeight: 600 }}>Location *</label>
								<input
									id="location"
									type="text"
									placeholder="e.g. Dutse"
									value={location}
									onChange={(e) => setLocation(e.target.value)}
									className="form-input"
									required
								/>
							</div>
						</div>

						<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
							<div className="form-group">
								<label htmlFor="price" className="form-label" style={{ fontWeight: 600 }}>Price in USD ($) *</label>
								<input
									id="price"
									type="number"
									placeholder="e.g. 125000"
									value={price}
									onChange={(e) => setPrice(e.target.value)}
									className="form-input"
									required
								/>
							</div>
							<div className="form-group">
								<label htmlFor="coverImage" className="form-label" style={{ fontWeight: 600 }}>Cover Image</label>
								<input
									id="coverImage"
									type="file"
									accept="image/*"
									onChange={(e) => setCoverImage(e.target.files[0])}
									className="form-input"
									style={{ padding: "8px 12px" }}
								/>
							</div>
						</div>

						<div className="form-group" style={{ marginBottom: 32 }}>
							<label htmlFor="description" className="form-label" style={{ fontWeight: 600 }}>Listing Description</label>
							<textarea
								id="description"
								placeholder="Enter general amenities, size details, or proximity info..."
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								className="form-input"
								rows={4}
								style={{ resize: "none", fontFamily: "inherit" }}
							/>
						</div>

						<button type="submit" className="btn" style={{ width: "100%", padding: "14px 20px" }} disabled={loading}>
							{loading ? "Adding Listing..." : "✨ Publish Listing"}
						</button>
					</form>
				</div>
			)}

			{/* Tab 2: Generate Balance Form */}
			{activeTab === "balance" && (
				<div className="form-card" style={{ background: "rgba(255, 255, 255, 0.7)", backdropFilter: "blur(10px)", border: "1px solid var(--border-color)", padding: 32, borderRadius: 16, boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.04)" }}>
					<h3 style={{ fontSize: "1.3rem", fontWeight: 600, marginBottom: 12 }}>Top-up Ledger Credit</h3>
					<p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", marginBottom: 28 }}>
						Simulate funds credit for customers to verify local checkout transactions without needing terminal scripts.
					</p>
					<form onSubmit={handleBalanceSubmit}>
						<div className="form-group" style={{ marginBottom: 20 }}>
							<label htmlFor="customerEmail" className="form-label" style={{ fontWeight: 600 }}>Customer Email Address *</label>
							<input
								id="customerEmail"
								type="email"
								placeholder="e.g. alice@example.com"
								value={customerEmail}
								onChange={(e) => setCustomerEmail(e.target.value)}
								className="form-input"
								required
							/>
						</div>

						<div className="form-group" style={{ marginBottom: 32 }}>
							<label htmlFor="creditAmount" className="form-label" style={{ fontWeight: 600 }}>Amount to Credit in USD ($) *</label>
							<input
								id="creditAmount"
								type="number"
								placeholder="e.g. 150000"
								value={creditAmount}
								onChange={(e) => setCreditAmount(e.target.value)}
								className="form-input"
								required
							/>
						</div>

						<button type="submit" className="btn" style={{ width: "100%", padding: "14px 20px" }} disabled={loading}>
							{loading ? "Processing Credit..." : "💳 Top-up Customer Balance"}
						</button>
					</form>
				</div>
			)}
		</div>
	);
}
