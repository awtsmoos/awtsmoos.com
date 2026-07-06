#!/usr/bin/env node
// B"H
import assert from "node:assert/strict";
import { pinchDeltaY, pinchPacket, touchDistance } from "../../ckidsAwtsmoos/Olam/worker/input/TouchPinchZoom.js";

const a = { pageX:100, pageY:100 };
const b = { pageX:140, pageY:100 };
const c = { pageX:170, pageY:100 };

assert.equal(touchDistance(a, b), 40);
assert.equal(pinchDeltaY(40, 70), -240, "spreading fingers must become negative wheel delta for camera zoom-in");
assert.equal(pinchDeltaY(70, 40), 240, "pinching fingers together must become positive wheel delta for camera zoom-out");

const packet = pinchPacket(touchDistance(a, b), a, c, "audit");
assert.equal(packet.nextDistance, 70);
assert.equal(packet.wheel.source, "touch-orchestrator-pinch");
assert.equal(packet.wheel.multiTouch, true);
assert.equal(packet.wheel.deltaY, -240);

console.log(JSON.stringify({ ok:true, pinchZoom:"touch-orchestrator-wheel", deltaY:packet.wheel.deltaY }, null, 2));
