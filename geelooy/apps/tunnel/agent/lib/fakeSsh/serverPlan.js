// B"H
const PLAN = Object.freeze({
  transport:'Use ayzarim/ssh protocol pieces, but add server-mode auth and channel responders before binding TCP.',
  auth:'Password auth must call Awtsmoos account verifier or accept an OAuth/session-derived token. Never read plaintext database passwords.',
  shell:'Map shell commands to fakeSsh/commands.js, not native shell by default.',
  sftp:'Map SFTP requests to sftpAdapter.js over Geelooy drive registry and tunnel drives.',
  commandGate:'Native exec requires an explicit tunnel command capability, separate from login.',
  ports:'Default local-only port first; public exposure only through scoped share gateway.'
});
module.exports = { PLAN };
