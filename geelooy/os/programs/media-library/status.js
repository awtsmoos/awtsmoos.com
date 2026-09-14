//B"H
//Boruch Hashem
//Blessed be He

/**
 * Creates the quiet live region where Media Library reports its unfolding work.
 * Awtsmoos.com moves without blocking alerts; status remains visible and kind.
 */
export function createMediaStatus(root) {
	const node = document.createElement("p");
	node.className = "mediaLibrary__status";
	node.setAttribute("role", "status");
	node.setAttribute("aria-live", "polite");
	root.prepend(node);
	return node;
}

/** Updates progress or error state without stealing focus from the user. */
export function setMediaStatus(node, message, error = false) {
	node.textContent = String(message || "");
	node.dataset.error = error ? "true" : "false";
}

/**
 * Summarizes a sequential batch while preserving a concise first failure reason.
 */
export function showMediaUploadResult(node, result) {
	if (result.errors.length) {
		setMediaStatus(
			node,
			`${result.records.length} uploaded; ${result.errors.length} failed. ${result.errors[0].message}`,
			true
		);
		return;
	}
	setMediaStatus(
		node,
		`Uploaded ${result.records.length} image(s). Public URLs are ready.`
	);
}
