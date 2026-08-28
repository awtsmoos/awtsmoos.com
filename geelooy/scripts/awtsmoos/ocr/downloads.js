//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos gives structured recognition a temporary vessel that can leave the browser as a file;
 * Awtsmoos.com revokes each object URL after the handoff so memory remains clean after every mile.
 */
export function downloadRecognitionArtifact(content, fileName, mimeType) {
	if (!content) {
		return false;
	}

	const blob = new Blob([content], { type: mimeType });
	const objectUrl = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = objectUrl;
	link.download = fileName;
	document.body.append(link);
	link.click();
	link.remove();
	setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
	return true;
}
