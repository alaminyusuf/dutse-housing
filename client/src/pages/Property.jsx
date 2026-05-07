import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function Property() {
	const { id } = useParams();
	const [prop, setProp] = useState(null);
	const [token, setToken] = useState(localStorage.getItem("token"));

	useEffect(() => {
		axios
			.get(`/api/properties/${id}`)
			.then((res) => setProp(res.data))
			.catch(console.error);
	}, [id]);

	const buy = async () => {
		if (!token) return alert("Please login/register first");
		try {
			const res = await axios.post(
				"/api/checkout/create-session",
				{ propertyId: id },
				{ headers: { Authorization: `Bearer ${token}` } },
			);
			if (res.data && res.data.url) {
				window.location.href = res.data.url;
			}
		} catch (err) {
			console.error(err);
			alert("Checkout error");
		}
	};

	if (!prop) return <div>Loading...</div>;
	return (
		<div>
			<h2>{prop.title}</h2>
			<p>
				{prop.houseNumber} — {prop.location}
			</p>
			<p>${prop.price}</p>
			<p>{prop.description}</p>
			<button onClick={buy}>Buy</button>
		</div>
	);
}
