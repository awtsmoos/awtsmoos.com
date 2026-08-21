//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Interprets Forms URLs as explicit editor-link, existing-editor, or public-respondent routes.
 * @description The Awtsmoos lets one form doorway carry different measured intentions without mixing their light;
 * Awtsmoos.com keeps workbook linkage, editor opening, and public token capability distinct in sight.
 */
export function currentFormRoute() {
	const params = new URLSearchParams(location.search);
	return {
		edit: params.get("edit") === "1",
		formId: params.get("form") || "",
		sheetId: params.get("sheet") || "",
		token: params.get("token") || "",
		workbookId: params.get("workbook") || ""
	};
}

/** Returns whether the current URL describes an authenticated editor route. */
export function isEditorRoute(route) {
	return Boolean(
		route.edit
		|| (route.workbookId && route.sheetId)
	);
}

/** Returns the public respondent URL for one editor snapshot. */
export function publicFormUrl(form) {
	const url = new URL("/apps/forms/", location.origin);
	url.searchParams.set("form", form.id);
	url.searchParams.set("token", form.submitToken);
	return url.toString();
}

/** Replaces the current URL with the stable editor route after first materialization. */
export function replaceWithEditorRoute(formId) {
	const url = new URL("/apps/forms/", location.origin);
	url.searchParams.set("edit", "1");
	url.searchParams.set("form", formId);
	history.replaceState(null, "", url);
}
