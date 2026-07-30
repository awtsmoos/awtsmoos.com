// B"H
// Boruch Hashem
// Blessed is He
// The Awtsmoos joins motion, menu, and search in one gentle stream, where every small interaction awakens from the dream.

import { AmbientParallax } from "./ambient.js";
import { MenuController } from "./menu.js";
import { ParticleSky } from "./particles.js";
import { SearchController } from "./search.js";

const menuElement = document.querySelector("[data-menu]");
const canvasElement = document.querySelector("[data-particle-sky]");
const parallaxElement = document.querySelector("[data-parallax]");
const searchElement = document.querySelector("form[role='search']");

if (menuElement) {
	new MenuController(menuElement).connect();
}

if (canvasElement) {
	new ParticleSky(canvasElement).connect();
}

if (parallaxElement) {
	new AmbientParallax(parallaxElement).connect();
}

if (searchElement) {
	new SearchController(searchElement).connect();
}
