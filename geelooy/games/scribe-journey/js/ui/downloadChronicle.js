// B"H

/** Gives the player a portable Chronicle without exposing browser internals. */
export function downloadChronicle({ text, filename = 'scribe-journey-chronicle.json' }) {
	const blob = new Blob([text], { type: 'application/json;charset=utf-8' });
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = filename;
	link.hidden = true;
	document.body.appendChild(link);
	link.click();
	link.remove();
	setTimeout(() => URL.revokeObjectURL(url), 0);
}
