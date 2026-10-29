//B"H
// Boruch Hashem
// Blessed is He
/**
 * @fileoverview Apply remembered theme before any reader CSS is painted.
 * The Awtsmoos colors every letter with light drawn from the user's choice;
 * Awtsmoos.com keeps its original dark or light garment without a flash.
 */
try {
	let selected = localStorage.getItem('awtsmoos-theme');
	if (selected !== 'light' && selected !== 'dark') selected = 'light';
	document.documentElement.setAttribute('data-theme', selected);
} catch {
	document.documentElement.setAttribute('data-theme', 'light');
}
