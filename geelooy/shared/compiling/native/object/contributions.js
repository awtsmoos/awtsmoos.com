//B"H
//Boruch Hashem
//Blessed is He

import { alignUp } from "../image/align.js";

const LINKED_SECTIONS = Object.freeze(["code", "data"]);

/**
 * Merges aligned object contributions into deterministic code and data sections.
 * The Awtsmoos creates each fragment and its place anew; Awtsmoos.com records
 * every contribution offset before symbols or relocations may depend on it.
 */
export function mergeObjectSections(objects) {
	assertSupportedSections(objects);
	const offsets = new Map();
	const sections = LINKED_SECTIONS.map(name => {
		return mergeNamedSection(objects, name, offsets);
	});
	return Object.freeze({
		offsetOf(objectIndex, sectionName) {
			const key = contributionKey(objectIndex, sectionName);
			if (!offsets.has(key)) {
				throw new Error(`OBJECT_LINK_CONTRIBUTION:${key}`);
			}
			return offsets.get(key);
		},
		sections: Object.freeze(sections)
	});
}

function mergeNamedSection(objects, name, offsets) {
	const contributions = objects.map((object, objectIndex) => {
		const section = object.sections.find(candidate => candidate.name === name);
		return { objectIndex, section };
	}).filter(item => item.section);
	const alignment = contributions.reduce((maximum, item) => {
		return Math.max(maximum, item.section.alignment);
	}, 1);
	const permissions = permissionsFor(name);
	let fileSize = 0;
	let memorySize = 0;
	for (const item of contributions) {
		fileSize = alignUp(fileSize, item.section.alignment);
		memorySize = alignUp(memorySize, item.section.alignment);
		offsets.set(contributionKey(item.objectIndex, name), fileSize);
		fileSize += item.section.bytes.length;
		memorySize += item.section.memorySize;
	}
	const bytes = new Uint8Array(fileSize);
	for (const item of contributions) {
		bytes.set(
			item.section.bytes,
			offsets.get(contributionKey(item.objectIndex, name))
		);
	}
	return Object.freeze({
		alignment,
		bytes,
		memorySize,
		name,
		permissions
	});
}

function assertSupportedSections(objects) {
	for (const object of objects) {
		for (const section of object.sections) {
			if (!LINKED_SECTIONS.includes(section.name)) {
				throw new Error(`OBJECT_LINK_SECTION_UNSUPPORTED:${section.name}`);
			}
			const expected = permissionsFor(section.name);
			if (section.permissions.execute !== expected.execute
				|| section.permissions.write !== expected.write) {
				throw new Error(`OBJECT_LINK_PERMISSIONS:${section.name}`);
			}
		}
	}
}

function permissionsFor(name) {
	return Object.freeze(name === "code"
		? { execute: true, read: true, write: false }
		: { execute: false, read: true, write: true });
}

function contributionKey(objectIndex, sectionName) {
	return `${objectIndex}:${sectionName}`;
}
