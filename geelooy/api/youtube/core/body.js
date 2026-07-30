// B"H
async function body($i) {
	const input = $i.$_POST || {};
	if (!input.__raw_body__) return input;
	try {
		return JSON.parse(Buffer.from(input.__raw_body__).toString('utf8'));
	} catch {
		return {};
	}
}

module.exports = { body };
