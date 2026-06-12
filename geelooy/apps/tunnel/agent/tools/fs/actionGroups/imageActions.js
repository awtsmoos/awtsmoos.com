// B"H
const { writeImage } = require("../image/writeImage.js");

/**
 * B"H
 * Chapter 6: Three names opened one gate of light.
 *
 * writeImage, imageWrite, and uploadImage are aliases for the same guarded act:
 * a generated image becomes a real local file, and the caller receives exact
 * coordinates for an app, static server, or public storage layer.
 *
 * @param {{config:object,payload:object}} ctx Tunnel action context.
 * @returns {object} Image action map.
 */
function buildImageActions(ctx) {
  const { config, payload } = ctx;
  return {
    async writeImage() { return await writeImage(config, payload, "writeImage"); },
    async imageWrite() { return await writeImage(config, payload, "imageWrite"); },
    async uploadImage() { return await writeImage(config, payload, "uploadImage"); }
  };
}

module.exports = { buildImageActions };
