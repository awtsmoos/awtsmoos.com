//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class TiferesVerseView
 * @description
 * Tiferes lets a long post become a navigable sequence without severing each verse from the one canonical creation.
 * The Awtsmoos renews whole and section together; Awtsmoos.com gives each verse a tab, readable chamber, and scoped comment doorway,
 * so structured Sicha-like writing stays calm on mobile while exact conversation can gather around every ray.
 */
export class TiferesVerseView {
	/**
	 * @description Creates a verse renderer bound to the owning document.
	 * @param {Document} [root=document] Owning document used to create buttons, articles, and forms.
	 * @returns {TiferesVerseView} Configured verse renderer.
	 * @throws {never} Construction stores the root only.
	 */
	constructor(root = document) {
		this.root = root;
	}

	/**
	 * @description Renders normalized post sections into tabs and scrollable verse articles.
	 * @param {HTMLElement} viewer Official viewer dialog.
	 * @param {object} object Normalized feed object containing sections and summary.
	 * @returns {Array<object>} Normalized verse models rendered into the viewer.
	 * @throws {TypeError} DOM errors propagate if expected viewer regions are absent or malformed.
	 */
	render(viewer, object) {
		const verses = this.verses(object);
		const tabs = viewer.querySelector('[data-viewer-verse-tabs]');
		const body = viewer.querySelector('[data-viewer-verses]');
		tabs.replaceChildren(...verses.map((verse, index) => this.tab(verse, index)));
		body.replaceChildren(...verses.map((verse, index) => this.article(verse, index)));
		return verses;
	}

	/**
	 * @description Normalizes real structured sections, falling back only to the actual post summary rather than synthetic verses.
	 * @param {object} object Normalized feed object.
	 * @returns {Array<object>} Stable verse models with id, title, and text.
	 * @throws {never} Missing sections produce at most one truthful summary verse.
	 */
	verses(object) {
		const sections = Array.isArray(object.sections) ? object.sections : [];
		if (sections.length) {
			return sections.map((section, index) => ({
				id: section.id || section.verseSection || `verse-${index + 1}`,
				title: section.label || section.title || `Verse ${index + 1}`,
				text: section.text || section.content || section.summary || ''
			}));
		}
		return object.summary ? [{ id: 'root', title: 'Post', text: object.summary }] : [];
	}

	/** @description Creates one verse navigation button. @param {object} verse Verse model. @param {number} index Zero-based display index. @returns {HTMLButtonElement} Scroll-target button. @throws {TypeError} DOM creation failures propagate. */
	tab(verse, index) {
		const button = this.root.createElement('button');
		button.type = 'button';
		button.dataset.jumpVerse = `viewer-${verse.id}`;
		button.textContent = `${index + 1}. ${verse.title}`;
		return button;
	}

	/** @description Creates one verse article with an exact verse-scoped comment form. @param {object} verse Verse model. @param {number} index Zero-based display index. @returns {HTMLElement} Semantic verse article. @throws {TypeError} DOM creation failures propagate. */
	article(verse, index) {
		const article = this.root.createElement('article');
		article.id = `viewer-${verse.id}`;
		article.className = 'geelooy-viewer-verse';
		article.dataset.viewerVerseId = verse.id;
		article.innerHTML = `<span class="geelooy-verse-number">Verse ${index + 1}</span><h3></h3><p></p><form data-verse-comment-form><label><span>Comment on this verse</span><textarea name="comment" rows="2" maxlength="5000"></textarea></label><button type="submit">Comment</button></form>`;
		article.querySelector('h3').textContent = verse.title;
		article.querySelector('p').textContent = verse.text;
		return article;
	}

	/** @description Scrolls to one rendered verse and records the active verse ID on the viewer. @param {HTMLElement} viewer Official viewer dialog. @param {string} targetId DOM target ID including `viewer-` prefix. @returns {boolean} Whether a target was found. @throws {never} Missing targets are a safe false result. */
	jump(viewer, targetId) {
		const target = this.root.getElementById(targetId);
		if (!target) return false;
		viewer.dataset.activeVerseId = targetId.replace(/^viewer-/, '');
		target.scrollIntoView({ behavior: this.motion(), block: 'start' });
		return true;
	}

	/** @description Selects smooth or immediate scrolling from the user's motion preference. @returns {'auto'|'smooth'} Browser scroll behavior. @throws {never} Missing matchMedia falls back to smooth. */
	motion() {
		return globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
	}
}
