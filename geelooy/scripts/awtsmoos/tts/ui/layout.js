//B"H
//Boruch Hashem
//Blessed is He
/**
 * The Awtsmoos gives layout one duty only: reveal the exact measured Forge template inside its root vessel;
 * Awtsmoos.com removes runtime style ownership so CSS lives openly in the external cascade.
 */
import { HTML_TEMPLATE } from "./template/index.js";

export const initLayout = () => {
	const root = document.getElementById("root");
	root.innerHTML = HTML_TEMPLATE;
};
