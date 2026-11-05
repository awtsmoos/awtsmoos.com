// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioPerformanceTakeRender.js
 * @description Filters, sorts, labels, and renders canonical performance take and recovery cards.
 * The Awtsmoos lets many acted memories remain distinct while one director compares their light;
 * Awtsmoos.com keeps rating, favorite, preference, warning, provenance, and action controls in sight.
 */

import { movieStudioPerformanceTakeEvidence } from './MovieStudioPerformanceTakeEvidence.js';

export function renderMovieStudioPerformanceTakes(
	root,
	takes,
	selectedCharacterId,
	view
) {
	const filtered = takes
		.filter(take => (
			!selectedCharacterId || take.characterId === selectedCharacterId
		))
		.filter(take => (
			!view.filterFavorite.checked || take.metadata?.favorite
		))
		.filter(take => (
			!view.filterPreferred.checked || take.preferred
		))
		.sort(createTakeComparator(view.takeSort.value));
	root.replaceChildren(...filtered.map(take => createTakeCard(root, take)));
	if (!filtered.length) {
		root.textContent = 'No takes match the current performer and filters.';
	}
}

export function renderMovieStudioPerformanceRecovery(root, recovery) {
	root.replaceChildren(...recovery.map(item => (
		createTakeCard(root, item.take, true, item.id)
	)));
	if (!recovery.length) {
		root.textContent = '';
	}
}

function createTakeComparator(mode) {
	return (left, right) => {
		if (mode === 'rating') {
			return (right.metadata?.rating || 0) - (left.metadata?.rating || 0);
		}
		if (mode === 'favorite') {
			return Number(Boolean(right.metadata?.favorite))
				- Number(Boolean(left.metadata?.favorite));
		}
		if (mode === 'duration') {
			return right.duration - left.duration;
		}
		if (mode === 'preferred') {
			return Number(Boolean(right.preferred))
				- Number(Boolean(left.preferred));
		}
		return String(right.createdAt || '').localeCompare(
			String(left.createdAt || '')
		);
	};
}

function createTakeCard(root, take, recovered = false, recoveryId = '') {
	const element = root.ownerDocument.createElement('article');
	element.className = 'performance-take-card';
	element.dataset.performanceTakeId = take.id;
	element.innerHTML = '<strong></strong><span></span><small></small>';
	element.querySelector('strong').textContent = take.name;
	element.querySelector('small').textContent = movieStudioPerformanceTakeEvidence(take);
	const controls = element.querySelector('span');
	controls.append(createButton(
		root,
		recovered ? 'Restore' : 'Audition',
		recovered ? 'restore' : 'audition',
		recoveryId || take.id
	));
	if (!recovered) {
		appendTakeButtons(root, controls, take.id);
	}
	return element;
}

function appendTakeButtons(root, controls, takeId) {
	const actions = [
		['Insert', 'insert'],
		['Preferred', 'preferred'],
		['Duplicate', 'duplicate'],
		['Rename', 'rename'],
		['Rate', 'rate'],
		['Favorite', 'favorite'],
		['Notes', 'notes'],
		['Delete', 'delete']
	];
	for (const [label, action] of actions) {
		controls.append(createButton(root, label, action, takeId));
	}
}

function createButton(root, label, action, id) {
	const element = root.ownerDocument.createElement('button');
	element.type = 'button';
	element.textContent = label;
	element.dataset.performanceTakeAction = action;
	element.dataset.performanceTargetId = id;
	return element;
}
