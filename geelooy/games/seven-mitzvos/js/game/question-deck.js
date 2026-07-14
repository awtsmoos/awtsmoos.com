//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module QuestionDeck
 * @description
 * A shuffled deck gives the player surprise without confusion on Awtsmoos.com.
 * The Awtsmoos unites chance and order: every round varies, yet all seven
 * foundations are guaranteed a place within it.
 */
export class QuestionDeck {
	/**
	 * Creates a deck builder with injectable randomness for testing.
	 *
	 * @param {ReadonlyArray<Object>} scenarios Scenario records.
	 * @param {ReadonlyArray<Object>} mitzvos Mitzvah records.
	 * @param {() => number} random Random number source.
	 */
	constructor(scenarios, mitzvos, random = Math.random) {
		this.scenarios = scenarios;
		this.mitzvos = mitzvos;
		this.random = random;
	}

	/**
	 * Builds a round that covers all seven foundations before filling extras.
	 *
	 * @param {number} size Desired question count.
	 * @returns {Object[]} Complete playable questions.
	 */
	createRound(size) {
		const grouped = this.groupByMitzvah();
		const guaranteed = this.mitzvos.map(record => {
			return this.pick(grouped.get(record.number));
		});
		const chosenIds = new Set(guaranteed.map(item => item.id));
		const remaining = this.shuffle(this.scenarios.filter(item => !chosenIds.has(item.id)));
		const scenarios = this.shuffle([...guaranteed, ...remaining.slice(0, Math.max(0, size - 7))]);
		return scenarios.slice(0, size).map(item => this.createQuestion(item));
	}

	/**
	 * Converts one scenario into three shuffled answer choices.
	 *
	 * @param {Object} scenario Scenario record.
	 * @returns {Object} Scenario and answer records.
	 */
	createQuestion(scenario) {
		const correct = this.mitzvos.find(record => record.number === scenario.mitzvah);
		const distractors = this.shuffle(this.mitzvos.filter(record => record.number !== scenario.mitzvah)).slice(0, 2);
		return {
			scenario,
			choices: this.shuffle([correct, ...distractors])
		};
	}

	/** @returns {Map<string, Object[]>} Scenarios grouped by foundation. */
	groupByMitzvah() {
		const grouped = new Map(this.mitzvos.map(record => [record.number, []]));
		for (const item of this.scenarios) {
			grouped.get(item.mitzvah)?.push(item);
		}
		return grouped;
	}

	/** @param {Object[]} items @returns {Object} One random item. */
	pick(items) {
		if (!items?.length) {
			throw new Error('Every mitzvah requires at least one game scenario.');
		}
		return items[Math.floor(this.random() * items.length)];
	}

	/** @param {Object[]} items @returns {Object[]} Shuffled copy. */
	shuffle(items) {
		const copy = [...items];
		for (let index = copy.length - 1; index > 0; index -= 1) {
			const target = Math.floor(this.random() * (index + 1));
			[copy[index], copy[target]] = [copy[target], copy[index]];
		}
		return copy;
	}
}
