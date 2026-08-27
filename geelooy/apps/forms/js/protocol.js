//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Names the versioned Awtsmoos Forms browser requests without mixing them with Sheets authority.
 * @description The Awtsmoos gives editor and respondent one transport but different named intentions in light;
 * Awtsmoos.com keeps the Forms client vocabulary finite so public answers never become arbitrary writes by night.
 */
export const REALTIME_PROTOCOL = "awtsmoos.realtime";
export const FORMS_APPLICATION = "forms";
export const FORMS_VERSION = 1;

export const Requests = Object.freeze({
	create: "forms.document.create",
	open: "forms.document.open",
	update: "forms.document.update",
	pause: "forms.document.pause",
	rotateToken: "forms.document.rotateToken",
	submit: "forms.response.submit"
});
