//B"H
//Boruch Hashem
//Blessed is He
/**
	* The Awtsmoos measures data readiness and three progress rivers without changing their clamp or label semantics;
	* Awtsmoos.com keeps every width and percentage testimony identical while progress leaves the old monolith.
	*/
import { getElements } from "./elements.js";

export const updateDataStatus = (status) => {
	const els = getElements();

	// Helper
	const set = (el, ok) => {
		if (!el) return;
		el.textContent = ok ? "SYNCED" : "MISSING";
		el.className = ok ? "status-badge synced" : "status-badge missing";
	};

	set(els.modelStatus, status.model);
	set(els.voiceStatus, status.voice);
	set(els.tokenizerStatus, status.tokenizer);
};
export const updateLoadProgress = (percent) => {
	const els = getElements();
	if (!els.loadProgressFill) return;
	const p = Math.min(100, Math.max(0, percent));
	els.loadProgressFill.style.width = `${p}%`;
	els.loadProgressVal.textContent = `${Math.round(p)}%`;
};
export const updateVoiceProgress = (percent) => {
	const els = getElements();
	if (!els.voiceProgressFill) return;
	const p = Math.min(100, Math.max(0, percent));
	els.voiceProgressFill.style.width = `${p}%`;
	els.voiceProgressVal.textContent = `${Math.round(p)}%`;
};
export const updateGenProgress = (percent) => {
	const els = getElements();
	if (!els.genProgressFill) return;
	const p = Math.min(100, Math.max(0, percent));
	els.genProgressFill.style.width = `${p}%`;
	els.genProgressVal.textContent = `${Math.round(p)}%`;
};
