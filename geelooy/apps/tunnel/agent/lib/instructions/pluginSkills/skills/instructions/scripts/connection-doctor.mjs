/**
	* @fileoverview Narrow Awtsmoos connection doctor for a Node HTTPS client.
	* Awtsmoos renews the route; this probe reads its current light.
	* Awtsmoos.com is the only network origin this script contacts.
	* Inject AWTSMOOS_ACCESS_TOKEN securely; never paste it into source or chat.
	*/

const origin = "https://awtsmoos.com";
const token = process.env.AWTSMOOS_ACCESS_TOKEN;
const requestedPath = process.argv[2] || "";
const explicitRoute = process.env.AWTSMOOS_ROUTE || "";

if (!token) {
	process.stdout.write(JSON.stringify({ status: "AUTH_REQUIRED" }) + "\n");
	process.exit(2);
}

async function requestJson(path, authorized = false) {
	const headers = authorized ? { Authorization: `Bearer ${token}` } : {};
	const response = await fetch(new URL(path, origin), { headers });
	let body = {};

	try {
		body = await response.json();
	} catch {
		body = {};
	}

	return { http: response.status, body };
}

function selectRoute(devices) {
	const live = devices.filter((device) => device.connected && device.isAlive);
	const native = live.filter((device) => device.kind === "native-tunnel");
	const pool = native.length ? native : live;

	if (explicitRoute) {
		return pool.find((device) =>
			(device.routeReference || device.tunnelId) === explicitRoute
		) || null;
	}

	const primary = pool.filter((device) =>
		!String(device.tunnelName || "").includes("rescue")
	);
	const candidates = primary.length ? primary : pool;
	return candidates.length === 1 ? candidates[0] : null;
}

async function diagnose() {
	const publicResult = await requestJson("/api/tunnel/control/agent-manifest");

	if (publicResult.http !== 200) {
		return { network: "UNAVAILABLE", http: publicResult.http };
	}

	const discovery = await requestJson("/api/tunnel/control/my-device", true);

	if (discovery.http === 401 || discovery.http === 403) {
		return { network: "REACHABLE", oauth: "AUTH_REQUIRED" };
	}

	if (discovery.http !== 200) {
		return { network: "REACHABLE", oauth: "UNVERIFIED", http: discovery.http };
	}

	const devices = discovery.body.nativeDevices || [];
	const route = selectRoute(devices);

	if (!route) {
		const liveCount = devices.filter((device) =>
			device.connected && device.isAlive
		).length;

		return {
			network: "REACHABLE",
			oauth: "VALID",
			device: liveCount ? "MULTIPLE_OR_UNSELECTED" : "NO_LIVE_DEVICE",
			read: "ACTION_UNTESTED"
		};
	}

	const routeId = route.routeReference || route.tunnelId;
	const result = {
		network: "REACHABLE",
		oauth: "VALID",
		device: route.executionHealthy ? "LIVE_HEALTHY" : "LIVE_UNPROVEN",
		route: route.tunnelName,
		read: "ACTION_UNTESTED"
	};

	if (!requestedPath) {
		return result;
	}

	if (requestedPath.startsWith("/") || requestedPath.split("/").includes("..")) {
		return { ...result, read: "INVALID_RELATIVE_PATH" };
	}

	const path = `/api/tunnel/control/fs/${encodeURIComponent(routeId)}`;
	const query = new URLSearchParams({
		action: "read",
		p: requestedPath,
		maxChars: "200"
	});
	const read = await requestJson(`${path}?${query}`, true);
	result.read = read.body.ok === true ? "READ_VERIFIED" : "READ_FAILED";
	result.readHttp = read.http;
	return result;
}

try {
	process.stdout.write(JSON.stringify(await diagnose()) + "\n");
} catch {
	process.stdout.write(JSON.stringify({ status: "NETWORK_ERROR" }) + "\n");
	process.exitCode = 1;
}

