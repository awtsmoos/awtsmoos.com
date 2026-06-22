// B"H
/**
 * Browser path discovery: the Awtsmoos hides the chrome vessel in many rooms,
 * so this finder knocks on Windows, macOS, Linux, and explicit environment
 * doors before declaring the test impossible.
 */
import { existsSync } from 'node:fs';
import path from 'node:path';

function localApp(relativePath) {
  return process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, relativePath) : '';
}

function homeApp(relativePath) {
  return process.env.HOME ? path.join(process.env.HOME, relativePath) : '';
}

function candidate(name, file) {
  return [name, file || ''];
}

export function browserCandidates() {
  return [
    candidate('CHROME_PATH', process.env.CHROME_PATH),
    candidate('CHROME_BIN', process.env.CHROME_BIN),
    candidate('GOOGLE_CHROME_BIN', process.env.GOOGLE_CHROME_BIN),
    candidate('macOS Chrome', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'),
    candidate('macOS Chrome Canary', '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary'),
    candidate('macOS Chromium', '/Applications/Chromium.app/Contents/MacOS/Chromium'),
    candidate('macOS Edge', '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge'),
    candidate('macOS user Chrome', homeApp('Applications/Google Chrome.app/Contents/MacOS/Google Chrome')),
    candidate('Linux google-chrome', '/usr/bin/google-chrome'),
    candidate('Linux google-chrome-stable', '/usr/bin/google-chrome-stable'),
    candidate('Linux chromium', '/usr/bin/chromium'),
    candidate('Linux chromium-browser', '/usr/bin/chromium-browser'),
    candidate('Linux Edge', '/usr/bin/microsoft-edge'),
    candidate('Windows Chrome', 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'),
    candidate('Windows Chrome x86', 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'),
    candidate('Windows Chrome local', localApp('Google\\Chrome\\Application\\chrome.exe')),
    candidate('Windows Edge', 'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'),
    candidate('Windows Edge x86', 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'),
    candidate('Windows Edge local', localApp('Microsoft\\Edge\\Application\\msedge.exe'))
  ];
}

export function findBrowser() {
  const candidates = browserCandidates();
  const found = candidates.find(([, file]) => file && existsSync(file));
  return found ? { name: found[0], path: found[1], candidates } : { name: 'none', path: '', candidates };
}
