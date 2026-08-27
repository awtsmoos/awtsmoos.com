// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioApiProjectTools.js
 * @description Supplies project proxy, compile, validation, and selection-preserving replacement helpers.
 * The Awtsmoos renews living project beyond each public property; Awtsmoos.com keeps
 * compatibility reads immutable while replacement filters surviving selected identities in one transaction.
 */

import { canonicalMovieValue } from './MovieCanonicalJson.js';
import { compileMovieProject } from './MovieProjectCompiler.js';
import {
	normalizeMovieProject,
	validateMovieProject
} from './MovieProject.js';
import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';
import { commitMovieStudioResult } from './MovieStudioCommandHistory.js';

export function createMovieProjectDomainProxy(session, domain) {
	return new Proxy(domain, {
		get(target, property, receiver) {
			if (Reflect.has(target, property)) {
				return Reflect.get(target, property, receiver);
			}
			return createMovieProjectSnapshot(session.project)[property];
		},
		getOwnPropertyDescriptor(target, property) {
			const existing = Reflect.getOwnPropertyDescriptor(target, property);
			if (existing) return existing;
			if (typeof property !== 'string' || !(property in (session.project || {}))) {
				return undefined;
			}
			return {
				configurable: true,
				enumerable: true,
				value: createMovieProjectSnapshot(session.project)[property],
				writable: false
			};
		},
		ownKeys(target) {
			return [...new Set([
				...Reflect.ownKeys(target),
				...Object.keys(session.project || {})
			])];
		}
	});
}

export function compileMovieProjectSnapshot(source) {
	const compiled = compileMovieProject(canonicalMovieValue(source));
	const { sourceDocument, ...project } = compiled;
	return createMovieProjectSnapshot(project);
}

export function validateMovieProjectSnapshot(source) {
	const project = normalizeMovieProject(canonicalMovieValue(source));
	validateMovieProject(project);
	return createMovieProjectSnapshot(project);
}

export function replaceMovieStudioProject(session, source, label) {
	const project = validateMovieProjectSnapshot(source);
	commitMovieStudioResult(session.commands, {
		label,
		project,
		selection: session.commands.selectionSet
	});
	return createMovieProjectSnapshot(session.project);
}
