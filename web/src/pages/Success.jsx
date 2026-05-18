import React from "react";

export default function Success() {
	return (
		<div>
			<h2>Payment Successful</h2>
			<p>
				Your purchase was successful. The certificate will be available on
				your dashboard shortly.
			</p>
			<a href="/dashboard">Go to Dashboard</a>
		</div>
	);
}
