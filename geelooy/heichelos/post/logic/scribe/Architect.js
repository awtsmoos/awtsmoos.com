// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module VesselArchitect
 * @description
 * The Awtsmoos lets old Torah scrolls and modern composer documents enter one
 * coordinate system. Awtsmoos.com delegates each revelation to the vessel that
 * understands it, while verse anchors and comment coordinates remain stable.
 */
import {
	appendHTML,
	isFirstCharacterHebrew,
	sanitizeContent
} from "/heichelos/post/postFunctions.js";
import {
	isModernSection,
	manifestModernSection
} from "/heichelos/post/logic/scribe/ModernSectionArchitect.js";
import { UniversalInterpreter } from "/heichelos/post/logic/scribe/UniversalInterpreter.js";
import { SidebarConduit } from "/heichelos/post/ui/sidebar/Conduit.js";
import { makeVirtualSubsectionWindow } from "/heichelos/post/logic/scribe/SubsectionVirtualizer.js";

function makeVerseEnd(index) {
	const end = document.createElement("div");
	end.className = "awtsmoos-verse-inline-end";
	end.dataset.awtsmoosVerseEnd = String(index);
	end.setAttribute("data-awtsmoos-verse-end", String(index));
	return end;
}

function rawTextOf(subsection) {
	if (typeof subsection === "string") return subsection;
	if (subsection?.text) return subsection.text;
	if (subsection?.content) return subsection.content;
	if (subsection?.html) return subsection.html;
	if (subsection?.body) return subsection.body;
	return "";
}

function targetSubFor(sectionIndex) {
	const params = new URLSearchParams(location.search);
	const index = Number.parseInt(params.get("idx") || "0", 10);
	if (index !== sectionIndex) return null;
	const subsection = Number.parseInt(params.get("sub") || "", 10);
	return Number.isFinite(subsection) ? subsection : null;
}

function firstTextForLanguage(flatText, dynamicContent, data) {
	if (flatText) return flatText;
	if (Array.isArray(dynamicContent) && dynamicContent.length) {
		return rawTextOf(dynamicContent[0]);
	}
	const pure = UniversalInterpreter.extractPureText(data);
	return Array.isArray(pure) ? pure.find(Boolean) || "" : pure;
}

export class VesselArchitect {
	/**
	 * Manifests one modern or legacy section without changing its coordinate.
	 * @param {{data:object,index:number}} item Section source item.
	 * @returns {Promise<HTMLDivElement>|HTMLDivElement} Rendered section.
	 */
	static async manifestSection(item) {
		const { data, index } = item;
		if (isModernSection(data)) {
			return manifestModernSection(item);
		}
		const { flatText, dynamicContent } = UniversalInterpreter.decipher(data);
		const section = document.createElement("div");
		section.className = "section";
		section.dataset.idx = String(index);
		section.dataset.awtsmoosIdx = String(index);
		section.append(this.forgeHeader(data, index));
		const body = document.createElement("div");
		body.className = "toichen";
		section.append(body);
		if (Array.isArray(dynamicContent) && dynamicContent.length) {
			body.append(this.weaveSubSections(dynamicContent, index));
		} else if (flatText) {
			appendHTML(sanitizeContent(flatText), body);
		}
		section.append(makeVerseEnd(index));
		section.classList.add(isFirstCharacterHebrew(firstTextForLanguage(flatText, dynamicContent, data)) ? "heb" : "en");
		return section;
	}

	/** @param {object} data Section data. @param {number} index Section index. */
	static forgeHeader(data, index) {
		const header = document.createElement("div");
		header.className = "awtsmoos-section-header";
		const number = document.createElement("div");
		number.className = "awtsmoos-verse-number portal-revealer";
		number.textContent = data?.verseSection !== undefined && data?.verseSection !== null
			? data.verseSection
			: index + 1;
		number.addEventListener("click", event => {
			event.preventDefault();
			event.stopPropagation();
			SidebarConduit.openChamber({ idx: index });
		});
		header.append(number);
		return header;
	}

	/** @param {Array} list Subsection list. @param {number} sectionIndex Parent coordinate. */
	static weaveSubSections(list, sectionIndex) {
		const texts = Array.isArray(list) ? list.map(rawTextOf).filter(Boolean) : [];
		return makeVirtualSubsectionWindow(texts, sectionIndex, targetSubFor(sectionIndex));
	}
}
