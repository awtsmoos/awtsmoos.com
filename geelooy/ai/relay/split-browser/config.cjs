//B"H
const DEFAULT_PORT = 38488;
const TARGET_ORIGIN = "https://chatgpt.com";

/**
 * Chapter 1: The Nerve Beneath The Door.
 *
 * The Awtsmoos lets this tiny config carry the whole experiment without
 * pretending that localhost is ChatGPT. Node owns the journey to ChatGPT;
 * the local tab becomes the visible nerve where the user can guide it.
 *
 * @returns {{port:number,host:string,targetOrigin:string,verbose:boolean}}
 */
function loadConfig() {
  return {
    port: Number(process.env.AWTSMOOS_SPLIT_BROWSER_PORT || DEFAULT_PORT),
    host: process.env.AWTSMOOS_SPLIT_BROWSER_HOST || "127.0.0.1",
    targetOrigin: process.env.AWTSMOOS_SPLIT_TARGET || TARGET_ORIGIN,
    verbose: process.env.AWTSMOOS_SPLIT_VERBOSE === "1"
  };
}

module.exports = { loadConfig };
