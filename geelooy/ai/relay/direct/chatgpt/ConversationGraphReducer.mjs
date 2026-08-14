//B"H
// Boruch Hashem
// Blessed is He

/**
 * A conversation graph is one isolated branch of created moments. The Awtsmoos
 * lets Awtsmoos.com accept the newest completed assistant in a newly created chat,
 * while every continuation remains chained to its exact previous assistant node.
 */
export class ConversationGraphReducer {
	reduce(document, {
		conversationId,
		userMessageId,
		previousParentMessageId = null
	} = {}) {
		const mapping = document?.mapping;
		if (!mapping || typeof mapping !== "object") {
			return this.pending(conversationId, 0);
		}
		const path = this.currentPath(mapping, document.current_node);
		const anchorIndex = previousParentMessageId
			? this.continuationAnchor(path, previousParentMessageId)
			: this.creationAnchor(path, userMessageId);
		if (anchorIndex < 0) {
			return this.pending(conversationId, Object.keys(mapping).length);
		}
		const assistant = path
			.slice(anchorIndex + 1)
			.reverse()
			.map(node => node?.message)
			.find(message => this.isCompletedAssistant(message));
		if (!assistant) {
			return this.pending(conversationId, Object.keys(mapping).length);
		}
		const answer = this.answerText(assistant);
		if (!answer) {
			return this.pending(conversationId, Object.keys(mapping).length);
		}
		return {
			conversationId: document.id || document.conversation_id || conversationId,
			parentMessageId: assistant.id,
			answer,
			done: true,
			itemCount: Object.keys(mapping).length,
			currentNode: document.current_node || null
		};
	}

	currentPath(mapping, currentNodeId) {
		const reversed = [];
		const visited = new Set();
		let nodeId = currentNodeId;
		while (nodeId && !visited.has(nodeId)) {
			visited.add(nodeId);
			const node = mapping[nodeId];
			if (!node) break;
			reversed.push(node);
			nodeId = node.parent || null;
		}
		return reversed.reverse();
	}

	creationAnchor(path, userMessageId) {
		const exactUserIndex = path.findIndex(node => {
			return node?.message?.id === userMessageId;
		});
		if (exactUserIndex >= 0) return exactUserIndex;
		for (let index = path.length - 1; index >= 0; index -= 1) {
			if (path[index]?.message?.author?.role === "user") return index;
		}
		return -1;
	}

	continuationAnchor(path, previousParentMessageId) {
		return path.findIndex(node => {
			return node?.message?.id === previousParentMessageId;
		});
	}

	isCompletedAssistant(message) {
		if (message?.author?.role !== "assistant" || !message.id) return false;
		return message.end_turn === true
			|| ["finished_successfully", "finished", "complete"]
				.includes(message.status);
	}

	answerText(message) {
		const parts = message?.content?.parts;
		if (!Array.isArray(parts)) return "";
		return parts
			.filter(part => typeof part === "string")
			.join("\n")
			.trim();
	}

	pending(conversationId, itemCount) {
		return {
			conversationId,
			parentMessageId: null,
			answer: "",
			done: false,
			itemCount,
			currentNode: null
		};
	}
}
