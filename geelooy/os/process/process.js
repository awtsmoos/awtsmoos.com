// B"H

function processId() {
	return `pid:${Date.now().toString(36)}:${Math.random().toString(36).slice(2, 8)}`;
}

function restartPolicy(value = "never") {
	return ["never", "on-failure", "always"].includes(value) ? value : "never";
}

/**
 * B"H — A process is a durable identity, not merely a window title. Ownership,
 * health, ports, restart intention, and last heartbeat make its life inspectable
 * by humans and agents without pretending a stopped vessel is still alive.
 */
export function processRecord(input = {}) {
	const now = new Date().toISOString();
	return {
		pid: input.pid || processId(),
		app: input.app || input.programId || "app",
		title: input.title || input.app || "Process",
		kind: input.kind || "application",
		owner: input.owner || input.agentSessionId || "awtsmoos-os-user",
		agentSessionId: input.agentSessionId || null,
		logicalAgentId: input.logicalAgentId || null,
		singletonKey: input.singletonKey || null,
		windows: [...(input.windows || [])],
		ports: [...new Set((input.ports || []).map(String))],
		cwd: input.cwd || "/",
		env: { ...(input.env || {}) },
		permissions: [...(input.permissions || ["read"])],
		restartPolicy: restartPolicy(input.restartPolicy),
		restartCount: Number(input.restartCount || 0),
		maxRestarts: Math.max(0, Number(input.maxRestarts ?? 3)),
		health: input.health || "starting",
		status: input.status || "running",
		startedAt: input.startedAt || now,
		lastHeartbeatAt: input.lastHeartbeatAt || now,
		updatedAt: now,
		stoppedAt: input.stoppedAt || null,
		exitCode: input.exitCode ?? null,
		stopReason: input.stopReason || null
	};
}

export function touchProcess(process, patch = {}) {
	Object.assign(process, patch, { updatedAt: new Date().toISOString() });
	return process;
}
