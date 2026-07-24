//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module UniverseProgress
 * @description
 * Seven efforts now restore one remembered city on Awtsmoos.com. The Awtsmoos
 * is beyond all totals, yet saved light, rescued names, and daily variety let
 * every finite victory leave a visible kindness instead of vanishing at reset.
 */
export class UniverseProgress {
	constructor(gameIds, storage = window.localStorage) {
		this.gameIds = gameIds;
		this.storage = storage;
		this.key = 'awtsmoos-seven-worlds-v1';
		this.data = this.load();
		this.ensureDaily();
	}

	game(id) {
		return { best: 0, mastery: 0, plays: 0, stars: 0, dailyBest: 0, ...this.data.games[id] };
	}

	record(id, result, mode = 'solo') {
		const current = this.game(id);
		const score = Math.max(0, Math.round(result.score || 0));
		const stars = this.starsFor(result);
		const mastery = Math.min(100, stars * 18 + Math.floor(score / 120));
		this.data.games[id] = {
			best: Math.max(current.best, score),
			mastery: Math.max(current.mastery, mastery),
			plays: current.plays + 1,
			stars: Math.max(current.stars, stars),
			dailyBest: mode === 'daily' ? Math.max(current.dailyBest, score) : current.dailyBest
		};
		this.rememberCity(result, stars);
		this.rememberDaily(id);
		this.save();
		return this.game(id);
	}

	city() {
		const restored = this.gameIds.filter(id => this.game(id).plays > 0).length;
		return {
			light: this.data.city.light,
			restored,
			rescuedNames: [...this.data.city.rescuedNames]
		};
	}

	daily() {
		this.ensureDaily();
		const worlds = [...this.data.daily.worlds];
		return { date: this.data.daily.date, worlds, goal: 3, complete: worlds.length >= 3 };
	}

	legacy() {
		const mastery = this.gameIds.reduce((total, id) => total + this.game(id).mastery, 0);
		return { mastery, level: 1 + Math.floor(mastery / 100), complete: mastery === 700, cityLight: this.data.city.light };
	}

	starsFor(result) {
		if (result.won === false) return Math.max(0, Math.min(2, result.stars || 0));
		return Math.max(1, Math.min(3, result.stars || 1));
	}

	rememberCity(result, stars) {
		this.data.city.light += stars * 10;
		for (const name of result.memories || []) {
			if (!this.data.city.rescuedNames.includes(name)) this.data.city.rescuedNames.push(name);
		}
		this.data.city.rescuedNames = this.data.city.rescuedNames.slice(-12);
	}

	rememberDaily(id) {
		this.ensureDaily();
		const wasComplete = this.data.daily.worlds.length >= 3;
		if (!this.data.daily.worlds.includes(id)) this.data.daily.worlds.push(id);
		if (!wasComplete && this.data.daily.worlds.length >= 3) this.data.city.light += 50;
	}

	ensureDaily() {
		const date = new Date().toISOString().slice(0, 10);
		if (this.data.daily.date !== date) this.data.daily = { date, worlds: [] };
	}

	load() {
		try {
			const saved = JSON.parse(this.storage.getItem(this.key));
			if (saved?.games) return normalize(saved);
		} catch {
			// A blocked or damaged store yields a clean city.
		}
		return normalize({ games: {} });
	}

	save() {
		try {
			this.storage.setItem(this.key, JSON.stringify(this.data));
		} catch {
			// The active city remains playable when persistence is unavailable.
		}
	}
}

function normalize(saved) {
	return {
		version: 2,
		games: saved.games || {},
		city: { light: 0, rescuedNames: [], ...(saved.city || {}) },
		daily: { date: '', worlds: [], ...(saved.daily || {}) }
	};
}
