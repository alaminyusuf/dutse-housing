import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function Home() {
	const [propsList, setPropsList] = useState([]);
	const fetchProps = async () => {
		try {
			const { data } = await axios.get("/api/properties");
			// Safety: filter out sold properties on the client as well
			setPropsList(data.filter((p) => !p.sold));
		} catch (e) {
			console.error(e);
		}
	};

	useEffect(() => {
		fetchProps();
	}, []);

	if (propsList.length < 1) {
		return (
			<h2
				className="header-title"
				style={{ textAlign: "center", marginTop: 40 }}
			>
				No properties available
			</h2>
		);
	}

	return (
		<div>
			<h2 className="header-title">Available Listings</h2>
			<p className="sub-header">
				Browse our selection of verified premium local properties in Dutse.
			</p>

			<div className="properties-grid">
				{propsList.map((p) => (
					<div
						key={p._id}
						className="property-card"
						style={{
							display: "flex",
							flexDirection: "column",
							justifyContent: "space-between",
						}}
					>
						<div>
							{/* Property Card Cover Image Block */}
							<div
								className="property-image-container"
								style={{
									width: "100%",
									height: "180px",
									borderRadius: "12px",
									overflow: "hidden",
									marginBottom: "16px",
									backgroundColor: "rgba(0,0,0,0.03)",
								}}
							>
								<img
									src={
										p.coverImage
											? `http://localhost:5000${p.coverImage}`
											: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80"
									}
									alt={p.title}
									style={{
										width: "100%",
										height: "100%",
										objectFit: "cover",
										transition: "transform 0.3s ease",
									}}
									className="property-img-hover"
								/>
							</div>

							<h3
								className="property-title"
								style={{
									fontSize: "1.15rem",
									fontWeight: 600,
									marginBottom: 6,
								}}
							>
								{p.title}
							</h3>
							<div
								className="property-meta"
								style={{
									fontSize: "0.85rem",
									color: "var(--text-secondary)",
									marginBottom: 16,
								}}
							>
								House {p.houseNumber} &bull; {p.location}
							</div>
						</div>
						<div>
							<div
								className="property-price"
								style={{
									fontSize: "1.25rem",
									fontWeight: 700,
									marginBottom: 12,
								}}
							>
								${p.price.toLocaleString()}
							</div>
							<Link
								to={`/property/${p._id}`}
								className="btn btn-secondary"
								style={{
									width: "100%",
									boxSizing: "border-box",
									textAlign: "center",
								}}
							>
								View Details
							</Link>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
