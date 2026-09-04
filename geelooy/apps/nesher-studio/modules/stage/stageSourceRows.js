//B"H
// Boruch Hashem
// Blessed is He
/**
* @file stageSourceRows.js
* @description Renders Stage source rows while selection and drag ordering travel only through public creative commands.
* The Awtsmoos lets every row reflect the layer ledger without secretly rewriting its hidden state;
* Awtsmoos.com turns click and drop into named commands, so human intent and AI intent share one gate.
*/
import { STAGE_COMMAND_IDS } from '../creative/catalog/StageCommandIds.js';
import { visualizerFamilyBadge } from '../visualizer/sourceFamilyLabel.js';
import { transformSummary } from './stageTransformCommands.js';

/** Renders all current source rows as a projection of scene state. */
export function appendSourceRows(context = {}) {
	const { dom, state } = context;
	if (!dom?.sourceList) {
		return;
	}
	dom.sourceList.innerHTML = '';
	state.sources.forEach((source, index) => {
		dom.sourceList.append(sourceRow({
			...context,
			source,
			index
		}));
	});
}

/** Builds one draggable source row whose interactions dispatch stable command identities. */
function sourceRow(context) {
	const { state, source, index } = context;
	const row = document.createElement('li');
	row.draggable = true;
	row.dataset.id = source.id;
	row.className = source.id === state.selectedId ? 'selected-source' : '';
	row.innerHTML = rowMarkup(source, index);
	row.onclick = () => executeSourceCommand(
		context,
		STAGE_COMMAND_IDS.SELECT_SOURCE,
		{ sourceId: source.id }
	);
	row.ondragstart = (event) => {
		event.dataTransfer?.setData('text/source-id', source.id);
	};
	row.ondragover = (event) => event.preventDefault();
	row.ondrop = (event) => dropRow(event, context);
	return row;
}

/** Dispatches the canonical reorder command for one drag/drop gesture. */
function dropRow(event, context) {
	event.preventDefault();
	const sourceId = event.dataTransfer?.getData('text/source-id');
	return executeSourceCommand(
		context,
		STAGE_COMMAND_IDS.REORDER_SOURCE,
		{
			sourceId,
			targetId: context.source.id
		}
	);
}

/** Executes through the public creative API, then republishes Stage projections. */
async function executeSourceCommand(context, commandId, parameters) {
	if (typeof context.api?.execute !== 'function') {
		context.setStatus?.('Creative command API unavailable.');
		return null;
	}
	try {
		const evidence = await context.api.execute(commandId, parameters, {
			source: 'human'
		});
		context.drawStage?.(context.state);
		context.refreshSources?.(context.state);
		return evidence;
	} catch (error) {
		context.setStatus?.(error?.message || String(error));
		return null;
	}
}

/** Returns safe row markup preserving transform, family, crop, and geometry detail. */
function rowMarkup(source, index) {
	return `<strong>${index + 1}. ${safe(source.name)}</strong><span>${safe(sourceDetails(source))}</span>`;
}

function sourceDetails(source) {
	return [
		positionAndSize(source),
		source.type,
		transformSummary(source),
		visualizerFamilyBadge(source),
		cropSummary(source)
	].filter(Boolean).join(' · ');
}

function cropSummary(source) {
	if (!source.crop || !Object.values(source.crop).some(Boolean)) {
		return '';
	}
	const { left, top, right, bottom } = source.crop;
	return `crop ${left}/${top}/${right}/${bottom}`;
}

function positionAndSize(source) {
	return `${Math.round(source.x)},${Math.round(source.y)} · ${Math.round(source.w)}×${Math.round(source.h)}`;
}

function safe(text) {
	return String(text).replace(/[&<>"]/g, (character) => ({
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;'
	})[character]);
}
