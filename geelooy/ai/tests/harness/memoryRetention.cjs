//B"H
const { pathToFileURL } = require("url");
const path = require("path");
const { ROOT, assert, test } = require("./assert.cjs");

/**
 * B"H — guards the cockpit from secretly chaining huge provider bodies.
 *
 * The page may show the meaning of hidden events, but it must not retain the
 * whole raw packet in every render record. These checks make the memory boundary
 * explicit so future features cannot reopen the abyss by accident.
 */
async function run() {
  return test("memory-retention-boundaries", async () => {
    const classifierUrl = pathToFileURL(path.join(ROOT, "js/render/normalizer/transportClassifier.js")).href;
    const normalizerUrl = pathToFileURL(path.join(ROOT, "js/render/messageNormalizer.js")).href;
    const runtimeUrl = pathToFileURL(path.join(ROOT, "js/render/runtime/recordRuntime.js")).href;
    const safeUrlUrl = pathToFileURL(path.join(ROOT, "js/render/safeUrl.js")).href;
    const inlineUrl = pathToFileURL(path.join(ROOT, "js/render/markdown/inline.js")).href;
    const { classifyTransportEvent } = await import(`${classifierUrl}?h=${Date.now()}`);
    const { normalizeMessage } = await import(`${normalizerUrl}?h=${Date.now()}`);
    const { makeRecord, snapshotRecord } = await import(`${runtimeUrl}?h=${Date.now()}`);
    const { safeHttpUrl } = await import(`${safeUrlUrl}?h=${Date.now()}`);
    const { inlineMarkdown } = await import(`${inlineUrl}?h=${Date.now()}`);

    const huge = "x".repeat(120000);
    const packet = {
      type: "thoughts",
      message: {
        id: "m-heavy",
        channel: "analysis",
        author: { role: "assistant" },
        metadata: { request_id: "r-heavy", reasoning_status: "thinking", enormous: huge },
        content: { content_type: "thoughts", text: huge }
      },
      body: huge,
      nested: { huge }
    };

    const event = classifyTransportEvent(packet);
    assert(event && event.kind === "thinking", "thinking event should survive compaction", { event });
    assert(JSON.stringify(event.raw).length < 3000, "event raw should be compact", { rawLength: JSON.stringify(event.raw).length });
    assert(!JSON.stringify(event.raw).includes(huge.slice(0, 1000)), "event raw should not retain huge text");

    const visiblePacket = { message: { id: "visible", author: { role: "assistant" }, content: { content_type: "text", parts: [huge] } } };
    const normalized = normalizeMessage(visiblePacket);
    assert(normalized.text.length === huge.length, "normalizer should preserve visible text", { normalizedLength: normalized.text.length });
    const record = makeRecord(visiblePacket);
    const snapshot = snapshotRecord(record);
    assert(JSON.stringify(snapshot.raw).length < 1000, "record snapshot raw should be diagnostic only", { raw: snapshot.raw });
    assert(snapshot.text.length === huge.length, "visible text remains intact", { textLength: snapshot.text.length });

    assert(!safeHttpUrl("javascript:alert(1)"), "javascript links must be rejected");
    assert(!safeHttpUrl("data:text/html,evil"), "data links must be rejected");
    assert(safeHttpUrl("https://example.com/a?b=1&amp;c=2").includes("&c=2"), "escaped HTTPS query should normalize");
    const renderedLinks = inlineMarkdown(`[bad](javascript:alert(1)) [ok](https://example.com/?q=1&amp;x=2)`);
    assert(!/javascript:alert/i.test(renderedLinks), "rendered markdown must not contain javascript href", { renderedLinks });
    assert(/rel="noopener noreferrer"/.test(renderedLinks), "rendered link should use noopener noreferrer", { renderedLinks });

    return { compactEventRaw: true, compactSnapshotRaw: true, visibleTextLength: snapshot.text.length, safeLinks: true };
  });
}

module.exports = { run };
