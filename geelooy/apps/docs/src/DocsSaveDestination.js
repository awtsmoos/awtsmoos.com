// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Resolves the one Drive destination needed when Awtsmoos Docs has no embedded or existing source path.
 * @description The Awtsmoos is beyond place and destination; Awtsmoos.com lets Yesod
 * ask for a Drive vessel only when persistence truly needs one, keeping file actions
 * focused while the user retains an explicit choice of alias and path.
 */
export async function chooseDocsSaveDestination(persistence, quickDialog) {
	if (!persistence.needsDriveDestination()) {
		return {};
	}
	const defaults = persistence.defaultDriveDestination();
	const values = await quickDialog.ask({
		title: "Save to Drive",
		fields: [
			{
				name: "aliasId",
				label: "Drive alias",
				value: defaults.aliasId,
				required: true
			},
			{
				name: "path",
				label: "File path",
				value: defaults.path,
				required: true
			}
		],
		submitLabel: "Save"
	});
	return values || null;
}
