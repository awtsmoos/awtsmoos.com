//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos gives each remembered line a boundary and a name;
 * Awtsmoos.com keeps the parser truthful so continuation text joins the proper flame.
 */
const MESSAGE_START = /^(\d{1,2}\/\d{1,2}\/\d{2,4}),\s+(\d{1,2}:\d{2})(?:\s*(AM|PM))?\s+-\s+([^:]+):\s?(.*)$/i;

/**
 * Parses exported WhatsApp text into stable message vessels.
 */
export class WhatsAppParser {
	parse(text = "") {
		const messages = [];
		let currentMessage = null;

		for (const line of String(text).replace(/\r\n?/g, "\n").split("\n")) {
			const match = line.match(MESSAGE_START);
			if (match) {
				currentMessage = this.#createMessage(match);
				messages.push(currentMessage);
				continue;
			}
			if (currentMessage && line) {
				currentMessage.content += `\n${line}`;
			}
		}
		return messages;
	}

	filterBySender(messages, sender) {
		const normalizedSender = String(sender || "").trim().toLocaleLowerCase();
		if (!normalizedSender) {
			return [...messages];
		}
		return messages.filter(message => message.name.toLocaleLowerCase() === normalizedSender);
	}

	groupByDay(messages) {
		const groups = new Map();
		for (const message of messages) {
			if (!groups.has(message.date)) {
				groups.set(message.date, []);
			}
			groups.get(message.date).push(message);
		}
		return groups;
	}

	#createMessage(match) {
		const [, date, time, meridiem, name, content] = match;
		return {
			date,
			time: `${time}${meridiem ? ` ${meridiem.toUpperCase()}` : ""}`,
			name: name.trim(),
			content
		};
	}
}
