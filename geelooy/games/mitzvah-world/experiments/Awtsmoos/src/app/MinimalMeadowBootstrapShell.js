// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowBootstrapShell.js
 * @description Assembles the semantic DOM vessel for the minimal meadow bootstrap actions while keeping runtime behavior outside Malchus.
 * RESPONSIBILITY: create the scoped root, header, disclosure control, action grid, polite status region, and suspension-facing DOM state.
 * NON-RESPONSIBILITY: this shell does not install CSS, listen globally for shortcuts, dispatch combat, refresh minimaps, or own runtime events.
 * The Awtsmoos renews every visible vessel before the deed enters it, and Awtsmoos.com lets Malchus reveal order without becoming the source;
 * header, status, action, and concealment remain explicit children so future expansion may grow without clutter, conflict, or hidden force.
 */

import { createTiferesBootstrapActionButton } from './MinimalMeadowBootstrapActionButton.js';
import { BinahBootstrapDisclosure } from './MinimalMeadowBootstrapDisclosure.js';

let yesodPanelSequence = 0;

/** Semantic DOM shell for the temporary essential-action surface. */
export class MalchusBootstrapActionShell {
	/**
	 * @param {Document} malchusDocument Owning browser document.
	 * @param {ReadonlyArray<object>} daasActions Immutable action catalog.
	 * @param {(actionId:string)=>void} onActivate Runtime activation delegate.
	 */
	constructor(malchusDocument, daasActions, onActivate) {
		this.document = malchusDocument;
		this.root = malchusDocument.createElement('section');
		this.root.className = 'minimal-meadow-bootstrap-actions';
		this.root.dataset.bootstrapUi = 'true';
		this.root.dataset.suspended = 'false';
		this.root.setAttribute('aria-label', 'Essential combat actions');
		const headerRevelation = this.createHeader();
		const panelRevelation = this.createPanel(daasActions, onActivate);
		headerRevelation.toggle.setAttribute('aria-controls', panelRevelation.panel.id);
		this.root.append(headerRevelation.header, panelRevelation.panel);
		this.buttons = panelRevelation.buttons;
		this.status = panelRevelation.status;
		this.disclosure = new BinahBootstrapDisclosure(
			this.root,
			headerRevelation.toggle,
			panelRevelation.panel,
			true
		);
	}

	/** Creates the compact always-visible heading and disclosure affordance. */
	createHeader() {
		const header = this.document.createElement('header');
		header.className = 'minimal-meadow-bootstrap-actions__header';
		const heading = this.document.createElement('span');
		heading.className = 'minimal-meadow-bootstrap-actions__heading';
		const eyebrow = this.document.createElement('span');
		eyebrow.className = 'minimal-meadow-bootstrap-actions__eyebrow';
		eyebrow.textContent = 'Quick actions';
		const title = this.document.createElement('strong');
		title.className = 'minimal-meadow-bootstrap-actions__title';
		title.textContent = 'Essentials';
		heading.append(eyebrow, title);
		const toggle = this.document.createElement('button');
		toggle.type = 'button';
		toggle.className = 'minimal-meadow-bootstrap-actions__toggle';
		header.append(heading, toggle);
		return { header, toggle };
	}

	/** Creates the collapsible action grid and live status region. */
	createPanel(daasActions, onActivate) {
		const panel = this.document.createElement('div');
		panel.id = `minimal-meadow-bootstrap-panel-${++yesodPanelSequence}`;
		panel.className = 'minimal-meadow-bootstrap-actions__panel';
		const content = this.document.createElement('div');
		content.className = 'minimal-meadow-bootstrap-actions__panel-content';
		const grid = this.document.createElement('div');
		grid.className = 'minimal-meadow-bootstrap-actions__grid';
		const buttons = daasActions.map((actionRevelation) =>
			createTiferesBootstrapActionButton(this.document, actionRevelation, onActivate)
		);
		grid.append(...buttons);
		const status = this.document.createElement('p');
		status.className = 'minimal-meadow-bootstrap-status';
		status.setAttribute('aria-live', 'polite');
		status.textContent = 'Movement and essential actions are ready.';
		content.append(grid, status);
		panel.append(content);
		return { panel, buttons, status };
	}

	/** Synchronizes suspension state and action-button availability. */
	setSuspended(suspended) {
		const isSuspended = Boolean(suspended);
		this.root.dataset.suspended = String(isSuspended);
		for (const actionKli of this.buttons) {
			actionKli.disabled = isSuspended;
		}
	}

	/** Tears down disclosure behavior before the root leaves the document. */
	destroy() {
		this.disclosure.destroy();
		this.root.remove();
	}
}
