//B"H
import assert from "node:assert/strict";
import fs from "node:fs";

const controller = fs.readFileSync("geelooy/ai/js/app/conversationController.js", "utf8");
const renderer = fs.readFileSync("geelooy/ai/js/render/messageRenderer.js", "utf8");
const exporter = fs.readFileSync("geelooy/ai/js/export/chatHtmlExporter.js", "utf8");

assert.match(controller, /return stream\.route\(packet\)/, "onstream must return the stream queue promise");
assert.match(controller, /return finish\.then\(\(\) => hooks\.ondone/, "ondone must wait for finish before automation hooks");
assert.match(controller, /if \(stream\?\.queue\) await stream\.queue;/, "service response must wait for queued visible packets");
assert.match(renderer, /this\.performLiveRefresh\(record\)/, "finalizeLiveRecords must flush final DOM synchronously");
assert.match(exporter, /downloadCurrentChatJson/, "debug JSON exporter must be present");
assert.match(exporter, /records: records\.map\(serializeRecord\)/, "debug JSON must serialize full renderer records");

console.log("B'H stream ordering and debug export contract passed");
