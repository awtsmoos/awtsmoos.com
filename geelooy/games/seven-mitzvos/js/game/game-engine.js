//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module GameEngine
 * @description
 * The engine carries each decision from scenario to consequence on Awtsmoos.com.
 * It awakens only for human action, reflecting how the Awtsmoos grants purpose
 * to motion rather than allowing motion to become its own end.
 */
export class GameEngine {
	/** @param {Object} dependencies Game dependencies. */
	constructor(dependencies) {
		this.state = dependencies.state;
		this.deck = dependencies.deck;
		this.view = dependencies.view;
		this.clock = dependencies.clock || performance;
		this.storage = dependencies.storage || window.localStorage;
		this.storageKey = 'awtsmoos-seven-mitzvos-best';
		this.round = [];
		this.cursor = 0;
		this.current = null;
		this.startedAt = 0;
		this.pendingTimer = 0;
		this.locked = true;
	}

	/** Binds controls without beginning a round automatically. */
	mount() {
		this.view.bindStart(() => this.start());
		this.view.bindAnswer(number => this.choose(number));
	}

	/** Creates a fresh round and cancels any stale transition. */
	start() {
		window.clearTimeout(this.pendingTimer);
		this.round = this.deck.createRound(this.state.roundSize);
		this.cursor = 0;
		this.state.start();
		this.locked = false;
		this.view.showRound(this.readBest());
		this.nextQuestion();
	}

	/** Presents the current question and records its start time. */
	nextQuestion() {
		this.current = this.round[this.cursor];
		this.startedAt = this.clock.now();
		this.locked = false;
		this.view.renderQuestion(this.current, {
			...this.state.snapshot(),
			displayQuestion: this.cursor + 1
		});
	}

	/** @param {string} number Chosen mitzvah number. */
	choose(number) {
		if (this.locked || !this.current) {
			return;
		}

		this.locked = true;
		const correctNumber = this.current.scenario.mitzvah;
		const correctChoice = this.current.choices.find(choice => choice.number === correctNumber);
		const outcome = this.state.answer(number === correctNumber, this.clock.now() - this.startedAt);
		this.view.reveal({
			...outcome,
			displayQuestion: this.cursor + 1
		}, correctNumber, correctChoice.title);
		this.pendingTimer = window.setTimeout(() => {
			if (!outcome.active) {
				this.finish();
				return;
			}

			this.cursor += 1;
			this.nextQuestion();
		}, outcome.correct ? 620 : 1050);
	}

	/** Saves a best score and presents the round summary. */
	finish() {
		const state = {
			...this.state.snapshot(),
			displayQuestion: this.state.roundSize
		};
		const previousBest = this.readBest();
		const best = Math.max(previousBest, state.score);
		const newBest = state.score > previousBest;
		this.writeBest(best);
		this.view.showSummary(state, best, newBest);
	}

	/** @returns {number} Safely retrieved best score. */
	readBest() {
		try {
			return Number(this.storage.getItem(this.storageKey)) || 0;
		} catch {
			return 0;
		}
	}

	/** @param {number} score Best score to persist. */
	writeBest(score) {
		try {
			this.storage.setItem(this.storageKey, String(score));
		} catch {
			// Storage can be unavailable in private or restricted contexts.
		}
	}
}
