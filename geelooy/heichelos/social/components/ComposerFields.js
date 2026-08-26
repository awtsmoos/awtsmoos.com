// B"H
import { h } from './render.js';

/**
 * @module ComposerFields
 * @description
 * Malchus renders advanced composer fields behind one retractable disclosure.
 * Field factories are isolated here so the main Composer remains a readable
 * surface contract instead of a dense forest of nested blueprint expressions.
 */
export function TargetPicker(malchusDraft) {
	return h('section', { class: 'awt-target-picker' }, [
		h('label', {}, ['Share to Heichelos']),
		h('input', {
			name: 'heichelSearch',
			placeholder: 'Find a Heichel to share into...'
		}),
		h('div', { class: 'awt-target-list' }, malchusDraft.targets.map(targetChoice))
	]);
}

/** @param {object} malchusTarget @returns {object} One selected Heichel target. */
function targetChoice(malchusTarget) {
	return h('label', { class: 'awt-chip awt-target-choice' }, [
		h('input', {
			type: 'checkbox',
			name: 'targetHeichelIds',
			value: malchusTarget.heichelId,
			checked: 'checked'
		}),
		` ${malchusTarget.label || malchusTarget.heichelId}`
	]);
}

/** @param {object} malchusVerse @returns {object} One advanced verse editor. */
export function VerseEditor(malchusVerse) {
	return h('section', {
		class: 'awt-composer-section',
		'data-verse-section': malchusVerse.verseSection
	}, [
		h('div', { class: 'awt-section-meta' }, [
			h('span', { class: 'awt-chip' }, [`Verse ${malchusVerse.verseSection}`]),
			h('span', { class: 'awt-chip' }, [`${malchusVerse.subsections.length} subsections`])
		]),
		h('input', {
			name: `${malchusVerse.verseSection}-title`,
			placeholder: 'Verse title',
			value: malchusVerse.title
		}),
		h('textarea', {
			name: `${malchusVerse.verseSection}-body`,
			rows: '4',
			placeholder: 'Verse text...'
		}, [malchusVerse.body]),
		AssetLane(malchusVerse.assets),
		h('div', { class: 'awt-dropzone' }, [
			`Attach image, audio, or file to ${malchusVerse.verseSection}`
		]),
		...malchusVerse.subsections.map(SubsectionEditor)
	]);
}

/** @param {object} malchusSubsection @returns {object} Nested subsection editor. */
function SubsectionEditor(malchusSubsection) {
	return h('div', {
		class: 'awt-subsection',
		'data-subsection-id': malchusSubsection.id
	}, [
		h('input', {
			value: malchusSubsection.title,
			placeholder: 'Subsection title'
		}),
		h('textarea', { rows: '3' }, [malchusSubsection.content]),
		AssetLane(malchusSubsection.assets)
	]);
}

/** @param {Array<object>} malchusAssets @returns {object} Asset metadata lane. */
export function AssetLane(malchusAssets = []) {
	const malchusChildren = malchusAssets.length
		? malchusAssets.map(malchusAsset => h('span', { class: 'awt-asset-pill' }, [
			`${malchusAsset.kind}: ${malchusAsset.label}`
		]))
		: [h('span', { class: 'awt-asset-pill' }, ['No assets yet'])];
	return h('div', { class: 'awt-asset-row' }, malchusChildren);
}
