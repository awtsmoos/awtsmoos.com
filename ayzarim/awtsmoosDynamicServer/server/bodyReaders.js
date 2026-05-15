
// B"H

const { parseIncomingBody } = require("../request/body/parseIncomingBody.js");

/**
 * B"H
 * Reads and parses one request body.
 *
 * @param {object} options Reader options.
 * @returns {Promise<object|null>} Parsed body.
 */
function readData(options) {
  const method = String(options.method || "POST").toUpperCase();
  const request = options.request;

  if (request.method.toUpperCase() !== method) {
    return Promise.resolve(null);
  }

  if (options.cache[method]) return options.cache[method];

  options.cache[method] = new Promise((resolve, reject) => {
    const contentType = request.headers["content-type"] || "";
    const chunks = [];

    request.on("data", chunk => chunks.push(chunk));
    request.on("error", err => reject(err));

    request.on("end", () => {
      const bodyBuffer = Buffer.concat(chunks);

      const parsed = parseIncomingBody({
        contentType,
        bodyBuffer,
        querystring: options.querystring,
        parseMultipartFormData: options.parseMultipartFormData
      });

      options.paramKinds[method] = parsed || {};
      request.rawBody = bodyBuffer;
      request.body = options.paramKinds[method];

      resolve(options.paramKinds[method]);
    });

    request.resume();
  });

  return options.cache[method];
}

/**
 * B"H
 * Creates cached POST, PUT, and DELETE body readers.
 *
 * @param {object} options Reader options.
 * @returns {object} Body reader functions.
 */
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
