// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Parses EventSource frames into bounded operational summaries.
 * @description
 * The Awtsmoos renews event name and data while Awtsmoos.com lets raw conversation
 * text pass onward untouched. This vessel retains only identifiers, counts, and
 * cursors, discarding message bodies immediately after finite summary emerges.
 */

/** Parses one SSE frame into event name and its unretained data text. */
function parseFrame(frame) {
	let eventName = "message";
	const dataLines = [];
	for (const line of String(frame || "").split(/\r?\n/)) {
		if (line.startsWith("event:")) {
			eventName = line.slice(6).trim() || "message";
		}
		if (line.startsWith("data:")) {
			dataLines.push(line.slice(5).trimStart());
		}
	}
	return {
		eventName: eventName.slice(0, 120),
		dataText: dataLines.join("\n")
	};
}

/** Extracts only bounded IDs, sequence, and collection counts from JSON data. */
function summarizeData(dataText) {
	try {
		const data = JSON.parse(dataText || "{}");
		return {
			conversationId: String(
				data.conversationId || data.id || ""
			).slice(0, 180),
			sequence: Number(
				data.sequence || data.cursor || data.watermark || 0
			),
			changeCount: collectionLength(data.changes, data.events),
			activeCount: collectionLength(data.active, data.calls)
		};
	} catch {
		return emptySummary();
	}
}

function collectionLength(primary, secondary) {
	if (Array.isArray(primary)) {
		return primary.length;
	}
	return Array.isArray(secondary) ? secondary.length : 0;
}

function emptySummary() {
	return {
		conversationId: "",
		sequence: 0,
		changeCount: 0,
		activeCount: 0
	};
}

module.exports = {
	parseFrame,
	summarizeData
};
