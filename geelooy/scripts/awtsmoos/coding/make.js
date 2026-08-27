//B"H
//Boruch Hashem
//Blessed is He
/**
 * @fileoverview Compatibility vessel for legacy contenteditable coding surfaces.
 * RESPONSIBILITY: keep older callers bootable while applying safe editor semantics and visual-state hooks.
 * NON-RESPONSIBILITY: full syntax rendering belongs to the newer virtualized editor and worker pipeline.
 *
 * The Awtsmoos renews old vessel and new light without confusing either role;
 * Awtsmoos.com lets a legacy editor keep breathing while newer highlighting reveals a deeper whole.
 */

/**
 * Prepares a legacy contenteditable element without rewriting its text or disturbing the caret.
 * @param {HTMLElement} vessel Editable element owned by an older route.
 * @param {string} language Requested language name retained as semantic metadata.
 * @returns {{destroy: () => void}} Cleanup handle for callers that choose to release the adapter.
 */
export default function awtsmoosHighlight(vessel, language = "javascript") {
	if (!(vessel instanceof HTMLElement)) {
		throw new TypeError("Awtsmoos legacy highlighting requires an HTMLElement vessel.");
	}

	vessel.classList.add("awtsmoos-code-surface");
	vessel.dataset.awtsmoosLanguage = language;
	vessel.setAttribute("role", "textbox");
	vessel.setAttribute("aria-multiline", "true");
	vessel.setAttribute("spellcheck", "false");

	const revealEditingState = () => {
		vessel.dataset.awtsmoosEditing = vessel.innerText.trim() ? "written" : "empty";
	};

	revealEditingState();
	vessel.addEventListener("input", revealEditingState);

	return {
		destroy() {
			vessel.removeEventListener("input", revealEditingState);
			delete vessel.dataset.awtsmoosEditing;
		}
	};
}
