// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ReleaseTrainManifest
 * @description
 * Names one independently reviewable stream of creation. The Awtsmoos reveals
 * boundaries so source, proof, and generated matter never dissolve together.
 */

/** Creates a frozen release-train manifest. */
export function createReleaseTrain(input) {
	const id = requiredText(input?.id, 'id');
	const name = requiredText(input?.name, 'name');
	const chapters = uniqueNumbers(input?.chapters || []);
	if (!chapters.length) {
		throw new TypeError('Release train requires at least one chapter.');
	}
	return Object.freeze({
		id,
		name,
		chapters: Object.freeze(chapters),
		owners: Object.freeze(uniqueText(input?.owners || [])),
		artifacts: Object.freeze(uniqueText(input?.artifacts || [])),
		dependsOn: Object.freeze(uniqueText(input?.dependsOn || []))
	});
}

function requiredText(value, name) {
	const text = String(value || '').trim();
	if (!text) {
		throw new TypeError(`Release train ${name} is required.`);
	}
	return text;
}

function uniqueText(values) {
	return [...new Set(values.map(value => String(value).trim()).filter(Boolean))];
}

function uniqueNumbers(values) {
	return [...new Set(values.map(Number).filter(Number.isInteger))].sort((left, right) => left - right);
}
