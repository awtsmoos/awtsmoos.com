//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createNativeAndroidLooperState } from "../core/native/nativeAndroidLooperState.js";
import { createNativePipeState } from "../core/native/nativePipeState.js";

const THREAD = 0x5000n;

test("pipe bytes become ALooper input readiness and clear after read", () => {
	const fixture = createFixture();
	const handle = fixture.loopers.prepare(THREAD);
	fixture.loopers.addFd(handle, {
		callback: 0n,
		data: 0xabcden,
		events: 1,
		fd: fixture.pair.readFd,
		ident: 42
	});
	assert.equal(fixture.loopers.poll(THREAD).kind, "timeout");
	fixture.pipes.write(fixture.pair.writeFd, Uint8Array.of(1));
	const event = fixture.loopers.poll(THREAD);
	assert.equal(event.kind, "event");
	assert.equal(event.fd, fixture.pair.readFd);
	assert.equal(event.events, 1);
	fixture.pipes.read(fixture.pair.readFd, 1);
	assert.equal(fixture.loopers.poll(THREAD).kind, "timeout");
});

test("writer close produces input and hangup readiness", () => {
	const fixture = createFixture();
	const handle = fixture.loopers.prepare(THREAD);
	fixture.loopers.addFd(handle, {
		callback: 0n,
		data: 0n,
		events: 17,
		fd: fixture.pair.readFd,
		ident: 7
	});
	fixture.pipes.close(fixture.pair.writeFd);
	const event = fixture.loopers.poll(THREAD);
	assert.equal(event.kind, "event");
	assert.equal(event.events, 17);
});

function createFixture() {
	const pipes = createNativePipeState();
	const pair = pipes.create(0);
	const loopers = createNativeAndroidLooperState({
		descriptorEvents: descriptor => pipes.events(descriptor)
	});
	return { loopers, pair, pipes };
}
