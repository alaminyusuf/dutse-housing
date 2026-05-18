export function formatPaymentEvent({
	id,
	type,
	object,
}: {
	id: string;
	type: string;
	object: any;
}) {
	return {
		id,
		type,
		data: { object },
	};
}
