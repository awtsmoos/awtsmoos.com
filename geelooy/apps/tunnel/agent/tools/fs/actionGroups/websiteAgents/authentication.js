// B"H

async function inspect(service) {
	if (typeof service?.authenticationStatus === "function") {
		const result = await service.authenticationStatus({ refresh: true });
		return normalize(result);
	}
	if (typeof service?.capability === "function") {
		const result = await service.capability({ refresh: true });
		return normalize(result);
	}
	return { authenticated: true, status: "assumed_by_injected_service" };
}

async function open(service) {
	if (typeof service?.requestLogin !== "function") {
		return { ok: true, opened: false, status: "unsupported_by_injected_service" };
	}
	return service.requestLogin();
}

function normalize(result = {}) {
	const authenticated = result.authenticated === true ||
		result.status === "logged_in" ||
		result.status === "authenticated";
	return {
		authenticated,
		status: authenticated ? "authenticated" : String(result.status || "login_required"),
		debugPort: Number(result.debugPort || result.port || 0) || null
	};
}

module.exports = { inspect, normalize, open };
