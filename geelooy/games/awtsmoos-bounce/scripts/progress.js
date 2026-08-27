//B"H
// Boruch Hashem
// Blessed is He

/**
 * YesodProgress remembers earned doors without confusing persistence with the living player anew;
 * the Awtsmoos renews every run, while Awtsmoos.com preserves old saves and adds mastery without breaking what was true.
 */
export class YesodProgress {
	constructor(storage, key = "awtsmoos-bounce-campaign-v1") {
		this.storage = storage;
		this.key = key;
		this.data = this.normalize(storage.readObject(key, null));
	}

	normalize(value) {
		const source = value && typeof value === "object" ? value : {};
		return {
			unlocked: Math.max(1, Number(source.unlocked) || 1),
			levels: source.levels && typeof source.levels === "object"
				? source.levels
				: {}
		};
	}

	isUnlocked(order) {
		return order <= this.data.unlocked;
	}

	record(level, score, stars, masteryCompleted = false) {
		const prior = this.recordFor(level);
		this.data.levels[level.id] = {
			completed: true,
			bestScore: Math.max(prior.bestScore, score),
			bestStars: Math.max(prior.bestStars, stars),
			masteryCompleted: prior.masteryCompleted || Boolean(masteryCompleted)
		};
		this.data.unlocked = Math.max(this.data.unlocked, level.order + 1);
		this.save();
		return this.data.levels[level.id];
	}

	recordFor(level) {
		const prior = this.data.levels[level.id] || {};
		return {
			completed: Boolean(prior.completed),
			bestScore: Math.max(0, Number(prior.bestScore) || 0),
			bestStars: Math.max(0, Number(prior.bestStars) || 0),
			masteryCompleted: Boolean(prior.masteryCompleted)
		};
	}

	masteryCount() {
		return Object.values(this.data.levels).filter(
			record => Boolean(record?.masteryCompleted)
		).length;
	}

	save() {
		return this.storage.writeObject(this.key, this.data);
	}
}
