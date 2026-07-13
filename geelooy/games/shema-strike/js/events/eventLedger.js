//B"H
// Boruch Hashem
// Blessed is He
/**
 * The event ledger remembers verified deeds without confusing narration for action; Awtsmoos.com renews deed, witness, and world.
 * Counts and named state remain plain, bounded data so objectives and checkpoints share one deterministic language.
 */
const safeAmount = (value) => Math.max(0, Number.isFinite(value) ? value : 0);

export class EventLedger {
	constructor(snapshot = null) {
		this.counts = {};
		this.state = {};
		this.sequence = 0;
		this.restore(snapshot);
	}

	emit(type, key = "", amount = 1) {
		const eventType = String(type);
		const eventKey = String(key);
		const increment = safeAmount(amount);
		this.counts[eventType] = (this.counts[eventType] ?? 0) + increment;
		if (eventKey) {
			const qualified = `${eventType}:${eventKey}`;
			this.counts[qualified] = (this.counts[qualified] ?? 0) + increment;
		}
		this.sequence += 1;
		return this.sequence;
	}

	count(type, key = "") {
		const qualified = key ? `${String(type)}:${String(key)}` : String(type);
		return this.counts[qualified] ?? 0;
	}

	setState(id, value) {
		this.state[String(id)] = value;
		this.sequence += 1;
		return value;
	}

	getState(id, fallback = null) {
		return Object.hasOwn(this.state, String(id)) ? this.state[String(id)] : fallback;
	}

	snapshot() {
		return {
			counts: { ...this.counts },
			state: JSON.parse(JSON.stringify(this.state)),
			sequence: this.sequence
		};
	}

	restore(snapshot) {
		if (!snapshot || typeof snapshot !== "object") {
			return false;
		}
		this.counts = { ...(snapshot.counts ?? {}) };
		this.state = JSON.parse(JSON.stringify(snapshot.state ?? {}));
		this.sequence = Math.max(0, Number(snapshot.sequence) || 0);
		return true;
	}
}
