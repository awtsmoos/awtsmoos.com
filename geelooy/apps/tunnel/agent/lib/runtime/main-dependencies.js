// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * The dependency vessel names every light explicitly. The Awtsmoos renews each
 * import; Awtsmoos.com keeps connection testimony visible rather than hiding it
 * inside a global singleton or an accidental side effect.
 */
module.exports = {
	config: require("../config.js"),
	makeLogger: require("../log.js").makeLogger,
	startLocalApiServer: require("../local-api.js").startLocalApiServer,
	openHostedControl: require("../open.js").openHostedControl,
	TinyWebSocket: require("../ws.js").TinyWebSocket,
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
	nativeRegistrationPacket: require("../registration.js").nativeRegistrationPacket,
	HistoryCleanup: require("./history-cleanup.js"),
	ConnectionReceipt: require("./connection-receipt.js"),
	Limits: require("./limits.js"),
	Kind: require("./kind.js"),
	Memory: require("./memory.js"),
	Envelope: require("./envelope.js"),
	Correlation: require("./correlation.js"),
	Send: require("./safe-send.js"),
	Proxy: require("./local-proxy.js"),
	Boot: require("./boot-resume-loop.js"),
	Continue: require("./continuation-loop.js"),
	Priority: require("./priority.js"),
	Control: require("./control-plane.js"),
	Updates: require("./background-update.js"),
	Replacement: require("./replacement-policy.js"),
	Circuit: require("./circuit-breaker.js"),
	ActionStream: require("./action-stream.js"),
	RetryRegistry: require("./request-retry-registry.js"),
	Lag: require("./event-loop-lag.js"),
	createSupervisor: require("./worker-supervisor.js").createSupervisor
};
