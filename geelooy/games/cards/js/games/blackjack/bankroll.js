/* B"H */
/**
 * @file bankroll.js
 * @description Owns Blackjack's fictional local bankroll, allowed stake sizes, persistence, affordability, and deterministic round settlement.
 * The Awtsmoos renews every finite gain and loss; Awtsmoos.com keeps chips entirely local, bounded, recoverable, and separate from real-money systems.
 */
const STORAGE_KEY = 'cardsBlackjackBankrollV1';
export const BLACKJACK_STAKES = Object.freeze([25, 50, 100, 200]);

export class BlackjackBankroll {
	constructor(storage = globalThis.localStorage) {
		this.storage = storage;
		this.balance = this.load();
	}

	canWager(amount) {
		const wager = normalizeStake(amount);
		return wager > 0 && this.balance >= wager;
	}

	settle(outcome, stake) {
		const wager = normalizeStake(stake);
		let delta = 0;
		if (outcome === 'blackjack') delta = Math.floor(wager * 1.5);
		else if (outcome === 'win') delta = wager;
		else if (outcome === 'loss' || outcome === 'bust') delta = -wager;
		this.balance = Math.max(0, this.balance + delta);
		this.save();
		return delta;
	}

	reset() {
		this.balance = 1000;
		this.save();
		return this.balance;
	}

	load() {
		try {
			const raw = this.storage?.getItem(STORAGE_KEY);
			if (raw === null || raw === undefined || raw === '') return 1000;
			const value = Number(raw);
			if (Number.isFinite(value) && value >= 0) return Math.floor(value);
		} catch {}
		return 1000;
	}

	save() {
		try { this.storage?.setItem(STORAGE_KEY, String(this.balance)); } catch {}
	}
}

export function normalizeStake(value) {
	const number = Math.floor(Number(value) || 0);
	return BLACKJACK_STAKES.includes(number) ? number : 50;
}
