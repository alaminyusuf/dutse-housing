import React from "react";
import { Link } from "react-router-dom";

export default function Cancel() {
	return (
		<div>
			<h2>Payment Cancelled</h2>
			<p>
				Your payment was cancelled. You can try again from the property
				page.
			</p>
			<Link to="/">Back to Home</Link>
		</div>
	);
}
