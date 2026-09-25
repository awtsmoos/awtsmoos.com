// B"H
// Boruch Hashem
// Blessed is He

const { createConnectionMessages } = require("./main-connection-messages.js");
const Scheduler = require("./main-reconnect-scheduler.js");
const { wireConnectionSocket } = require("./main-connection-socket.js");
const LivenessSettings = require("../ws/transportLivenessSettings.js");
const RouteElector = require("./routeElector.js");

/**
 * @file Owns socket generations while a separate vessel owns reconnect time.
 * @description
 * The Awtsmoos renews one connection generation at a time, never two in disguise.
 * Awtsmoos.com cancels yesterday's timer before today's dial, so stale darkness
 * cannot awaken later and dethrone the living socket that already returned.
 */
function createConnectionRuntime(dependencies) {
	let reconnect = null;

	function clearReconnectTimer() {
		return reconnect.clear();
	}

	function closeActiveSocket(force = true) {
		const active = dependencies.state.activeWs;
		dependencies.state.activeWs = null;
		if (!active) {
			return;
		}
		try {
			active.close(force);
		} catch {}
	}

	function connect() {
		clearReconnectTimer();
		const config = dependencies.loadConfig();
		// B13: the new generation dials the elected route (pass-through when a
		// single route is configured — behavior identical to today).
		const route = electRoute(config);
		const generation = dependencies.state.generation + 1;
		dependencies.state.generation = generation;
		dependencies.state.tunnelName = route.tunnelName;
		dependencies.state.registrationConfirmed = false;
		dependencies.state.registrationRejected = false;
		dependencies.state.registrationFailureReason = "";
		dependencies.state.replacementRequested = false;
		closeActiveSocket(true);
		dependencies.Receipt?.write("connecting", {
			tunnelId: dependencies.state.tunnelId || "",
			tunnelName: route.tunnelName,
			routeName: route.name,
			agentVersion: dependencies.agentVersion || "",
			generation,
			reason: ""
		});
		dependencies.log("info", `B"H connecting to ${route.wsUrl} as ${route.tunnelName} (route ${route.name})`);
		// B9: adapt the new generation's death threshold to the flap cadence
		// the previous generations observed; falls back to defaults when the
		// history is sparse or the line has been quiet.
		const livenessOptions = LivenessSettings.adaptive(
			dependencies.state.recentFailures,
			dependencies.livenessOptions || {},
			dependencies.env
		);
		if (livenessOptions.adaptive && livenessOptions.adaptive.active) {
			dependencies.log("info",
				`B"H adaptive liveness: deadIdleMs=${livenessOptions.deadIdleMs}ms ` +
				`(flap cadence ~${Math.round(livenessOptions.adaptive.medianIntervalMs)}ms)`);
		}
		const ws = new dependencies.TinyWebSocket(route.wsUrl, { liveness: livenessOptions });
		dependencies.state.activeWs = ws;
		const messages = createConnectionMessages({
			...dependencies,
			clearReconnect: clearReconnectTimer
		});
		wireConnectionSocket({
			dependencies,
			ws,
			config,
			generation,
			messages,
			owns,
			scheduleReconnect
		});
		ws.connect();
		return ws;
	}

	function owns(ws, generation) {
		return dependencies.state.activeWs === ws &&
			dependencies.state.generation === generation;
	}

	function scheduleReconnect(reason = "socket_closed") {
		return reconnect.schedule(reason, dependencies.state.generation);
	}

	/**
	 * B13: chooses which configured route the new generation dials. With fewer
	 * than two configured routes this is a pass-through — behavior identical to
	 * today. With two or more, the route elector promotes a healthy rescue
	 * route after sustained primary failure and demotes back after sustained
	 * primary recovery; every transition is logged and reversible. Fresh
	 * my-device probes arrive via dependencies.state.routeProbes (written by
	 * the out-of-band route prober); absent probes hold the current election.
	 */
	function electRoute(config) {
		const base = { name: "primary", tunnelName: config.tunnelName, wsUrl: config.wsUrl };
		const configured = Array.isArray(config.routes) ? config.routes : [];
		if (configured.length < 2) return base;
		if (!dependencies.state.routeElector) {
			dependencies.state.routeElector = RouteElector.createRouteElector({
				routes: configured,
				log: (level, message) => dependencies.log?.(level, message)
			});
		}
		const elector = dependencies.state.routeElector;
		const probes = dependencies.state.routeProbes;
		if (probes && typeof probes === "object") elector.observe(probes);
		const elected = elector.current();
		return {
			name: elected.name || base.name,
			tunnelName: elected.tunnelName || base.tunnelName,
			wsUrl: elected.wsUrl || base.wsUrl
		};
	}

	reconnect = Scheduler.createReconnectScheduler(dependencies, connect);
	return {
		clearReconnectTimer,
		closeActiveSocket,
		connect,
		scheduleReconnect
	};
}

module.exports = {
	createConnectionRuntime
};
