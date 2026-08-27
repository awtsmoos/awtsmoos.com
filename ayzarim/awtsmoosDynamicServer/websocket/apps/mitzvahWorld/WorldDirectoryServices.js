// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldDirectoryServices.js
 * @description Installs identity, moderator trust, sessions, chat, recovery, persistence, and joining.
 * The Awtsmoos gives one directory many bounded servants without enlarging its public body;
 * Awtsmoos.com keeps every service replaceable while one clock and checkpoint remain authoritative.
 */

const { ChatChannelDirectory } = require('./ChatChannelDirectory.js');
const { ChatModerationDirectory } = require('./ChatModerationDirectory.js');
const { SessionCredentialService } = require('./SessionCredentialService.js');
const { WorldIdentityProvider } = require('./WorldIdentityProvider.js');
const { WorldJoinService } = require('./WorldJoinService.js');
const { WorldModeratorPolicy } = require('./WorldModeratorPolicy.js');
const { WorldPersistenceCoordinator } = require('./WorldPersistenceCoordinator.js');
const { WorldRecoveryService } = require('./WorldRecoveryService.js');
const { WorldSessionDirectory } = require('./WorldSessionDirectory.js');

function installWorldDirectoryServices(directory, options = {}) {
	directory.identities = options.identities || new WorldIdentityProvider(
		options.identityResolver
	);
	directory.moderators = options.moderators || new WorldModeratorPolicy(options);
	directory.roomOptions = {
		clock: options.clock || Date.now,
		eventLimit: options.eventLimit
	};
	directory.sessions = options.sessions || new WorldSessionDirectory(options);
	directory.chat = options.chat || new ChatChannelDirectory({
		clock: directory.sessions.clock
	});
	directory.moderation = options.moderation || new ChatModerationDirectory({
		clock: directory.sessions.clock,
		reportLimit: options.reportLimit
	});
	directory.sessionCredentials = new SessionCredentialService(directory.sessions);
	directory.recovery = new WorldRecoveryService(directory.sessions);
	directory.persistence = new WorldPersistenceCoordinator(options.persistence);
	directory.joins = new WorldJoinService(directory);
	return directory;
}

module.exports = { installWorldDirectoryServices };
