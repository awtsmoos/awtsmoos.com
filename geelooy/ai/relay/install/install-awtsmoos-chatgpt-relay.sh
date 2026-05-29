#!/usr/bin/env sh
# B"H
# Chapter 18: The Unix River Dropped The Unused Bridge.
# This installer downloads only the modules the running split-browser server
# needs, then starts the real local /control relay with `node index.js`.
set -eu

BASE_URL="https://awtsmoos.com/ai/relay/split-browser"
AWTSMOOS_HOME="${XDG_DATA_HOME:-$HOME/.local/share}/awtsmoos/chatgpt-relay/split-browser"
PORT="${AWTSMOOS_SPLIT_BROWSER_PORT:-38488}"
RELAY_FILES="authState.cjs autoLogin.cjs automation.cjs bodyPolicy.cjs bodyTransform.cjs browserRewrite.cjs browserShim.cjs cdpChrome.cjs clientDiagnostics.cjs clientState.cjs config.cjs controlPage.cjs cookieJar.cjs debugApi.cjs debugClient.cjs headerMap.cjs http.cjs index.js jsPreamble.cjs logger.cjs originPolicy.cjs proxy.cjs relayApi.cjs rewriteHtml.cjs rewriteText.cjs routeNormalize.cjs server.cjs urlMap.cjs"

say() { printf '%s\n' "B\"H Awtsmoos split relay :: $*"; }
has() { command -v "$1" >/dev/null 2>&1; }
fetch() {
  if has curl; then curl -fsSL "$1" -o "$2"; return; fi
  if has wget; then wget -q "$1" -O "$2"; return; fi
  say "curl or wget is required to download the relay."
  exit 1
}

install_node_if_missing() {
  if has node; then say "Node already exists: $(node --version)"; return; fi
  say "Node was not found. Trying common package managers."
  if has brew; then brew install node
  elif has apt-get; then sudo apt-get update && sudo apt-get install -y nodejs npm
  elif has dnf; then sudo dnf install -y nodejs npm
  elif has yum; then sudo yum install -y nodejs npm
  elif has pacman; then sudo pacman -Sy --noconfirm nodejs npm
  else
    say "Node LTS is required. Install Node, then rerun this script."
    exit 1
  fi
  has node || { say "Node still is not on PATH. Open a new shell and rerun."; exit 1; }
}

install_relay() {
  mkdir -p "$AWTSMOOS_HOME"
  for file in $RELAY_FILES; do
    say "Downloading $file"
    fetch "$BASE_URL/$file" "$AWTSMOOS_HOME/$file"
  done
  test -f "$AWTSMOOS_HOME/index.js" || { say "Relay entry was not downloaded."; exit 1; }
  chmod +x "$AWTSMOOS_HOME/index.js"
}

start_relay() {
  say "Starting split relay on http://127.0.0.1:$PORT/control"
  AWTSMOOS_SPLIT_BROWSER_PORT="$PORT" nohup node "$AWTSMOOS_HOME/index.js" > "$AWTSMOOS_HOME/relay.log" 2>&1 &
  sleep 2
  if has curl; then curl -fsSL "http://127.0.0.1:$PORT/health" || true; fi
  say "Logs: $AWTSMOOS_HOME/relay.log"
}

install_node_if_missing
install_relay
start_relay
say "Done. Open http://127.0.0.1:$PORT/control"
