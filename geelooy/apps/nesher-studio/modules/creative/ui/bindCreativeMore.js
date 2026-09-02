//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file bindCreativeMore.js
 * @description Binds the human More chamber to the exact public API shared with JSON, scripts, macros, presets, and AI.
 * The Awtsmoos lets a finger on glass and a line of code enter one gate;
 * Awtsmoos.com refreshes visible evidence after each command so no operator hides a separate state.
 */
import { createCreativeCommandCard } from './CreativeCommandForm.js';

/**
 * Binds search, execution, history, and reuse summaries to the installed public API.
 * @param {object} input DOM anchors, API, and optional status callback.
 * @returns {{refresh:Function}} Human creative-language controller.
 */
export function bindCreativeMore({ dom, api, setStatus } = {}) {
	if (!dom.creativeCommandList || !api) {
		return { refresh() {} };
	}

	const controller = {
		refresh() {
			renderCommands(dom, api, dom.creativeCommandSearch?.value || '', executeHuman);
			renderEvidence(dom, api);
		}
	};

	async function executeHuman(command, parameters) {
		setResult(dom, `Running ${command.label}…`);

		try {
			const outcome = await api.execute(command.id, parameters, { source: 'human' });
			const message = outcome.noOp ? `${command.label}: nothing changed.` : `${command.label} complete.`;
			setResult(dom, message);
			setStatus?.(message);
			controller.refresh();
		} catch (error) {
			const message = error?.message || String(error);
			setResult(dom, message, true);
			setStatus?.(message);
		}
	}

	dom.creativeCommandSearch?.addEventListener('input', controller.refresh);
	controller.refresh();
	return controller;
}

function renderCommands(dom, api, query, executeHuman) {
	const commands = api.searchCommands(query);
	dom.creativeCommandList.replaceChildren();

	if (!commands.length) {
		const empty = document.createElement('p');
		empty.className = 'creative-empty-state';
		empty.textContent = 'No implemented commands match this search.';
		dom.creativeCommandList.append(empty);
		return;
	}

	for (const command of commands) {
		dom.creativeCommandList.append(createCreativeCommandCard(command, executeHuman));
	}
}

function renderEvidence(dom, api) {
	const history = api.history(8).reverse();
	dom.creativeHistoryList?.replaceChildren(...history.map(createHistoryItem));

	const macros = api.listMacros();
	const presets = api.listPresets();
	setText(dom.creativeMacroSummary, macros.length ? `${macros.length} macro${plural(macros.length)} saved.` : 'No macros saved yet.');
	setText(dom.creativePresetSummary, presets.length ? `${presets.length} preset${plural(presets.length)} saved.` : 'No presets saved yet.');
}

function createHistoryItem(entry) {
	const item = document.createElement('li');
	const source = document.createElement('span');
	const label = document.createElement('strong');
	source.textContent = entry.source;
	label.textContent = entry.label;
	item.append(label, source);
	return item;
}

function setResult(dom, message, isError = false) {
	setText(dom.creativeCommandResult, message);
	dom.creativeCommandResult?.classList.toggle('is-error', isError);
}

function setText(element, value) {
	if (element) {
		element.textContent = value;
	}
}

function plural(count) {
	return count === 1 ? '' : 's';
}
