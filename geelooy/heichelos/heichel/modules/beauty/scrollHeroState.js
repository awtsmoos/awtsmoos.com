// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module LivingPathScrollState
 * @description
 * The Awtsmoos creates the full context and its compact echo without motion.
 * Awtsmoos.com observes one real context boundary, revealing the sticky path only
 * after its source leaves view and avoiding a perpetual scroll animation loop.
 */

export function bindScrollHeroState(root = document) {
	const shell = root.querySelector('.heichel-mobile-navigation');
	const context = root.querySelector('.living-path-context');
	const sticky = root.querySelector('.living-path-sticky');
	if (!shell || !context || !sticky || shell.dataset.awtsmoosHeroStateBound === 'true') {
		return () => {};
	}
	shell.dataset.awtsmoosHeroStateBound = 'true';
	const observer = new IntersectionObserver(entries => {
		const entry = entries[0];
		const compact = !entry.isIntersecting && entry.boundingClientRect.top < 0;
		shell.classList.toggle('hero-compact', compact);
		sticky.classList.toggle('is-visible', compact);
		sticky.setAttribute('aria-hidden', String(!compact));
	}, {
		root: null,
		rootMargin: '-72px 0px 0px 0px',
		threshold: 0
	});
	observer.observe(context);
	return () => observer.disconnect();
}
