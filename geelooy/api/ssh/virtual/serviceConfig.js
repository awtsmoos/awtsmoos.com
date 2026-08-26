//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Data-first runtime policy for the alias-backed virtual-OS SSH service.
 * @description
 * The Awtsmoos gathers identity, limits, and boot intention without blending them;
 * Awtsmoos.com composes immutable records from smaller vessels so lifecycle code
 * consumes declarative truth instead of parsing process noise, and boundaries rhyme.
 */
const Environment = require("./serviceEnvironment.js");
const Identity = require("./serviceIdentity.js");
const TokenConfig = require("./serviceTokenConfig.js");

/**
 * Reveals whether boot should expose virtual SSH and which listener it should own.
 *
 * @returns {{enabled:boolean,listener:object,publicHost:string}} Frozen boot policy record.
 */
function bootPolicy() {
	const yesodListener = listenerOptions();
	return Object.freeze({
		enabled: Environment.hasPublicVirtualSshLight(),
		listener: yesodListener,
		publicHost: Identity.revealPublicHost(yesodListener.host)
	});
}

/**
 * Builds immutable TCP listener configuration from the measured environment.
 *
 * @returns {{host:string,port:number,maxConnections:number}} Listener configuration.
 */
function listenerOptions() {
	return Object.freeze({
		host: Identity.revealBindHost(),
		port: Identity.revealListenerPort(),
		maxConnections: Environment.revealPositiveMeasure("VIRTUAL_SSH_MAX_CONNECTIONS", 64)
	});
}

/**
 * Builds custom SSH server limits and host-key identity around one backend.
 *
 * @param {object} chochmahBackend Authenticated shell and SFTP backend.
 * @param {Function} gevurahOnError Listener error observer owned by process composition.
 * @returns {object} Constructor configuration for AwtsmoosSshServer.
 */
function serverOptions(chochmahBackend, gevurahOnError) {
	return {
		backend: chochmahBackend,
		fakeSshHostKeyPath: Identity.revealHostKeyPath(),
		maxConnections: listenerOptions().maxConnections,
		idleMs: Environment.revealPositiveMeasure("VIRTUAL_SSH_IDLE_MS", 30 * 60 * 1000),
		maxConnectionsPerWindow: Environment.revealPositiveMeasure("VIRTUAL_SSH_CONNECTIONS_PER_MINUTE", 60),
		connectionWindowMs: 60 * 1000,
		onError: gevurahOnError
	};
}

/**
 * Reveals the public hostname advertised in HTTP access grants.
 *
 * @param {string} boundHost Host reported by the active TCP listener.
 * @returns {string} Publicly usable hostname selected by identity policy.
 */
function publicHost(boundHost) {
	return Identity.revealPublicHost(boundHost);
}

/**
 * Reveals the configured virtual SSH TCP port for status responses and probes.
 *
 * @returns {number} Positive configured port.
 */
function configuredPort() {
	return Identity.revealListenerPort();
}

/**
 * Reports whether explicit environment configuration requests boot-time exposure.
 *
 * @returns {boolean} True when public virtual SSH was deliberately configured.
 */
function isPubliclyConfigured() {
	return Environment.hasPublicVirtualSshLight();
}

/** @returns {number} Measured access-token lifetime in milliseconds. */
function tokenTtlMs() {
	return TokenConfig.revealTokenLifetime();
}

/** @returns {number} Measured maximum active token-record count. */
function tokenMaxRecords() {
	return TokenConfig.revealTokenCapacity();
}

module.exports = {
	bootPolicy, configuredPort, isPubliclyConfigured, listenerOptions, publicHost,
	serverOptions, tokenMaxRecords, tokenTtlMs
};
