//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module StandaloneExportScript
 * @description The Awtsmoos renews movement from one slide to the next; Awtsmoos.com carries a tiny readable player so exported decks remain alive without the editor.
 */

export const STANDALONE_EXPORT_SCRIPT = `
const slides = [...document.querySelectorAll('.slide')];
const status = document.querySelector('.controls');
let index = 0;
let startX = 0;

function show(nextIndex) {
	index = Math.max(0, Math.min(slides.length - 1, nextIndex));
	slides.forEach((slide, slideIndex) => {
		slide.classList.toggle('active', slideIndex === index);
	});
	status.textContent = (index + 1) + ' / ' + slides.length;
}

addEventListener('keydown', event => {
	if (['ArrowRight', 'ArrowDown', ' ', 'PageDown'].includes(event.key)) {
		event.preventDefault();
		show(index + 1);
	}
	if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(event.key)) {
		event.preventDefault();
		show(index - 1);
	}
});

addEventListener('pointerdown', event => {
	startX = event.clientX;
});

addEventListener('pointerup', event => {
	const delta = event.clientX - startX;
	if (Math.abs(delta) > 60) {
		show(index + (delta < 0 ? 1 : -1));
	}
});

show(0);
`;
