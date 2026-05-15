
// B"H
const { parseIncomingBody } = require("../request/body/parseIncomingBody.js");

function shouldLogBody(request) {
  return String(request.url || "").startsWith("/login");
}

function redactRaw(text) {
  return String(text || "")
    .replace(/(password=)[^&]*/gi, "$1[REDACTED]")
    .replace(/("password"\s*:\s*")[^"]*/gi, "$1[REDACTED]");
}

function safeShape(obj) {
  const out = {};
  for (const [key, value] of Object.entries(obj || {})) {
    if (/password/i.test(key)) {
      out[key] = {
        type: typeof value,
        present: !!value,
        length: value == null ? 0 : String(value).length,
        redacted: true
      };
    } else {
      out[key] = {
        type: typeof value,
        value,
        present: value !== undefined && value !== null,
        length: value == null ? 0 : String(value).length
      };
    }
  }
  return out;
}

function logBodyStage(request, stage, data) {
  if (!shouldLogBody(request)) return;
  try {
    console.log("B\"H BODY DEBUG", JSON.stringify({
      stage,
      time: Date.now(),
      method: request.method,
      url: request.url,
      data
    }, null, 2));
  } catch (e) {
    console.log("B\"H BODY DEBUG LOG_FAILED", stage, e && e.message);
  }
}

function readData(options) {
  const method = String(options.method || "POST").toUpperCase();
  const request = options.request;

  if (request.method.toUpperCase() !== method) {
    return Promise.resolve(null);
  }

  if (options.cache[method]) {
    logBodyStage(request, "cache_hit_before_parse", {
      method,
      existingParamShape: safeShape(options.paramKinds[method])
    });
    return options.cache[method];
  }

  options.cache[method] = new Promise((resolve, reject) => {
    const contentType = request.headers["content-type"] || "";
    const chunks = [];

    logBodyStage(request, "reader_start", {
      method,
      contentType,
      contentLength: request.headers["content-length"] || ""
    });

    request.on("data", chunk => {
      chunks.push(chunk);
      logBodyStage(request, "chunk", {
        chunkLength: chunk.length,
        totalLength: chunks.reduce((n, c) => n + c.length, 0)
      });
    });

    request.on("error", err => {
      logBodyStage(request, "stream_error", { message: err.message });
      reject(err);
    });

    request.on("end", () => {
      const bodyBuffer = Buffer.concat(chunks);
      const rawText = bodyBuffer.toString("utf8");

      logBodyStage(request, "raw_body", {
        byteLength: bodyBuffer.length,
        preview: redactRaw(rawText.slice(0, 500))
      });

      const parsed = parseIncomingBody({
        contentType,
        bodyBuffer,
        querystring: options.querystring,
        parseMultipartFormData: options.parseMultipartFormData
      });

      options.paramKinds[method] = parsed || {};
      request.rawBody = bodyBuffer;
      request.body = options.paramKinds[method];

      logBodyStage(request, "parsed_body", {
        parsedType: Array.isArray(parsed) ? "array" : typeof parsed,
        parsedKeys: Object.keys(options.paramKinds[method] || {}),
        parsedShape: safeShape(options.paramKinds[method])
      });

      resolve(options.paramKinds[method]);
    });

    request.resume();
  });

  return options.cache[method];
}

function createBodyReaders(options) {
  const cache = {};
  return {
    getPostData() {
      return readData({ ...options, cache, method: "POST" });
    },
    getPutData() {
      return readData({ ...options, cache, method: "PUT" });
    },
    getDeleteData() {
      return readData({ ...options, cache, method: "DELETE" });
    }
  };
}

module.exports = { createBodyReaders };
