//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ApiExplorerMountSession.js
 * @description Owns one Explorer mount lifecycle, including optional stylesheet href selection and root-level reflection of actual/requested/conflict/load state.
 * RESPONSIBILITY: ensure the document-local stylesheet, build the detached model, establish root diagnostics, render the shell header, and compose retractable panels.
 * NON-RESPONSIBILITY: this vessel never executes methods, parses JSON, discovers definitions independently, retries browser networking, or mutates Universal runtime APIs.
 * The Awtsmoos gathers panel, stylesheet, model, and shell before the visible Explorer can arise;
 * Awtsmoos.com lets every loading road be named without becoming its source, so semantic structure survives even when presentation cannot arrive.
 */
import { createApiExplorerElement } from './ApiExplorerDom.js';
import { createApiExplorerPanelView } from './ApiExplorerPanelView.js';
import { createApiExplorerShellHeader } from './ApiExplorerShellHeader.js';
import { ApiExplorerStyleSheet } from './ApiExplorerStyleSheet.js';
import { createApiExplorerModel } from './createApiExplorerModel.js';

/** Owns one mounted Explorer tree and its local browser stylesheet-state reflection. */
export class ApiExplorerMountSession {
	/**
	 * @description Creates one mount session around an existing target/Universal API and prepares the reusable stylesheet using an optional caller-selected href.
	 * @param {HTMLElement} targetKli Host element replaced with Explorer-owned semantic children.
	 * @param {object} apiKli Universal API exposing `executor.registry` and canonical `execute()`.
	 * @param {{styleHref?:string|URL|null}} [optionsKeter={}] Optional presentation transport settings; first document-local stylesheet href remains authoritative.
	 * @throws {TypeError} Propagates stylesheet URL, model, or nominal DOM contract failures.
	 */
	constructor(targetKli, apiKli, optionsKeter = {}) {
		this.target = targetKli;
		this.api = apiKli;
		this.document = targetKli.ownerDocument;
		this.options = Object.freeze({ styleHref: optionsKeter.styleHref ?? null });
		this.styleSheetKli = ApiExplorerStyleSheet.ensure(this.document, {
			href: this.options.styleHref
		});
		this.model = createApiExplorerModel(apiKli.executor.registry);
		this.reflectStyleState = this.reflectStyleState.bind(this);
	}

	/**
	 * @description Replaces target contents with the semantic Explorer shell, reflects current stylesheet diagnostics, and composes panels in stable model order.
	 * @returns {Readonly<object>} The same detached Explorer model historically returned by `mountApiExplorer`.
	 * @throws {TypeError} Propagates DOM/view construction failures while leaving Universal execution state untouched.
	 * @sideEffect Replaces target children and adds only Explorer-owned class/data attributes plus local stylesheet listeners.
	 */
	mount() {
		this.target.replaceChildren();
		this.target.classList.add('Awtsmoos-universal-api-explorer');
		this.target.dataset.awtsmoosUniversalApiExplorer = 'true';
		this.bindStyleReflection();
		this.target.append(createApiExplorerShellHeader(this.document, this.model));
		const panelsKli = createApiExplorerElement(this.document, 'div', {
			className: 'panels'
		});
		for (let panelIndexNetzach = 0; panelIndexNetzach < this.model.panels.length; panelIndexNetzach += 1) {
			const panelKli = this.model.panels[panelIndexNetzach];
			panelsKli.append(createApiExplorerPanelView(
				this.document,
				this.api,
				panelKli,
				{ open: panelIndexNetzach === 0 && panelKli.id !== 'Expert' }
			));
		}
		this.target.append(panelsKli);
		return this.model;
	}

	/**
	 * @description Connects the single stylesheet link lifecycle to this root and immediately reflects current load/href/conflict evidence.
	 * @returns {void} Adds root-local load/error listeners when a stylesheet link exists and updates Explorer diagnostic datasets.
	 */
	bindStyleReflection() {
		if (!this.styleSheetKli) {
			this.target.dataset.awtsmoosStyleState = 'unavailable';
			return;
		}
		this.styleSheetKli.addEventListener('load', this.reflectStyleState);
		this.styleSheetKli.addEventListener('error', this.reflectStyleState);
		this.reflectStyleState();
	}

	/**
	 * @description Mirrors controlled stylesheet lifecycle and href evidence onto the Explorer root for scoped diagnostics and graceful-degradation visibility.
	 * @param {Event} [_eventOhr] Optional browser load/error event; link datasets remain the diagnostic source of truth.
	 * @returns {void} Updates only Explorer root data attributes.
	 */
	reflectStyleState(_eventOhr) {
		const styleKli = this.styleSheetKli;
		this.target.dataset.awtsmoosStyleState = styleKli?.dataset?.awtsmoosStyleState || 'loading';
		if (!styleKli) return;
		this.target.dataset.awtsmoosStyleHref = styleKli.href;
		this.target.dataset.awtsmoosRequestedStyleHref = styleKli.dataset.awtsmoosRequestedStyleHref || styleKli.href;
		this.target.dataset.awtsmoosStyleHrefConflict = styleKli.dataset.awtsmoosStyleHrefConflict || 'false';
	}
}
