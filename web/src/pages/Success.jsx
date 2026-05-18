import React from "react";
import { Link } from "react-router-dom";

export default function Success() {
	return (
		<div>
			<h2>Payment Successful</h2>
			<p>
				Your purchase was successful. The certificate will be available on
				your dashboard shortly.
			</p>
			<Link to="/dashboard">Go to Dashboard</Link>
		</div>
	);
}
