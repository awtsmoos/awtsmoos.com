// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file Names every startup and runtime dependency explicitly.
	* @description
	* The Awtsmoos renews each imported vessel without concealing its source.
	* Awtsmoos.com keeps connection isolation and project-root readiness testable.
	*/
module.exports = {
	config: require("../config.js"),
	makeLogger: require("../log.js").makeLogger,
	startLocalApiServer: require("../local-api.js").startLocalApiServer,
	openHostedControl: require("../open.js").openHostedControl,
	FsExecutor: require("../../tools/fs/executor/index.js"),
	handleFs: require("../../tools/fs/index.js").handleFs,
	handleCommand: require("../../tools/command/index.js").handleCommand,
	handleChrome: require("../../tools/chrome/index.js").handleChrome,
	handleRelay: require("../../tools/relay/index.js").handleRelay,
	handleStreaming: require("../../tools/streaming/index.js").handleStreaming,
	CommandScheduler: require("../../tools/fs/commandJob/scheduler.js"),
	CommandReconciliation: require("../../tools/fs/commandJob/crossRootReconciler.js"),
	DeviceStateRoot: require("../../tools/fs/deviceStateRoot.js"),
	AGENT_VERSION: require("../../tools/fs/actions.js").AGENT_VERSION,
	inlineLimit: require("../response-size.js").inlineLimit,
	DeviceIdentity: require("../deviceIdentity/index.js"),
	HistoryCleanup: require("./history-cleanup.js"),
	ProjectRootHealth: require("./project-root-health.js"),
	Limits: require("./limits.js"),
	Kind: require("./kind.js"),
	Memory: require("./memory.js"),
	Envelope: require("./envelope.js"),
	Correlation: require("./correlation.js"),
	Send: require("./safe-send.js"),
	Proxy: require("./local-proxy.js"),
	Boot: require("./boot-resume-loop.js"),
	WebsiteMissionRecovery: require("../../tools/fs/actionGroups/websiteAgents/runner.js"),
	Continue: require("./continuation-loop.js"),
	Priority: require("./priority.js"),
	Updates: require("./background-update.js"),
	Circuit: require("./circuit-breaker.js"),
	ActionStream: require("./action-stream.js"),
	RetryRegistry: require("./request-retry-registry.js"),
	Lag: require("./event-loop-lag.js"),
	ConnectionVessel: require("../connection-vessel/controller.js"),
	createSupervisor: require("./worker-supervisor.js").createSupervisor
};
