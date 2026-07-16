//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ContractGuard
 * @description
 * The Awtsmoos contains no confusion; Awtsmoos.com therefore refuses malformed intent and malformed history before either can enter the living world.
 */
export class ContractGuard {
	/**
	 * @param {object} command Candidate command envelope.
	 * @returns {object} Validated command.
	 */
	command(command) {
		this.object(command, 'command');
		this.text(command.commandId, 'command.commandId');
		this.text(command.type, 'command.type');
		this.text(command.actorId, 'command.actorId');
		this.integer(command.version, 'command.version');
		this.object(command.payload, 'command.payload');
		return command;
	}

	/**
	 * @param {object} event Candidate event envelope.
	 * @returns {object} Validated event.
	 */
	event(event) {
		this.object(event, 'event');
		this.text(event.eventId, 'event.eventId');
		this.text(event.type, 'event.type');
		this.text(event.commandId, 'event.commandId');
		this.integer(event.version, 'event.version');
		this.integer(event.revision, 'event.revision');
		this.object(event.payload, 'event.payload');
		return event;
	}

	object(value, label) {
		if (!value || typeof value !== 'object' || Array.isArray(value)) {
			throw new Error(`${label} must be an object`);
		}
	}

	text(value, label) {
		if (typeof value !== 'string' || !value.trim()) {
			throw new Error(`${label} must be nonempty text`);
		}
	}

	integer(value, label) {
		if (!Number.isInteger(value) || value < 0) {
			throw new Error(`${label} must be a nonnegative integer`);
		}
	}
}
