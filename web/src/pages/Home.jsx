import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function Home() {
	const [propsList, setPropsList] = useState([]);
	const fetchProps = async () => {
		try {
			const { data } = await axios.get("/api/properties");
			setPropsList(data);
		} catch (e) {
			console.error(e);
		}
	};

	useEffect(() => {
		fetchProps();
	}, []);

	if (propsList.length < 1) {
		return <h2 className="header-title" style={{ textAlign: "center", marginTop: 40 }}>No properties available</h2>;
	}

	return (
		<div>
			<h2 className="header-title">Available Listings</h2>
			<p className="sub-header">Browse our selection of verified premium local properties in Dutse.</p>
			
			<div className="properties-grid">
				{propsList.map((p) => (
					<div key={p._id} className="property-card">
						<div>
							<h3 className="property-title">{p.title}</h3>
							<div className="property-meta">
								House {p.houseNumber} &bull; {p.location}
							</div>
						</div>
						<div>
							<div className="property-price">${p.price.toLocaleString()}</div>
							<Link to={`/property/${p._id}`} className="btn btn-secondary" style={{ width: "100%", boxSizing: "border-box", textAlign: "center" }}>
								View Details
							</Link>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
