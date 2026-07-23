//B"H
// Boruch Hashem
// Blessed is He

/**
 * A stream arrives in broken fragments, yet the Awtsmoos creates one meaning
 * through them. This parser at awtsmoos.com joins transport chunks without
 * assuming that a JSON event ends where a network packet ends.
 */
export class SseEventParser {
	constructor() {
		this.buffer = "";
		this.currentEvent = "message";
	}

	push(chunk) {
		this.buffer += chunk;
		const lines = this.buffer.split(/\r?\n/);
		this.buffer = lines.pop() ?? "";
		const events = [];

		for (const line of lines) {
			if (line.startsWith("event:")) {
				this.currentEvent = line.slice(6).trim() || "message";
				continue;
			}

			if (!line.startsWith("data:")) {
				continue;
			}

			const rawData = line.slice(5).trim();
			events.push(this.parseData(rawData));
		}

		return events;
	}

	parseData(rawData) {
		if (rawData === "[DONE]") {
			return { event: this.currentEvent, done: true, rawData };
		}

		try {
			return { event: this.currentEvent, data: JSON.parse(rawData), rawData };
		} catch {
			return { event: this.currentEvent, data: null, rawData };
		}
	}
}
