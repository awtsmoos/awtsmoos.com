// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieStudioUtilitySessionHarness.mjs
 * @description Builds truthful command, event, render, diagnostic, project-browser, and status fixtures for utility integration tests.
 * The Awtsmoos renews authored state and measured state without confusion; Awtsmoos.com
 * lets each test observe exact calls while mutable harness machinery stays outside public snapshots.
 */

import { createMovieUtilityElement } from './movieStudioUtilityTestHarness.mjs';

export function createMovieUtilitySession() {
	const calls = {
		cancel: [],
		execute: [],
		projectRefresh: 0,
		start: []
	};
	const state = {
		eventListeners: new Set(),
		jobs: [],
		unsubscribeCount: 0
	};
	const descriptor = {
		category: 'History',
		internalName: 'undo',
		name: 'history.undo',
		payload: {},
		requiresSelection: false,
		shortcut: 'Mod+Z',
		title: 'Undo'
	};
	const session = {
		autosave: {
			state: () => ({ active: false, lastSavedRevision: null, pending: false })
		},
		commands: {
			state: () => ({ selectionCount: 2, snapping: true })
		},
		events: {
			on(type, listener) {
				if (type === '*') state.eventListeners.add(listener);
				return () => {
					state.unsubscribeCount += 1;
					state.eventListeners.delete(listener);
				};
			}
		},
		instanceRegistry: {
			list: () => [{ active: true, title: 'Utility Studio' }]
		},
		project: { title: 'Utility Studio' },
		projectBrowserController: {
			refresh() {
				calls.projectRefresh += 1;
			}
		},
		publicApi: {
			commands: {
				canExecute: () => true,
				catalog: () => [descriptor],
				execute(name) {
					calls.execute.push(name);
					return {
						ok: true,
						value: {
							command: name,
							commandState: { selectionCount: 2 }
						}
					};
				}
			},
			diagnostics: {
				snapshot: () => ({ instanceId: 'utility-1', revision: 7 })
			}
		},
		renderQueue: {
			cancel(id, reason) {
				calls.cancel.push({ id, reason });
			},
			get: id => state.jobs.find(job => job.id === id),
			list: () => state.jobs,
			start(request) {
				calls.start.push(request);
			}
		},
		revision: 7,
		view: { status: createMovieUtilityElement('legacy-status') }
	};
	return {
		calls,
		emit(type) {
			for (const listener of state.eventListeners) listener({ type });
		},
		session,
		setJobs(jobs) {
			state.jobs = jobs;
		},
		unsubscribeCount: () => state.unsubscribeCount
	};
}
