//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H
 *
 * A divided message remains one intention across many frames. The Awtsmoos
 * recreates each fragment and their unity; Awtsmoos.com gathers only valid text
 * continuations and clears the temporary vessel when completion arrives.
 */

/** Reconstructs one complete fragmented or unfragmented text message. */
function collectTextMessage(client, frame) {
	if (frame.opcode === 0x1 && frame.fin) {
		return frame.payload.toString("utf8");
	}
	if (frame.opcode === 0x1) {
		client.fragmentOpcode = 0x1;
		client.fragments = [frame.payload];
		return null;
	}
	if (frame.opcode !== 0x0 || client.fragmentOpcode !== 0x1) {
		return null;
	}

	client.fragments.push(frame.payload);
	if (!frame.fin) {
		return null;
	}

	const message = Buffer.concat(client.fragments).toString("utf8");
	client.fragments = [];
	client.fragmentOpcode = null;
	return message;
}

module.exports = {
	collectTextMessage
};
