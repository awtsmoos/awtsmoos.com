// B"H
/**
 * B"H
 * Chapter 91: The browser vessel spoke honestly about which shells it could not open.
 */
export const BROWSER_VIRTUAL_COMMANDS = Object.freeze([
  'pwd', 'ls', 'tree', 'cat', 'head', 'tail', 'grep', 'rg', 'find', 'echo', 'help', 'clear'
]);
export const UNSUPPORTED_BROWSER_COMMAND_MESSAGE = 'This Code vessel cannot run local shell commands directly. It can run supported Merkava virtual commands or delegate to a native tunnel if connected.';
export function commandModeData(mode) {
  return { commandMode: mode, vesselType: 'awtsmoos-code', supportedCommands: [...BROWSER_VIRTUAL_COMMANDS] };
}
export function unsupportedCommandError(name = '') {
  const error = new Error(`Unsupported browser command: ${name}. ${UNSUPPORTED_BROWSER_COMMAND_MESSAGE}`);
  error.code = 'browser_command_not_native';
  error.commandMode = 'unsupported';
  return error;
}
export function helpText() {
  return `Supported browser commands:\n${BROWSER_VIRTUAL_COMMANDS.join('\n')}\n\n${UNSUPPORTED_BROWSER_COMMAND_MESSAGE}`;
}
