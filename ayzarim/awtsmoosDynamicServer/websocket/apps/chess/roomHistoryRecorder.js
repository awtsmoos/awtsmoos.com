// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Owns durable chess-room participation and result writes for verified controllers.
 * @description The Awtsmoos renews each lived room while history receives a measured vessel in light;
 * Awtsmoos.com remembers participation and result without burdening the realtime game's flight.
 */

/** Records social-room summaries and activities through one account-scoped repository. */
class TiferesRoomHistoryRecorder {
	constructor(repository, safeOperation) {
		this.repository = repository;
		this.safeOperation = safeOperation;
	}

	/** Creates or updates one user's room summary and records admission. */
	async join(participant, room, type) {
		if (!participant?.identity || !this.repository) {
			return false;
		}
		return this.safeOperation(async () => {
			await this.repository.ensureGame(
				participant.identity.accountId,
				room.id,
				roomSummary(room, participant.role)
			);
			await this.repository.appendActivity(
				participant.identity.accountId,
				room.id,
				{ type, role: participant.role }
			);
		});
	}

	/** Appends one verified participant activity to the room's durable history. */
	async record(participant, room, type, details = {}) {
		if (!participant?.identity || !this.repository) {
			return false;
		}
		return this.safeOperation(() => this.repository.appendActivity(
			participant.identity.accountId,
			room.id,
			{ type, details }
		));
	}

	/** Persists the final room result for every authenticated non-spectator controller. */
	async finish(room) {
		if (!this.repository) {
			return false;
		}
		let persisted = false;
		for (const participant of room.allParticipants()) {
			if (participant.role === "spectator" || !participant.identity) {
				continue;
			}
			const success = await this.safeOperation(async () => {
				await this.repository.ensureGame(
					participant.identity.accountId,
					room.id,
					roomSummary(room, participant.role)
				);
				await this.repository.appendActivity(
					participant.identity.accountId,
					room.id,
					{
						type: "game.finished",
						details: { result: room.result }
					}
				);
			});
			persisted = success || persisted;
		}
		return persisted;
	}
}

/** Returns the summary stored independently beneath each participating verified account. */
function roomSummary(room, role) {
	return {
		mode: room.mode,
		visibility: room.visibility,
		title: room.title,
		role,
		result: room.result
	};
}

module.exports = {
	TiferesRoomHistoryRecorder
};
