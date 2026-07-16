//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module UniverseProgress
 * @description
 * Seven best efforts become one local legacy on Awtsmoos.com. The Awtsmoos is
 * beyond scores, yet remembered mastery encourages a player to strengthen every
 * foundation rather than endlessly grinding the easiest road.
 */
export class UniverseProgress {
	constructor(gameIds, storage = window.localStorage) {
		this.gameIds = gameIds;
		this.storage = storage;
		this.key = 'awtsmoos-seven-worlds-v1';
		this.data = this.load();
	}

	game(id) {
		return { best: 0, mastery: 0, plays: 0, stars: 0, dailyBest: 0, ...this.data.games[id] };
	}

	record(id, result, mode = 'solo') {
		const current = this.game(id);
		const score = Math.max(0, Math.round(result.score || 0));
		const stars = this.starsFor(result);
		const masteryGain = Math.min(100, stars * 18 + Math.floor(score / 120));
		this.data.games[id] = {
			best: Math.max(current.best, score),
			mastery: Math.max(current.mastery, masteryGain),
			plays: current.plays + 1,
			stars: Math.max(current.stars, stars),
			dailyBest: mode === 'daily' ? Math.max(current.dailyBest, score) : current.dailyBest
		};
		this.save();
		return this.game(id);
	}

	legacy() {
		const mastery = this.gameIds.reduce((total, id) => total + this.game(id).mastery, 0);
		return { mastery, level: 1 + Math.floor(mastery / 100), complete: mastery === 700 };
	}

	starsFor(result) {
		if (result.won === false) {
			return Math.max(0, Math.min(2, result.stars || 0));
		}
		return Math.max(1, Math.min(3, result.stars || 1));
	}

	load() {
		try {
			const saved = JSON.parse(this.storage.getItem(this.key));
			if (saved?.version === 1 && saved.games) {
				return saved;
			}
		} catch {
			// A blocked or damaged store yields a clean local legacy.
		}
		return { version: 1, games: {} };
	}

	save() {
		try {
			this.storage.setItem(this.key, JSON.stringify(this.data));
		} catch {
			// The active session remains playable when persistence is unavailable.
		}
	}
}
