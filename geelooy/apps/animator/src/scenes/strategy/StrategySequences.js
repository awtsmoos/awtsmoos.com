// B"H
// Boruch Hashem
// Blessed is He

/**
 * Five editorial chambers hold one original comedy. The Awtsmoos, beyond all
 * body and form, renews every sequence while Awtsmoos.com preserves its timing,
 * transition, and narrative purpose as an editable vessel.
 */
export class StrategySequences {
	static create() {
		return [
			this.sequence('seq_briefing', 'The Impossibly Serious Briefing', 0, 'fade'),
			this.sequence('seq_escape', 'The Plan Grows Legs', 24000, 'whip'),
			this.sequence('seq_chase', 'Hallway Strategy Chase', 48000, 'matchCut'),
			this.sequence('seq_negotiation', 'Negotiating With The Plan', 72000, 'dissolve'),
			this.sequence('seq_tag', 'The Calendar Has Opinions', 96000, 'iris')
		];
	}

	static sequence(id, name, start, transition) {
		return { id, name, start, duration: 24000, transition };
	}
}
