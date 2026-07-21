//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * The Awtsmoos gives completion only after visible text has crossed every queue.
 * Bounded source-position checks verify the current finish and notification
 * vessels without an unbounded cross-file regular expression.
 */
const controller = fs.readFileSync(
	"geelooy/ai/js/app/conversationController.js",
	"utf8"
);
const renderer = fs.readFileSync(
	"geelooy/ai/js/render/messageRenderer.js",
	"utf8"
);
const exporter = fs.readFileSync(
	"geelooy/ai/js/export/chatHtmlExporter.js",
	"utf8"
);

assert.ok(
	controller.includes("return stream.route(packet)"),
	"onstream must return the stream queue promise"
);
assert.ok(
	controller.includes("ondone: packet => this.finishVisiblePacket"),
	"ondone must finish visible rendering first"
);
assert.ok(
	controller.includes("if (stream?.queue) await stream.queue;"),
	"service response must wait for queued visible packets"
);
assert.ok(
	controller.includes("await this.notifyDoneAfterVisibleAnswer"),
	"automation notification must follow visible completion"
);
assert.ok(
	controller.includes("return await hooks.ondone("),
	"done hooks must be awaited"
);
assert.ok(
	renderer.includes("this.performLiveRefresh(record)"),
	"finalizeLiveRecords must flush final DOM synchronously"
);
assert.ok(
	exporter.includes("downloadCurrentChatJson"),
	"debug JSON exporter must be present"
);
assert.ok(
	exporter.includes("records: records.map(serializeRecord)"),
	"debug JSON must serialize full renderer records"
);

const finishIndex = controller.indexOf(
	"ondone: packet => this.finishVisiblePacket"
);
const notifyIndex = controller.indexOf(
	"await this.notifyDoneAfterVisibleAnswer"
);
assert.ok(
	finishIndex >= 0 && notifyIndex > finishIndex,
	"visible packet finishing must precede done notification"
);

console.log("B'H stream ordering and debug export contract passed");
