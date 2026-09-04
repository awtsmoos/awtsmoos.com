//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file bindCreativeMore.js
 * @description Binds command search and human execution while focused renderers own evidence and DOM replacement details.
 * The Awtsmoos lets a finger on glass and a line of code enter one command gate without dividing truth;
 * Awtsmoos.com keeps dispatch separate from evidence, so every human action may be understood from one shared root.
 */
import { createCreativeCommandCard } from './CreativeCommandForm.js';
import { renderCreativeEvidence } from './CreativeEvidenceRenderer.js';
import { replaceDomChildren } from './replaceDomChildren.js';

/**
 * Binds search, human command execution, and evidence refresh to the shared public creative API.
 * @param {object} input DOM anchors, shared API, and optional status callback.
 * @returns {{refresh:Function}} Creative Language human controller.
 */
export function bindCreativeMore({ dom, api, setStatus } = {}) {
	if (!dom.creativeCommandList || !api) {
		return {
			refresh() {}
		};
	}

	const controller = createController(dom, api, setStatus);
	dom.creativeCommandSearch?.addEventListener(
		'input',
		controller.refresh
	);
	controller.refresh();
	return controller;
}

/** Creates the small human command controller around one shared API. */
function createController(dom, api, setStatus) {
	async function executeHuman(command, parameters) {
		setResult(dom, `Running ${command.label}…`);

		try {
			const outcome = await api.execute(
				command.id,
				parameters,
				{
					source: 'human'
				}
			);
			const message = outcome.noOp
				? `${command.label}: nothing changed.`
				: `${command.label} complete.`;
			setResult(dom, message);
			setStatus?.(message);
			refresh();
		} catch (error) {
			const message = error?.message || String(error);
			setResult(dom, message, true);
			setStatus?.(message);
		}
	}

	function refresh() {
		const query = dom.creativeCommandSearch?.value || '';
		renderCommands(dom, api, query, executeHuman);
		renderCreativeEvidence(dom, api);
	}

	return {
		refresh
	};
}

/** Rebuilds command cards from current registry metadata and contextual availability. */
function renderCommands(dom, api, query, executeHuman) {
	const commands = api.searchCommands(query);
	const cards = commands.map((command) => {
		return createCreativeCommandCard(command, executeHuman);
	});

	if (!cards.length) {
		cards.push(createEmptyMessage());
	}

	replaceDomChildren(dom.creativeCommandList, cards);
}

/** Creates a truthful empty-search message without inventing unavailable capabilities. */
function createEmptyMessage() {
	const empty = document.createElement('p');
	empty.className = 'creative-empty-state';
	empty.textContent = 'No implemented commands match this search.';
	return empty;
}

/** Writes human execution status and its accessible error state. */
function setResult(dom, message, isError = false) {
	if (!dom.creativeCommandResult) {
		return;
	}

	dom.creativeCommandResult.textContent = message;
	dom.creativeCommandResult.classList.toggle(
		'is-error',
		isError
	);
}
