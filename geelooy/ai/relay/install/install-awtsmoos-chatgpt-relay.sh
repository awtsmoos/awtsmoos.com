#!/usr/bin/env sh
# B"H
# Chapter 381: The Unix Installer Kept The Relay Alive.
# Downloads every split-browser module the public relay may need, supports
# Termux/pkg as well as desktop package managers, starts the server in the
# background, waits for /health, and prints the no-debug-Chrome /control login.
set -eu

BASE_URL="https://awtsmoos.com/ai/relay/split-browser"
AWTSMOOS_HOME="${XDG_DATA_HOME:-$HOME/.local/share}/awtsmoos/chatgpt-relay/split-browser"
PORT="${AWTSMOOS_SPLIT_BROWSER_PORT:-38488}"
PID_FILE="$AWTSMOOS_HOME/relay.pid"
LOG_FILE="$AWTSMOOS_HOME/relay.log"
RELAY_FILES="authState.cjs autoLogin.cjs automation.cjs bodyPolicy.cjs bodyTransform.cjs browserBridge.cjs browserRewrite.cjs browserShim.cjs cdpChrome.cjs clientDiagnostics.cjs clientState.cjs config.cjs controlPage.cjs cookieJar.cjs debugApi.cjs debugClient.cjs headerMap.cjs http.cjs index.js jsPreamble.cjs logger.cjs originPolicy.cjs proxy.cjs relayApi.cjs rewriteHtml.cjs rewriteText.cjs routeNormalize.cjs server.cjs urlMap.cjs"

say() { printf '%s\n' "B\"H Awtsmoos split relay :: $*"; }
has() { command -v "$1" >/dev/null 2>&1; }
fetch_file() {
  if has curl; then curl -fsSL "$1" -o "$2"; return; fi
  if has wget; then wget -q "$1" -O "$2"; return; fi
  say "curl or wget is required to download the relay."
  exit 1
}
health_ok() {
  if has curl; then curl -fsSL "http://127.0.0.1:$PORT/health" >/dev/null 2>&1; return $?; fi
  node -e "fetch('http://127.0.0.1:$PORT/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))" >/dev/null 2>&1
}
install_node_if_missing() {
  if has node; then say "Node already exists: $(node --version)"; return; fi
  say "Node was not found. Trying common package managers."
  if has pkg; then pkg install -y nodejs
  elif has brew; then brew install node
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
    fetch_file "$BASE_URL/$file" "$AWTSMOOS_HOME/$file"
  done
  test -f "$AWTSMOOS_HOME/index.js" || { say "Relay entry was not downloaded."; exit 1; }
  chmod +x "$AWTSMOOS_HOME/index.js"
}
stop_stale_process() {
  if health_ok; then say "Relay already answers on http://127.0.0.1:$PORT/control"; return 0; fi
  if test -f "$PID_FILE"; then
    old_pid="$(cat "$PID_FILE" 2>/dev/null || true)"
    if test -n "$old_pid" && kill -0 "$old_pid" 2>/dev/null; then
      say "Stopping stale relay pid $old_pid"
      kill "$old_pid" 2>/dev/null || true
      sleep 1
    fi
  fi
  return 1
}
start_relay() {
  if stop_stale_process; then return; fi
  say "Starting split relay on http://127.0.0.1:$PORT/control"
  : > "$LOG_FILE"
  (cd "$AWTSMOOS_HOME" && AWTSMOOS_SPLIT_BROWSER_PORT="$PORT" nohup node index.js >> "$LOG_FILE" 2>&1 & echo $! > "$PID_FILE")
  i=0
  while test "$i" -lt 25; do
    if health_ok; then
      say "Relay is alive: http://127.0.0.1:$PORT/control"
      say "Open ChatGPT through Node there. This login does not require debug Chrome."
      say "Logs: $LOG_FILE"
      return
    fi
    i=$((i + 1))
    sleep 1
  done
  say "Relay did not answer health after start. Last log lines:"
  tail -40 "$LOG_FILE" 2>/dev/null || true
  exit 1
}

install_node_if_missing
install_relay
start_relay
say "Done. Open http://127.0.0.1:$PORT/control"
