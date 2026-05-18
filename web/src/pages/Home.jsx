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
		return <h2>No properties available</h2>;
	}

	return (
		<div>
			<h2>Available Properties</h2>
			{propsList.map((p) => (
				<div
					key={p._id}
					style={{ border: "1px solid #ccc", margin: 8, padding: 8 }}
				>
					<h3>{p.title}</h3>
					<p>
						{p.houseNumber} — {p.location}
					</p>
					<p>${p.price}</p>
					<Link to={`/property/${p._id}`}>View</Link>
				</div>
			))}
		</div>
	);
}
