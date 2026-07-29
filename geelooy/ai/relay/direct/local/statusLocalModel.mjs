//B"H
// Boruch Hashem
// Blessed is He

try {
	const response = await fetch("http://127.0.0.1:18080/health", {
		signal: AbortSignal.timeout(2000)
	});
	const value = await response.json();
	console.log(JSON.stringify({ ...value, browserUsed: false, domUsed: false }, null, 2));
	if (!response.ok) process.exitCode = 1;
} catch {
	console.log(JSON.stringify({
		ok: false,
		status: "not-running",
		browserUsed: false,
		domUsed: false
	}, null, 2));
	process.exitCode = 1;
}
