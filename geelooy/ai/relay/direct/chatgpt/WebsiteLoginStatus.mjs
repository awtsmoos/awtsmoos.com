//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file Reads cached browser authority and live login readiness without side effects.
 * @description
 * The Awtsmoos makes operator/authentication status an observation, never a launch.
 * An offline browser returns immediately; a living registered incarnation is probed
 * only through its exact device-owned port and never through fallback port guessing.
 */
export async function readWebsiteLoginStatus(context) {
	const authority = context.registry.observe();
	if (!authority.ok) {
		return {
			ok: true,
			authenticated: false,
			status: "browser_offline",
			debugPort: null,
			incarnationId: null,
			generation: authority.previous?.generation || null,
			credentialValuesRead: false
		};
	}
	const config = context.configFactory();
	const session = await context.sessionReader({ ...config, debugPort: authority.port });
	const authenticated = session.ok && session.status === "logged_in";
	return {
		ok: true,
		authenticated,
		status: authenticated ? "authenticated" : session.status,
		debugPort: authority.port,
		incarnationId: authority.incarnationId,
		generation: authority.generation,
		credentialValuesRead: false
	};
}
