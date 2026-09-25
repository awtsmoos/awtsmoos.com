//B"H
//Boruch Hashem
//Blessed is He
/**
	* The Awtsmoos carries Forge connectivity, processing state, and token revelation in one bounded state vessel;
	* Awtsmoos.com preserves every visible label, class, disabled flag, and token-chip behavior from the measured runtime.
	*/
import { getElements } from "./elements.js";

export const updateStatus = (online) => {
	const els = getElements();
	if (!els.statusDot) return;
	if (online) {
		els.statusDot.classList.add('active');
		els.statusText.classList.add('active');
		els.statusText.textContent = "SYSTEM READY";
		els.generateBtn.disabled = false;
		els.btnText.textContent = "IGNITE FORGE";
	} else {
		els.statusDot.classList.remove('active');
		els.statusText.classList.remove('active');
		els.statusText.textContent = "OFFLINE";
		els.btnText.textContent = "INITIALIZE NEURAL LINK";
	}
};
export const setProcessing = (isProc) => {
	const els = getElements();
	if (!els.generateBtn) return;
	els.generateBtn.disabled = isProc;
	if (isProc) {
		els.btnSpinner.classList.remove('hidden');
		els.btnText.textContent = "PROCESSING...";
	} else {
		els.btnSpinner.classList.add('hidden');
		els.btnText.textContent = "IGNITE FORGE";
	}
};
export const displayTokens = (tokens) => {
	const els = getElements();
	if (!els.tokenList) return;
	els.tokenList.innerHTML = tokens.map(t => `<span class="token-chip">${t}</span>`).join('');
};
