//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module AuthoritativeWorldHost
 * @description
 * Shared worlds on Awtsmoos.com accept only authenticated, role-authorized commands and publish revisioned projections. The Awtsmoos is sovereign; clients submit intention rather than owning resources, rulings, or time.
 */
import { RolePolicy } from '../../js/multiplayer/role-policy.js';
import { InterestProjector } from '../../js/multiplayer/interest-projector.js';

export class AuthoritativeWorldHost {
	/**
	 * @param {object} kernel Shared living-world kernel.
	 * @param {object} sessions Session validator.
	 */
	constructor(kernel, sessions) {
		this.kernel = kernel;
		this.sessions = sessions;
		this.policy = new RolePolicy();
		this.projector = new InterestProjector();
		this.members = new Map();
		this.audit = [];
	}

	/**
	 * @param {object} credentials Session credentials.
	 * @param {string} role Cooperative role.
	 * @param {number} now Current epoch milliseconds.
	 * @returns {object} Membership projection.
	 */
	connect(credentials, role, now = Date.now()) {
		const session = this.sessions.validate(credentials.sessionId, credentials.token, now);
		const membership = { sessionId: session.sessionId, accountId: session.accountId, role };
		this.members.set(session.sessionId, membership);
		this.record('member_connected', membership);
		return { ...membership, capabilities: this.policy.capabilities(role) };
	}

	/**
	 * @param {object} credentials Session credentials.
	 * @param {object} command Validated command intent.
	 * @param {number} now Current epoch milliseconds.
	 * @returns {object} Authoritative command result.
	 */
	submit(credentials, command, now = Date.now()) {
		const session = this.sessions.validate(credentials.sessionId, credentials.token, now);
		const member = this.membership(session.sessionId);
		if (command.actorId !== session.accountId || !this.policy.allows(member.role, command.type)) {
			this.record('command_rejected', { sessionId: session.sessionId, commandId: command.commandId });
			throw new Error('AuthoritativeWorldHost: command is unauthorized');
		}
		const result = this.kernel.process(command);
		this.record('command_accepted', { commandId: command.commandId, revision: result.state.revision });
		return {
			...result,
			state: this.projector.state(result.state, member.role),
			events: this.projector.events(result.events, member.role)
		};
	}

	membership(sessionId) {
		const member = this.members.get(sessionId);
		if (!member) {
			throw new Error('AuthoritativeWorldHost: session is not a world member');
		}
		return { ...member };
	}

	snapshotFor(sessionId) {
		const member = this.membership(sessionId);
		return this.projector.state(this.kernel.snapshot(), member.role);
	}

	eventsSince(sessionId, revision) {
		const member = this.membership(sessionId);
		return this.projector.events(this.kernel.events().filter(event => event.revision > revision), member.role);
	}

	rawSnapshot() { return this.kernel.snapshot(); }
	rawEvents() { return this.kernel.events(); }
	auditLog() { return this.audit.map(item => ({ ...item })); }

	record(type, payload) {
		this.audit.push({ sequence: this.audit.length + 1, type, payload: { ...payload } });
	}
}
