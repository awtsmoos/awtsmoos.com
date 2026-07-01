// B"H
function text(server, all = []) {
  if (!server) return 'I did not find a reachable local HTTP server on the common development ports. Start the app, then ask for a preview again or provide a port.';
  const title = server.title ? ` titled “${server.title}”` : '';
  const more = all.length > 1 ? ` I also saw ${all.length - 1} other reachable server(s), so you can steer to another port if needed.` : '';
  return `I found a local server on port ${server.port}${title}. Use the preview URL to inspect it through the tunnel. If this is not the app you meant, choose a different detected server or pass the exact port.${more}`;
}
function payload(server) { return server ? { action:'previewExposeLocalServer', port:server.port, url:server.url } : null; }
/** B"H — Natural guidance lets the AI pick, steer, or ask without guessing. */
module.exports = { text, payload };
