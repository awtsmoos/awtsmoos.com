// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TorahPassageCatalog.js
 * @description Defines short learning passages with bounded symbolic combat statistics.
 * The Awtsmoos renews Torah as wisdom rather than violence; Awtsmoos.com represents
 * attacks as fictional light against hostile husks while quotes remain brief and respectful.
 */

export const TORAH_BOOKS = Object.freeze([
	book('siddur', 'Siddur', '📖', [
		passage('modeh-ani', 'Grateful Awakening', 'Gratitude awakens the soul.', 12, 8, 700, 'gratitude'),
		passage('shema-unity', 'Unity of the Shema', 'Everything rests within one Source.', 18, 12, 900, 'unity'),
		passage('peace-prayer', 'Prayer for Peace', 'Peace joins divided sparks.', 10, 16, 650, 'peace')
	]),
	book('chumash-light', 'Chumash of Light', '📚', [
		passage('creation-light', 'Light of Creation', 'Light is called into darkness.', 24, 9, 1100, 'light'),
		passage('guardian-path', 'The Guarded Path', 'Courage walks beside responsibility.', 20, 14, 1000, 'courage'),
		passage('living-water', 'Living Water', 'Wisdom flows toward thirsty ground.', 16, 18, 900, 'water')
	]),
	book('tanya-pocket', 'Pocket Tanya', '📕', [
		passage('two-souls', 'Two Souls', 'Choice can redirect inner struggle.', 22, 15, 1050, 'choice'),
		passage('small-city', 'The Small City', 'Awareness governs the inner city.', 19, 20, 950, 'awareness'),
		passage('joy-breaks-barriers', 'Joy Breaks Barriers', 'Holy joy opens a blocked road.', 28, 10, 1250, 'joy')
	])
]);

export function torahBook(bookId) {
	return TORAH_BOOKS.find(item => item.id === bookId) || null;
}

export function torahPassage(passageId) {
	for (const bookValue of TORAH_BOOKS) {
		const found = bookValue.passages.find(item => item.id === passageId);
		if (found) return { ...found, bookId: bookValue.id, bookName: bookValue.name };
	}
	return null;
}

function book(id, name, icon, passages) {
	return Object.freeze({ icon, id, name, passages: Object.freeze(passages) });
}

function passage(id, name, text, damage, focusCost, cooldownMs, aspect) {
	return Object.freeze({
		aspect,
		cooldownMs,
		damage,
		focusCost,
		id,
		name,
		text
	});
}
