// B"H
const assert = require("assert");
const fs = require("fs");

const html = fs.readFileSync("geelooy/apps/tunnel/index.html", "utf8");
assert(html.includes("Awtsmoos Unified Tunnel"));
assert(html.includes("id=\"browser-mode\""));
assert(html.includes("id=\"startBrowserTunnel\""));
assert(html.includes("id=\"stopBrowserTunnel\""));
assert(html.includes("/geelooy/os/"));
assert(html.includes("/apps/code/"));
assert(html.includes("./js/main.js"));
assert(html.includes("irm https://awtsmoos.com/api/tunnel/install/windows | iex"));
assert(html.includes("curl -fsSL https://awtsmoos.com/api/tunnel/install/unix | bash"));
console.log("BHY /apps/tunnel index HTML tests passed");
