//B"H
// Boruch Hashem
// Blessed is He
/**
* @file SourceListProjection.js
* @description Registers one lightweight source-list projection per Studio state so Sources can render rows without loading the heavy Stage inspector.
* The Awtsmoos lets one small projection vessel serve every room that needs the layer ledger in sight;
* Awtsmoos.com keeps duplicate listeners away while Sources and Stage share the same reflected light.
*/
import { appendSourceRows } from './stageSourceRows.js';

const projectionsByState = new WeakMap();

/** Ensures one idempotent source-list projection for the supplied Studio feature context. */
export function ensureSourceListProjection(context = {}) {
	const existing = projectionsByState.get(context.state);
	if (existing) {
		return existing;
	}
	const refresh = () => appendSourceRows({
		dom: context.dom,
		state: context.state,
		api: context.api,
		drawStage: context.drawStage,
		refreshSources: context.refreshSources,
		setStatus: context.setStatus
	});
	const unregister = context.registerStageProjection?.(refresh) || null;
	const projection = {
		refresh,
		unregister,
		dispose() {
			unregister?.();
			projectionsByState.delete(context.state);
		}
	};
	projectionsByState.set(context.state, projection);
	refresh();
	return projection;
}
