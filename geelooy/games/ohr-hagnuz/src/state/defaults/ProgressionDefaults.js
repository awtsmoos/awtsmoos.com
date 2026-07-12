/**
 * B"H
 * @module ProgressionDefaults
 * @description Torah learning, gifts, skills, quests, and collection defaults.
 */
const skill = name => ({ name, level: 1, xp: 0, next: 25, unlocks: [] });
const gift = (id, name, receiver, region) => ({ id, name, receiver, region, held: 0, given: 0, purified: false });

export const createStory = () => ({
	active: 'The Night the Aleph Vanished',
	chapter: 0,
	act: 0,
	region: 'Village of Beginnings',
	beats: {},
	objective: 'Witness the broken Aleph and choose a companion.',
	nextStep: 'Advance the opening scene, then choose Emes, Simcha, or Gevurah.',
	arc: ['Prologue', 'Village', 'Garden', 'Market', 'Forgetting', 'Declaration']
});

export const createGifts = () => ({
	inventory: {},
	given: {},
	history: [],
	mistakes: [],
	blessingRemembered: false,
	joyShared: false,
	declaration: { unlocked: [], total: 6, ready: false, blockedBy: ['Terumah', 'First Tithe', 'Poor Tithe', 'Second Tithe', 'First Fruits'] },
	ledger: {
		terumah: gift('terumah', 'Terumah', 'Kohen', 'Garden of Ungiven Things'),
		maaser_rishon: gift('maaser_rishon', 'Maaser Rishon', 'Levi', 'Road of Levi Songs'),
		maaser_ani: gift('maaser_ani', 'Maaser Ani', 'Poor Gate', 'Poor Gate'),
		maaser_sheni: gift('maaser_sheni', 'Maaser Sheni', 'Jerusalem', 'Jerusalem Ascent'),
		bikkurim: gift('bikkurim', 'Bikkurim', 'Jerusalem', 'Orchard of Seven Species')
	}
});

export const createSkills = () => ({
	Learning: skill('Learning'),
	Debate: skill('Debate'),
	Giving: skill('Giving'),
	Memory: skill('Memory'),
	Song: skill('Song'),
	Pilgrimage: skill('Pilgrimage'),
	Agriculture: skill('Agriculture'),
	Kindness: skill('Kindness'),
	Observation: skill('Observation'),
	Prayer: skill('Prayer'),
	Declaration: skill('Declaration'),
	Restoration: skill('Restoration')
});

export const createTorahKnowledge = () => ({ booksRead: 0, power: 0, stats: { chochmah: 0, binah: 0, daat: 0 } });
export const createTorahCodex = () => ({ routes: {}, quotes: {}, fusions: {}, affinity: { Mishnah: 0, Chassidus: 0, Kabbalah: 0, Niggun: 0, Rambam: 0, Gemara: 0 } });
export const createLearnedRoutes = () => ({ 'Mishnah Clarity': 1, 'Chassidus Warmth': 1, 'Kabbalah Light': 1, 'Niggun Joy': 1 });
export const createMusagDex = () => ({ found: {}, mastery: {}, species: {}, evolutions: {}, seenCount: 0, sweetenedCount: 0, masteredCount: 0 });
export const createQuests = () => ({ active: { first_light: { started: true, act: 1 } }, completed: {}, counters: { spark: 0, scroll: 0, debateWon: 0, wildWon: 0, chest: 0, key: 0, book: 0, mitzvah: 0 } });
