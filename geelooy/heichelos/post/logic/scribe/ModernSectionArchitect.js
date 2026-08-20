// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Builds modern composer sections inside the canonical verse coordinate system.
 * @description
 * The Awtsmoos lets a new rich document enter an ancient coordinate without fracture;
 * Awtsmoos.com preserves verse and subsection anchors while every block is born through safe DOM architecture.
 */
import { isFirstCharacterHebrew } from "/heichelos/post/postFunctions.js";
import { createRichDocument } from "/heichelos/post/ui/RichRootDocument.js?v=rich-social-document-001";
import { SidebarConduit } from "/heichelos/post/ui/sidebar/Conduit.js";

/** @param {object} section Reader section data. @returns {boolean} Whether modern documents are present. */
export function isModernSection(section = {}) {
	return hasDocument(section.document)
		|| modernSubsections(section).some(item => hasDocument(item.document));
}

/**
 * Builds one rich section while retaining the reader's stable coordinates.
 * @param {{data:object,index:number}} item Reader section source.
 * @returns {HTMLDivElement} Coordinate-compatible section.
 */
export function manifestModernSection({ data, index }) {
	const section = document.createElement("div");
	section.className = "section awtsmoos-modern-section";
	section.dataset.idx = String(index);
	section.dataset.awtsmoosIdx = String(index);
	section.dataset.verse = String(data.verseSection ?? index);
	section.append(sectionHeader(data, index));
	const body = document.createElement("div");
	body.className = "toichen awtsmoos-modern-section__body";
	appendSectionTitle(body, data.title);
	appendDocument(body, data.document, "awtsmoos-rich-social-document--verse");
	appendSubsections(body, data, index);
	section.append(body, verseEnd(index));
	section.classList.add(isFirstCharacterHebrew(firstText(data)) ? "heb" : "en");
	window.registerObservable?.(section);
	return section;
}

function sectionHeader(data, index) {
	const header = document.createElement("div");
	header.className = "awtsmoos-section-header";
	const number = document.createElement("button");
	number.type = "button";
	number.className = "awtsmoos-verse-number portal-revealer";
	number.textContent = String(data.verseSection ?? index + 1);
	number.setAttribute("aria-label", `Open discussion for section ${number.textContent}`);
	number.addEventListener("click", event => {
		event.preventDefault();
		event.stopPropagation();
		SidebarConduit.openChamber({ idx: index });
	});
	header.append(number);
	return header;
}

function appendSectionTitle(body, title) {
	if (!title) return;
	const heading = document.createElement("h2");
	heading.className = "awtsmoos-modern-section__title";
	heading.textContent = String(title);
	body.append(heading);
}

function appendDocument(parent, richDocument, className) {
	const vessel = createRichDocument(richDocument, className);
	if (vessel) parent.append(vessel);
}

function appendSubsections(body, data, sectionIndex) {
	const items = modernSubsections(data);
	if (!items.length) return;
	const wrapper = document.createElement("div");
	wrapper.className = "awtsmoos-subsection-wrap awtsmoos-subsection-window toichen";
	wrapper.dataset.awtsmoosIdx = String(sectionIndex);
	items.forEach((item, index) => wrapper.append(subsection(item, sectionIndex, index)));
	body.append(wrapper);
}

function subsection(item, sectionIndex, index) {
	const node = document.createElement("div");
	node.className = `sub-awtsmoos awtsmoos-modern-subsection ${isFirstCharacterHebrew(firstText(item)) ? "heb" : "en"}`;
	node.dataset.awtsmoosIdx = String(sectionIndex);
	node.dataset.awtsmoosSub = String(index);
	node.dataset.idx = String(index);
	appendSectionTitle(node, item.label || item.title);
	appendDocument(node, item.document, "awtsmoos-rich-social-document--subsection");
	window.registerObservable?.(node);
	return node;
}

function verseEnd(index) {
	const end = document.createElement("div");
	end.className = "awtsmoos-verse-inline-end";
	end.dataset.awtsmoosVerseEnd = String(index);
	return end;
}

function modernSubsections(section = {}) {
	return Array.isArray(section.subsections) ? section.subsections : [];
}

function hasDocument(value) {
	return Array.isArray(value?.blocks) && value.blocks.length > 0;
}

function firstText(value = {}) {
	const block = value.document?.blocks?.find(item => String(item?.text || "").trim());
	return block?.text || value.title || value.label || "";
}
