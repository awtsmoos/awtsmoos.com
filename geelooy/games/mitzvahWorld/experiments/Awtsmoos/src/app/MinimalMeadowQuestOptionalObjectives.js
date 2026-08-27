// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowQuestOptionalObjectives.js
 * @description Tracks nonblocking courage, teaching, and deliberate-loot outcomes during Shlichus.
 * The Awtsmoos lets excellence adorn service without withholding completion; Awtsmoos.com records
 * defeat, correct learning, and distinct recovered corpses only while the mission is actively unfolding.
 */

export class MinimalMeadowQuestOptionalObjectives {
	constructor(runtime, activeStatus, onChange = () => {}) {
		this.runtime = runtime;
		this.activeStatus = activeStatus;
		this.onChange = onChange;
		this.noDefeat = true;
		this.teachingIds = new Set();
		this.lootedIds = new Set();
		this.unsubscribers = [
			runtime.bus.on('player:defeated', () => this.recordDefeat()),
			runtime.bus.on('teaching:answered', event => this.recordTeaching(event)),
			runtime.bus.on('torah:answer-correct', event => this.recordTeaching(event)),
			runtime.bus.on('enemy:looted', event => this.recordLoot(event))
		];
	}

	recordDefeat() {
		if (!this.isActive() || !this.noDefeat) return false;
		this.noDefeat = false;
		this.onChange();
		return true;
	}

	recordTeaching(event = {}) {
		if (!this.isActive() || event.correct === false) return false;
		const id = event.id || event.questionId || `teaching-${this.teachingIds.size + 1}`;
		const before = this.teachingIds.size;
		this.teachingIds.add(id);
		return this.changed(before, this.teachingIds.size);
	}

	recordLoot(event = {}) {
		if (!this.isActive()) return false;
		const id = event.enemyId || event.id || event.actor?.profile?.id;
		if (!id) return false;
		const before = this.lootedIds.size;
		this.lootedIds.add(id);
		return this.changed(before, this.lootedIds.size);
	}

	changed(before, after) {
		if (after <= before) return false;
		this.onChange();
		return true;
	}

	isActive() {
		return ['active', 'ready'].includes(this.activeStatus());
	}

	snapshot(definitions = []) {
		const values = {
			'deliberate-recovery': this.lootedIds.size,
			'unbroken-return': this.noDefeat ? 1 : 0,
			'words-of-light': this.teachingIds.size
		};
		return definitions.map(definition => Object.freeze({
			bonus: definition.bonus,
			complete: values[definition.id] >= definition.count,
			count: definition.count,
			description: definition.description,
			id: definition.id,
			progress: Math.min(definition.count, values[definition.id] || 0)
		}));
	}

	reward(definitions = []) {
		return this.snapshot(definitions).reduce((total, objective) => {
			if (!objective.complete) return total;
			return {
				perutas: total.perutas + (objective.bonus?.perutas || 0),
				xp: total.xp + (objective.bonus?.xp || 0)
			};
		}, { perutas: 0, xp: 0 });
	}

	destroy() {
		for (const unsubscribe of this.unsubscribers) unsubscribe();
		this.teachingIds.clear();
		this.lootedIds.clear();
	}
}
