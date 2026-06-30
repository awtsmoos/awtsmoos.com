// B"H
export function parseCommand(input = '') {
  const tokens = []; let current = ''; let quote = ''; let escaping = false;
  for (const char of String(input)) {
    if (escaping) { current += char; escaping = false; continue; }
    if (char === '\\') { escaping = true; continue; }
    if (quote) { if (char === quote) quote = ''; else current += char; continue; }
    if (char === '"' || char === "'") { quote = char; continue; }
    if (/\s/.test(char)) { if (current) { tokens.push(current); current = ''; } continue; }
    current += char;
  }
  if (current) tokens.push(current);
  return { cmd:(tokens.shift() || '').toLowerCase(), args:tokens };
}
export const COMMAND_NAMES = ['help','pwd','ls','ll','tree','cd','mkdir','touch','rm','mv','cp','cat','head','tail','grep','find','stat','open','edit','history','clear','exit','mounts','tunnels','connect','disconnect','reload','refresh','whoami','hostname','date','time','echo','env','read','write','json','preview','search'];
/** B"H: Quotes and spaces bow into tokens; command names form a safe constellation. */
