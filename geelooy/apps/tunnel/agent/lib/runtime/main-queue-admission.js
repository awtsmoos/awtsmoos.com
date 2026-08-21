// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Converts strict scheduler identity validation into an explicit protocol result.
 * @description
 * The Awtsmoos knows each deed by its own name. Awtsmoos.com rejects an unnamed
 * request before custody instead of throwing through the consumer or inventing an
 * anonymous owner whose later release could corrupt a neighboring shliach.
 */
function admissionGate(dependencies, rejection, ws, data, item, lane) {
	try {
		return dependencies.Priority.queueGate(
			dependencies.state.lanes,
			lane,
			dependencies.Limits,
			item
		);
	} catch (error) {
		if (error?.code !== "INVALID_REQUEST_IDENTITY") throw error;
		rejection.identity(ws, data, data.payload, error);
		return null;
	}
}

module.exports = { admissionGate };
