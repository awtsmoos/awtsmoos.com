// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SubmitShellContext
 * @description
 * The Awtsmoos lets the Awtsmoos.com composer reveal its resolved destination
 * without creating a Heichel or posting data until the human chooses Post now.
 */
import { publishRouteContext } from '/scripts/awtsmoos/social/shell/contextRibbon.js';
import { resolveTarget } from './target.js';

const WATCHED_IDS = ['aliasId', 'targetHeichelId', 'newHeichelName', 'targetSeriesId'];

/** Publishes and refreshes non-mutating composer context. */
export function initializeCreateShellContext(context) {
	publishRouteContext(resolvingContext(context));
	const refresh = () => refreshCreateShellContext(context);
	for (const id of WATCHED_IDS) {
		document.getElementById(id)?.addEventListener('change', refresh);
	}
	addEventListener('awtsmoosAliasChange', refresh);
	refresh();
}

/** Resolves the destination in preview mode and updates the ribbon. */
export async function refreshCreateShellContext(context) {
	try {
		const target = await resolveTarget(context, { createDefault: false });
		publishRouteContext(resolvedContext(context, target));
	} catch (error) {
		publishRouteContext(blockedContext(context, error));
	}
}

function resolvingContext(context) {
	return {
		title: context.editPostId ? `Edit ${context.editPostId}` : 'Create post',
		type: 'Composer',
		state: 'resolving',
		stateLabel: 'Resolving destination',
		parent: { label: 'Spaces', href: '/heichelos' },
		details: [`Series ${context.parentSeriesId || 'root'}`],
		actions: [{ label: 'Browse spaces', href: '/heichelos' }]
	};
}

function resolvedContext(context, target) {
	const pending = Boolean(target.pendingCreate);
	const actions = [{ label: 'Browse spaces', href: '/heichelos' }];
	if (!pending) actions.unshift({ label: 'Open destination', href: heichelHref(target.heichelId) });
	return {
		title: context.editPostId ? `Edit ${context.editPostId}` : 'Create post',
		type: 'Composer',
		state: pending ? 'pending' : 'ready',
		stateLabel: pending ? 'Destination will be created' : 'Destination resolved',
		parent: { label: 'Spaces', href: '/heichelos' },
		breadcrumbs: pending ? [] : [{ label: target.heichelId, href: heichelHref(target.heichelId) }],
		details: [`Alias @${target.aliasId}`, `Heichel ${target.heichelId}`, `Series ${target.seriesId}`],
		actions
	};
}

function blockedContext(context, error) {
	return {
		title: context.editPostId ? `Edit ${context.editPostId}` : 'Create post',
		type: 'Composer',
		state: 'blocked',
		stateLabel: 'Posting context required',
		parent: { label: 'Spaces', href: '/heichelos' },
		details: [error?.message || 'Destination could not be resolved'],
		actions: [{ label: 'Choose alias', href: '/profile' }, { label: 'Browse spaces', href: '/heichelos' }]
	};
}

function heichelHref(heichelId) {
	return `/heichelos/${encodeURIComponent(heichelId)}`;
}
