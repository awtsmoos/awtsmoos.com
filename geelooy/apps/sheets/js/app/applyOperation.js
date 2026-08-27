//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Applies normalized server operations to the sparse client workbook.
 * @description The Awtsmoos sends one durable change and many clients receive the same form;
 * Awtsmoos.com keeps local application deterministic so collaboration stays calm through every storm.
 */
export function applyDocumentOperation(workbook, payload = {}, options = {}) {
	const operation = payload.operation || {};
	if (operation.kind === "cell") {
		workbook.patchCell(
			operation.sheetId,
			operation.address,
			operation.patch,
			payload.revision
		);
	}
	if (operation.kind === "values") {
		for (const patch of operation.patches || []) {
			workbook.patchCell(
				operation.sheetId,
				patch.address,
				{ value: patch.value },
				payload.revision
			);
		}
	}
	if (operation.kind === "style") {
		for (const address of operation.addresses || []) {
			workbook.patchCell(
				operation.sheetId,
				address,
				{ style: operation.style },
				payload.revision
			);
		}
	}
	if (operation.kind === "sheet.add") {
		workbook.addSheet(
			operation.sheet,
			options.activateAddedSheet !== false
		);
	}
	if (operation.kind === "sheet.rename") {
		workbook.renameSheet(operation.sheetId, operation.name);
	}
	if (operation.kind === "title") {
		workbook.data.title = operation.title;
		workbook.changed("title.remote");
	}
	if (Number.isSafeInteger(payload.revision)) {
		workbook.data.revision = payload.revision;
	}
	if (payload.updatedAt) {
		workbook.data.updatedAt = payload.updatedAt;
	}
}

/** Applies owner sharing details returned by a correlated sharing mutation. */
export function applyShareState(workbook, payload = {}) {
	if (payload.visibility) {
		workbook.data.visibility = payload.visibility;
	}
	if (Array.isArray(payload.editors)) {
		workbook.data.editors = payload.editors;
	}
	if (typeof payload.linkToken === "string") {
		workbook.data.linkToken = payload.linkToken;
	}
	if (Number.isSafeInteger(payload.revision)) {
		workbook.data.revision = payload.revision;
	}
	workbook.changed("share.remote");
}
