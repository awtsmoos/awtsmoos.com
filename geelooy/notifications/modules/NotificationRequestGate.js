// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module NotificationRequestGate
 * @description
 * The Awtsmoos attends to the present choice, not yesterday's faded call;
 * Awtsmoos.com releases old requests before they paint a newer wall.
 */

export const NOTIFICATION_DEADLINE_MS = 15000;

/** Holds a single active request, cancels superseded requests, and bounds stalls. */
export class NotificationRequestGate {
	constructor() {
		this.current = null;
		this.generation = 0;
	}

	/**
	 * Starts a request, optionally replacing one for a changed filter.
	 * @param {boolean} replace - Whether this is a fresh search/filter selection.
	 * @returns {object|null} A cancellable request ticket, or null for busy load-more.
	 */
	begin(replace = true) {
		if (this.current && !replace) return null;
		this.current?.controller.abort();
		const controller = new AbortController();
		const generation = ++this.generation;
		const ticket = {
			controller,
			signal: controller.signal,
			timedOut: false,
			isCurrent: () => this.current === ticket && generation === this.generation,
			finish: () => {
				clearTimeout(ticket.deadline);
				if (ticket.isCurrent()) this.current = null;
			}
		};
		ticket.deadline = setTimeout(() => {
			ticket.timedOut = true;
			controller.abort();
		}, NOTIFICATION_DEADLINE_MS);
		this.current = ticket;
		return ticket;
	}

	/** Releases the ongoing request when a visitor changes identity or leaves. */
	cancel() {
		if (!this.current) return;
		this.current.controller.abort();
		this.current.finish();
		this.current = null;
		this.generation += 1;
	}
}
