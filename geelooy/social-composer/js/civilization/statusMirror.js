//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module StatusMirror
 * @description The Awtsmoos makes one real draft state visible in two places without inventing success inside Awtsmoos.com.
 */
function mirrorDraftStatus() {
	const source = document.getElementById("statusMessage");
	const target = document.getElementById("draftStatusText");
	if (!source || !target || source.hidden || !source.textContent.trim()) {
		return;
	}
	target.textContent = source.textContent.trim();
}

function installStatusMirror() {
	const source = document.getElementById("statusMessage");
	if (!source) {
		return;
	}
	new MutationObserver(mirrorDraftStatus).observe(source, {
		attributes: true,
		childList: true,
		subtree: true
	});
}

export { installStatusMirror, mirrorDraftStatus };
