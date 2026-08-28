//B"H
//Boruch Hashem
//Blessed is He

const VIEWER_STYLE_URL = '/style/geelooy-system/post-viewer.css?v=viewer-020';

/**
 * @class MalchusPostViewerShell
 * @description
 * Malchus receives the hidden possibility of inspection and gives it one semantic modal vessel with finished regions for story, verses, reactions, and conversation.
 * The Awtsmoos renews backdrop, focus, and visible card in one instant; Awtsmoos.com keeps the shell finite on every screen,
 * so advanced social depth may unfold inside clear chambers instead of trailing unstyled elements beyond the user's scene.
 */
export class MalchusPostViewerShell {
	/**
	 * @description Creates or reuses the official post-viewer dialog and ensures its dedicated stylesheet is loaded once.
	 * @param {Document} [root=document] Owning document used for dialog and stylesheet construction.
	 * @returns {MalchusPostViewerShell} Shell controller exposing the semantic dialog element.
	 * @throws {TypeError} DOM construction errors propagate when the supplied document is unusable.
	 */
	constructor(root = document) {
		this.root = root;
		this.ensureStylesheet();
		this.element = this.ensureDialog();
	}

	/**
	 * @description Opens the modal with normalized feed-object headline metadata and restores a predictable initial focus target.
	 * @param {object} object Normalized feed object containing title, author, heichel, type, summary, and full-view href.
	 * @returns {void} Updates dialog text/links and enters modal state.
	 * @throws {DOMException} Native `showModal()` errors propagate if another invalid modal state exists.
	 */
	open(object) {
		this.element.querySelector('[data-viewer-title]').textContent = object.title;
		this.element.querySelector('[data-viewer-meta]').textContent = `@${object.authorAlias} · ${object.heichelId} · ${object.type}`;
		this.element.querySelector('[data-viewer-summary]').textContent = object.summary;
		this.element.querySelector('[data-viewer-full]').href = object.href || '#';
		this.element.dataset.activeVerseId = 'root';
		this.root.body.dataset.geelooyPostViewerOpen = 'true';
		if (!this.element.open) {
			this.element.showModal();
		}
		this.element.querySelector('[data-viewer-close]')?.focus();
	}

	/**
	 * @description Closes the native modal and clears the body-level compatibility state flag.
	 * @returns {void} Leaves the viewer DOM mounted for efficient reuse.
	 * @throws {never} Closing an already-closed viewer is a harmless no-op.
	 */
	close() {
		this.root.body.dataset.geelooyPostViewerOpen = 'false';
		if (this.element.open) {
			this.element.close();
		}
	}

	/** @description Ensures the dedicated late viewer stylesheet is present exactly once. @returns {void} May append one link to document head. @throws {TypeError} DOM errors propagate for invalid roots. */
	ensureStylesheet() {
		if (this.root.querySelector('link[data-geelooy-post-viewer-style]')) return;
		const link = this.root.createElement('link');
		link.rel = 'stylesheet';
		link.href = VIEWER_STYLE_URL;
		link.dataset.geelooyPostViewerStyle = 'true';
		this.root.head.append(link);
	}

	/** @description Returns the existing official dialog or constructs its complete semantic region graph. @returns {HTMLDialogElement} Mounted reusable dialog. @throws {TypeError} DOM errors propagate for invalid roots. */
	ensureDialog() {
		const existing = this.root.querySelector('.geelooy-post-viewer');
		if (existing) return existing;
		const dialog = this.root.createElement('dialog');
		dialog.className = 'geelooy-post-viewer';
		dialog.setAttribute('aria-label', 'Official post viewer');
		dialog.innerHTML = this.markup();
		this.root.body.append(dialog);
		return dialog;
	}

	/** @description Returns the static region structure while all user data is assigned with textContent later. @returns {string} Trusted application-authored dialog markup. @throws {never} Static template creation has no side effects. */
	markup() {
		return `<article class="geelooy-post-viewer-card"><header class="geelooy-post-viewer-head"><div><p class="g-kicker">Awtsmoos Social</p><h2 data-viewer-title></h2><p data-viewer-meta></p></div><button type="button" data-viewer-close>Close</button></header><nav class="geelooy-viewer-tools" aria-label="Post actions"><a data-viewer-full href="#">Open full post</a><button type="button" data-viewer-copy>Copy link</button><button type="button" data-viewer-save>Save</button><button type="button" data-viewer-share>Share</button></nav><p class="geelooy-post-viewer-summary" data-viewer-summary></p><nav class="geelooy-verse-tabs" data-viewer-verse-tabs aria-label="Post verses"></nav><section class="geelooy-verse-scroll" data-viewer-verses tabindex="0"></section><section class="geelooy-viewer-reactions" data-viewer-reactions aria-label="Post reactions"></section><section class="geelooy-viewer-comments" data-viewer-conversation></section></article>`;
	}
}
