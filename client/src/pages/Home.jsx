import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function Home() {
	const [propsList, setPropsList] = useState([]);
	useEffect(() => {
		axios
			.get("/api/properties")
			.then((res) => setPropsList(res.data))
			.catch(console.error);
	}, []);
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
