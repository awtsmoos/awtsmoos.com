#!/usr/bin/env sh
# B"H
# Chapter 2: The Unix River Found The Public Gate.
# The Awtsmoos downloads the relay from /ai, places it in a fixed local home,
# asks the machine for Node, and starts the bridge Geelooy AI can drink from.
set -eu

RELAY_URL="https://awtsmoos.com/ai/relay/chatgpt-node-relay.cjs"
AWTSMOOS_HOME="${XDG_DATA_HOME:-$HOME/.local/share}/awtsmoos/chatgpt-relay"
RELAY_FILE="$AWTSMOOS_HOME/chatgpt-node-relay.cjs"
PORT="${AWTSMOOS_CHATGPT_RELAY_PORT:-38487}"

say() { printf '%s\n' "B\"H Awtsmoos relay :: $*"; }
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
  say "Downloading relay to $RELAY_FILE"
  fetch "$RELAY_URL" "$RELAY_FILE"
  chmod +x "$RELAY_FILE"
}

start_relay() {
  say "Starting relay on http://127.0.0.1:$PORT"
  AWTSMOOS_CHATGPT_RELAY_PORT="$PORT" nohup node "$RELAY_FILE" > "$AWTSMOOS_HOME/relay.log" 2>&1 &
  sleep 2
  if has curl; then curl -fsSL "http://127.0.0.1:$PORT/health" || true; fi
  say "Logs: $AWTSMOOS_HOME/relay.log"
}

install_node_if_missing
install_relay
start_relay
say "Done. In Geelooy AI settings use Relay URL http://127.0.0.1:$PORT and enable Node relay."
