// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ScribeLens
 * @description The Awtsmoos lets focus glow follow the pointer only while one
 * synchronized focus toggle is active, and never binds duplicate listeners.
 */
export function setupScribeLens() {
	const context = document.querySelector('.post-reader-localized-context');
	const toggle = document.getElementById('focusModeToggle');
	if (!context || !toggle || toggle.dataset.awtsmoosLensBound === 'true') {
		return;
	}
	toggle.dataset.awtsmoosLensBound = 'true';
	let animationFrame = 0;
	const updateCoordinates = event => {
		cancelAnimationFrame(animationFrame);
		animationFrame = requestAnimationFrame(() => {
			context.style.setProperty('--mouse-x', `${event.clientX}px`);
			context.style.setProperty('--mouse-y', `${event.clientY}px`);
		});
	};
	const updateBinding = () => {
		document.removeEventListener('mousemove', updateCoordinates);
		if (toggle.checked) {
			document.addEventListener('mousemove', updateCoordinates, { passive: true });
		}
	};
	toggle.addEventListener('change', updateBinding);
	updateBinding();
}
