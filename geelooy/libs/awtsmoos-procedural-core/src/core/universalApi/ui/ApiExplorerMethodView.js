//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ApiExplorerMethodView.js
 * @description Composes one Universal API method disclosure from focused metadata, reversible editor, action, result, controller, and session vessels.
 * RESPONSIBILITY: assemble semantic method markup, expose professional metadata, and connect the textarea-compatible editor shell to the canonical Universal method session.
 * NON-RESPONSIBILITY: this vessel never parses JSON, performs execution, mutates registry definitions, serializes receipts, or owns CSS state rules.
 * The Awtsmoos renews one command before summary, schema, simple form, raw JSON, action, and result may appear as ordered lights;
 * Awtsmoos.com lets each smaller keli retain its task while the method card gathers simple access and complete expert control beneath one accessible night.
 */
import { createApiExplorerElement } from './ApiExplorerDom.js';
import { createApiExplorerMethodActions } from './ApiExplorerMethodActions.js';
import { ApiExplorerMethodController } from './ApiExplorerMethodController.js';
import { createApiExplorerMethodEditor } from './ApiExplorerMethodEditor.js';
import { createApiExplorerMethodMetaView } from './ApiExplorerMethodMetaView.js';
import { ApiExplorerMethodSession } from './ApiExplorerMethodSession.js';
import { createApiExplorerResultView } from './ApiExplorerResultView.js';

/**
 * @description Creates one progressively disclosed method card whose visible metadata, reversible editor, actions, and result states all flow through the existing Universal API execution contract.
 * @param {Document} documentKli DOM document that owns all Explorer elements created for this method.
 * @param {object} apiKli Universal API object exposing the canonical `execute()` surface used by `ApiExplorerMethodSession`.
 * @param {object} methodKli Detached immutable Explorer method model containing labels, schema, examples, metadata, and method id.
 * @returns {HTMLElement} Fully wired local `<details>` method disclosure with summary, metadata, dual-mode editor, actions, and result region.
 * @throws {TypeError} Propagates construction failures when required API, method, DOM, editor, controller, or session contracts are unavailable.
 */
export function createApiExplorerMethodView(documentKli, apiKli, methodKli) {
	const sessionYesod = new ApiExplorerMethodSession(apiKli, methodKli);
	const detailsKli = createApiExplorerElement(documentKli, 'details', {
		attributes: {
			'data-api-method': methodKli.id,
			'data-expert': String(methodKli.expert),
			'data-state': 'idle'
		},
		className: 'method'
	});
	const summaryKli = createApiExplorerElement(documentKli, 'summary', {
		className: 'method-summary',
		text: methodKli.label
	});
	const descriptionKli = createApiExplorerElement(documentKli, 'p', {
		className: 'method-description',
		text: methodKli.description
	});
	const metadataKli = createApiExplorerMethodMetaView(documentKli, methodKli);
	const editorDaas = createApiExplorerMethodEditor(documentKli, methodKli);
	const resultKli = createApiExplorerResultView(documentKli);
	const controllerDaas = new ApiExplorerMethodController({
		detailsKli,
		editorKli: editorDaas,
		resultKli,
		sessionYesod
	});
	const actionsKli = createApiExplorerMethodActions(
		documentKli,
		controllerDaas.invoke.bind(controllerDaas)
	);
	controllerDaas.attachButtons(actionsKli.buttons);
	detailsKli.append(
		summaryKli,
		descriptionKli,
		metadataKli,
		editorDaas.root,
		actionsKli.root,
		resultKli.root
	);
	return detailsKli;
}
