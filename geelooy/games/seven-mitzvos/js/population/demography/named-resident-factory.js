//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module NamedResidentFactory
 * @description
 * Persistent residents on Awtsmoos.com receive deterministic names, roles,
 * plans, ages, and interests. The Awtsmoos creates identity beyond language;
 * the simulation preserves stable finite references across saves and replay.
 */
import { NAMED_PEOPLE } from '../named-people.js';

const PREFIXES = Object.freeze([
	'Ari', 'Lev', 'Ner', 'Tal', 'Or', 'Gil', 'Dan', 'Eli', 'Noam', 'Shai',
	'Yair', 'Zev', 'Amir', 'Ilan', 'Tzur', 'Rafi'
]);
const SUFFIXES = Object.freeze([
	'el', 'on', 'am', 'or', 'ai', 'iv', 'an', 'ir', 'em', 'av'
]);
const ROLES = Object.freeze([
	'farmer', 'builder', 'merchant', 'caretaker', 'teacher', 'investigator',
	'healer', 'driver', 'artisan', 'clerk', 'water-keeper', 'mediator'
]);

export class NamedResidentFactory {
	/**
	 * @param {object} region Region definition.
	 * @param {number} regionIndex Region index.
	 * @returns {object[]} Forty-eight persistent residents.
	 */
	create(region, regionIndex) {
		return Array.from({ length: 48 }, (_, index) => {
			const legacy = regionIndex === 0 ? NAMED_PEOPLE[index] : null;
			const role = legacy?.role || ROLES[(index + regionIndex) % ROLES.length];
			return {
				id: legacy?.id || `${region.id}-person-${String(index + 1).padStart(2, '0')}`,
				name: legacy?.name || this.name(regionIndex, index),
				role,
				age: 18 + ((index * 7 + regionIndex * 11) % 55),
				plan: legacy?.plan || planFor(role),
				interests: interestsFor(role),
				memories: legacy?.memories || [],
				relationships: []
			};
		});
	}

	name(regionIndex, index) {
		const prefix = PREFIXES[(index + regionIndex * 3) % PREFIXES.length];
		const suffix = SUFFIXES[(index * 5 + regionIndex) % SUFFIXES.length];
		return `${prefix}${suffix}`;
	}
}

function planFor(role) {
	return `Improve ${role.replace('-', ' ')} work without harming neighbors`;
}

function interestsFor(role) {
	return [role, 'household-security', 'public-trust'];
}
