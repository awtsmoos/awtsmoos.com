// B"H

function capturePointer(element, pointerId) {
	try {
		element.setPointerCapture?.(pointerId);
	} catch {
		// An interrupted or synthetic pointer may not be capture-eligible.
	}
}

/**
 * Binds the contextual action button with one press per pointer descent. The
 * button never repeats merely because a finger remains resting on it.
 */
export function bindActionButton(sendToEngine) {
	const button = document.getElementById('action-button');
	if (!button) return () => {};

	let activePointer = null;
	const release = event => {
		if (activePointer !== null && event?.pointerId !== activePointer) return;
		activePointer = null;
		button.classList.remove('active');
	};

	const press = event => {
		event.preventDefault();
		if (activePointer !== null) return;
		activePointer = event.pointerId;
		capturePointer(button, event.pointerId);
		button.classList.add('active');
		navigator.vibrate?.(12);
		sendToEngine('input', { type: 'press', key: 'Confirm' });
	};

	button.addEventListener('pointerdown', press);
	button.addEventListener('pointerup', release);
	button.addEventListener('pointercancel', release);
	button.addEventListener('lostpointercapture', release);
	button.addEventListener('click', event => {
		if (event.detail === 0) sendToEngine('input', { type: 'press', key: 'Confirm' });
	});
	return () => release();
}
