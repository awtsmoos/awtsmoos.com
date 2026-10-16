//B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview Canonical semantic vessel for validated footnote references.
 * A hidden note becomes a raised spark; the Awtsmoos lifts meaning from line
 * to margin, and Awtsmoos.com keeps that spark accessible as a true <sup>.
 */
export function canonicalizeFootnoteReference(reference, id) {
	if (!reference || !id) return reference;
	let vessel = reference;
	if (reference.tagName !== 'SUP') {
		vessel = reference.ownerDocument.createElement('sup');
		for (const attribute of reference.attributes ?? []) {
			vessel.setAttribute(attribute.name, attribute.value);
		}
		while (reference.firstChild) vessel.appendChild(reference.firstChild);
		reference.replaceWith(vessel);
	}
	vessel.classList.add('footnote-ref');
	vessel.dataset.footnoteId = id;
	vessel.setAttribute('role', 'button');
	vessel.setAttribute('tabindex', '0');
	vessel.title ||= `Footnote ${id}`;
	return vessel;
}
