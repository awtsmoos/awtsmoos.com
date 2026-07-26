// B"H
// Boruch Hashem
// Blessed is He

const Config = require("../config.js");
const { makeLogger } = require("../log.js");
const { TinyWebSocket } = require("../ws.js");
const DeviceIdentity = require("../deviceIdentity/index.js");
const DeviceStateRoot = require("../../tools/fs/deviceStateRoot.js");
const { inlineLimit } = require("../response-size.js");
const { nativeRegistrationPacket } = require("../registration.js");
const { createConfigLoader } = require("../runtime/main-config.js");
const Connection = require("../runtime/main-connection.js");
const Registration = require("../runtime/main-registration.js");
const Control = require("../runtime/control-plane.js");
const Replacement = require("../runtime/replacement-policy.js");
const Receipt = require("../runtime/connection-receipt.js");
const Send = require("../runtime/safe-send.js");
const Mailbox = require("./mailbox.js");

/**
	* @file Builds the connection child with the same canonical runtime config as parent.
	* @description
	* The Awtsmoos gives both processes one relay, root, state, and response covenant.
	* Awtsmoos.com never lets a child guess coordinates from incomplete stored fields.
	*/
function createFoundation(callbacks = {}) {
	const loadConfig = createConfigLoader(Config, {
		DeviceStateRoot,
		inlineLimit
	});
	const config = loadConfig();
	const mailbox = Mailbox.createMailbox(config);
	const state = createState(config);
	const workers = { status: () => ({ connectionVessel: true, pid: process.pid }) };
	const registration = Registration.createRegistrationRuntime({
		AGENT_VERSION: process.env.AWTSMOOS_AGENT_VERSION || "",
		DeviceIdentity,
		Limits: require("../runtime/limits.js"),
		Priority: require("../runtime/priority.js"),
		Send,
		nativeRegistrationPacket,
		workers
	});
	const dependencies = {
		Control,
		DeviceIdentity,
		Receipt,
		Replacement,
		Send,
		TinyWebSocket,
		TransportMailbox: mailbox,
		agentVersion: process.env.AWTSMOOS_AGENT_VERSION || "",
		enqueueRequest: callbacks.enqueueRequest,
		exitProcess: callbacks.exitProcess || (code => process.exit(code)),
		loadConfig,
		log: makeLogger(config),
		registerReady: registration.registerReady,
		state,
		stats: callbacks.stats,
		setTimer: setTimeout
	};
	return {
		config,
		connection: Connection.createConnectionRuntime(dependencies),
		dependencies,
		mailbox,
		state
	};
}

function createState(config) {
	return {
		activeWs: null,
		generation: 0,
		lastRegisteredAt: 0,
		pendingResponses: [],
		reconnectAttempt: 0,
		reconnectTimer: null,
		registrationConfirmed: false,
		registrationFailureReason: "",
		registrationRejected: false,
		replacementRequested: false,
		tunnelId: "",
		tunnelName: config.tunnelName,
		wasEverConnected: false
	};
}

module.exports = { createFoundation, createState };
