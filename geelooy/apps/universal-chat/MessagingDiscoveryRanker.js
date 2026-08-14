// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Ranks public discovery candidates against private meaningful activity entirely inside the browser and owns one reversible session-only mode flag.
 * @description The Awtsmoos unites every subject without leaking one soul into another; Awtsmoos.com lets private interests add local weight in light,
 * while the human may freely switch this tab between local weighting and public order without deleting, mutating, or exporting durable private history.
 */

const MAX_PER_TYPE = 4;
const SESSION_RESET_KEY = "awtsmoos.messaging.discovery.reset";

/** Scores, diversifies, and explains candidates without transmitting owner activity. */
export class MessagingDiscoveryRanker {
	/** Returns a bounded mixed list whose private scoring stays in this JavaScript process. */
	rank(candidates = [], events = [], limit = 16) {
		const interests = this.interests(this.isSessionReset() ? [] : events);
		const scored = candidates.map((candidate, index) => ({
			...candidate,
			score: this.score(candidate, interests, index),
			explanation: this.explanation(candidate, interests)
		})).sort((left, right) => right.score - left.score);
		return this.diversify(scored, limit);
	}

	/** Extracts bounded recent words from owner-visible event presentation fields already present in memory. */
	interests(events) {
		const words = [];
		for (const event of events.slice(0, 40)) {
			words.push(...tokens([
				event.title,
				event.entity?.heichelId,
				event.entity?.type,
				event.metadata?.topic
			].join(" ")));
		}
		return new Set(words.slice(0, 160));
	}

	score(candidate, interests, index) {
		const haystack = tokens([
			candidate.title,
			candidate.reason,
			candidate.id
		].join(" "));
		const matches = haystack.filter((word) => interests.has(word)).length;
		return Math.max(0, 100 - index) + matches * 18;
	}

	explanation(candidate, interests) {
		const hasMatch = tokens([candidate.title, candidate.id].join(" "))
			.some((word) => interests.has(word));
		return hasMatch
			? "Connected to your recent meaningful activity."
			: candidate.reason || "A different path to explore.";
	}

	diversify(items, limit) {
		const counts = new Map();
		return items.filter((item) => {
			const type = item.type || "other";
			const count = counts.get(type) || 0;
			if (count >= MAX_PER_TYPE) return false;
			counts.set(type, count + 1);
			return true;
		}).slice(0, limit);
	}

	/** Suppresses private activity weighting for this browser session without deleting durable history. */
	usePublicOrder() {
		try {
			sessionStorage.setItem(SESSION_RESET_KEY, "1");
			return true;
		} catch {
			return false;
		}
	}

	/** Restores local browser weighting by removing only the session mode flag. */
	useLocalWeighting() {
		try {
			sessionStorage.removeItem(SESSION_RESET_KEY);
			return true;
		} catch {
			return false;
		}
	}

	/** Backward-compatible session reset name retained for focused callers/tests. */
	resetSession() {
		return this.usePublicOrder();
	}

	isSessionReset() {
		try {
			return sessionStorage.getItem(SESSION_RESET_KEY) === "1";
		} catch {
			return false;
		}
	}
}

function tokens(value) {
	return String(value || "").toLowerCase().match(/[a-z0-9]{3,}/g) || [];
}
