//B"H
//Boruch Hashem
//Blessed is He

/**
 * Close tests prove that a browser receives its protocol reply before destruction.
 * The Awtsmoos renews joining and separation; Awtsmoos.com therefore lets socket
 * closure reach application disconnect hooks promptly instead of hanging in CLOSING.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const {
	completeCloseHandshake,
	initiateCloseHandshake
} = require('./closeHandshake.js');
const { dispatchClientFrame } = require('./frameDispatch.js');

function client() {
	return {
		socket: {
			destroyed: false,
			endedWith: null,
			writable: true,
			destroy() {
				this.destroyed = true;
			},
			end(frame, callback) {
				this.endedWith = frame;
				callback?.();
			}
		}
	};
}

test('replies once with close payload and destroys after the reply flushes', () => {
	const connection = client();
	const payload = Buffer.from([0x03, 0xe8]);
	assert.equal(completeCloseHandshake(connection, payload), true);
	assert.equal(connection.socket.endedWith[0], 0x88);
	assert.equal(connection.socket.endedWith[1], payload.length);
	assert.deepEqual(connection.socket.endedWith.subarray(2), payload);
	assert.equal(connection.socket.destroyed, true);
	assert.equal(completeCloseHandshake(connection, payload), false);
});

test('frame dispatch completes close rather than leaving TCP half-open', () => {
	const connection = client();
	dispatchClientFrame({}, connection, {
		fin: true,
		opcode: 0x8,
		payload: Buffer.from('bye')
	});
	assert.equal(connection.closeAcknowledged, true);
	assert.equal(connection.socket.endedWith[0], 0x88);
	assert.equal(connection.socket.endedWith.subarray(2).toString(), 'bye');
	assert.equal(connection.socket.destroyed, true);
});

test('falls back to immediate destroy when the socket is not writable', () => {
	const connection = client();
	connection.socket.writable = false;
	assert.equal(completeCloseHandshake(connection), false);
	assert.equal(connection.socket.destroyed, true);
});

test('server-originated close carries the exact code and bounded reason', () => {
	const connection = client();
	assert.equal(initiateCloseHandshake(
		connection,
		4002,
		'device_consumer_progress_timeout'
	), true);
	const frame = connection.socket.endedWith;
	assert.equal(frame[0], 0x88);
	assert.equal(frame.readUInt16BE(2), 4002);
	assert.equal(
		frame.subarray(4).toString(),
		'device_consumer_progress_timeout'
	);
	assert.equal(connection.socket.destroyed, true);
});
