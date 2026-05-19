//B"H

/**
 * B"H — SSE parser that only releases complete events.
 *
 * The previous line splitter could revisit partial lines on every chunk. This
 * parser waits for the blank-line SSE boundary, so live thoughts/tool/status
 * packets do not duplicate while streaming.
 */
export async function logStream(response, callback) {
  const hasCallback = typeof callback === "function";
  const emit = hasCallback ? callback : () => {};
  if (!response.ok) {
    console.error("Network response was not ok:", globalThis.resp = response);
    return { message: "Something happened" };
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";
  let message = null;
  const otherEvents = [];
  const seen = new Set();

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      flush(buffer, true);
      if (message) message.awtsmoos = { otherEvents };
      console.log("Stream finished", message);
      return message;
    }
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split(/\r?\n\r?\n/);
    buffer = parts.pop() || "";
    for (const part of parts) flush(part, false);
  }

  function flush(block, final) {
    const trimmed = String(block || "").trim();
    if (!trimmed) return;
    let curEvent = null;
    const dataLines = [];
    for (const line of trimmed.split(/\r?\n/)) {
      if (line.startsWith("event:")) curEvent = line.slice(6).trim();
      if (line.startsWith("data:")) dataLines.push(line.slice(5).trimStart());
    }
    if (!dataLines.length) return;
    const data = dataLines.join("\n").trim();
    const key = `${curEvent || "message"}:${data}`;
    if (seen.has(key)) return;
    seen.add(key);
    try {
      const jsonData = JSON.parse(data);
      const packet = { data: jsonData, event: curEvent };
      if (jsonData.message?.content?.parts) message = jsonData.message;
      else otherEvents.push(jsonData);
      emit(packet);
    } catch (error) {
      const packet = { dataNoJSON: data, event: curEvent, error };
      if (data !== "[DONE]" || final) emit(packet, "done");
    }
  }
}
