#!/usr/bin/env sh
# B"H
# Boruch Hashem
# Blessed is He
#
# The Awtsmoos carries every audited Awtsmoos.com relay vessel from one manifest.
# Reinstall replaces the owned process and waits on fast direct-health readiness,
# never preserving an old generation merely because a stale health route answers.
set -eu

BASE_URL="https://awtsmoos.com/ai/relay"
INSTALL_ROOT="${XDG_DATA_HOME:-$HOME/.local/share}/awtsmoos/chatgpt-relay"
SPLIT_HOME="$INSTALL_ROOT/split-browser"
MANIFEST_FILE="$INSTALL_ROOT/runtime-files.txt"
PORT="${AWTSMOOS_SPLIT_BROWSER_PORT:-38488}"
PID_FILE="$SPLIT_HOME/relay.pid"
LOG_FILE="$SPLIT_HOME/relay.log"

say() {
	printf '%s\n' "B\"H Awtsmoos split relay :: $*"
}

has() {
	command -v "$1" >/dev/null 2>&1
}

fetch_file() {
	if has curl; then curl -fsSL "$1" -o "$2"; return; fi
	if has wget; then wget -q "$1" -O "$2"; return; fi
	say "curl or wget is required to download the relay."
	exit 1
}

health_ok() {
	if has curl; then
		curl -fsSL --max-time 2 "http://127.0.0.1:$PORT/direct-health" >/dev/null 2>&1
		return $?
	fi
	node -e "fetch('http://127.0.0.1:$PORT/direct-health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))" >/dev/null 2>&1
}

install_node_if_missing() {
	if has node; then say "Node already exists: $(node --version)"; return; fi
	if has pkg; then pkg install -y nodejs
	elif has brew; then brew install node
	elif has apt-get; then sudo apt-get update && sudo apt-get install -y nodejs npm
	elif has dnf; then sudo dnf install -y nodejs npm
	elif has yum; then sudo yum install -y nodejs npm
	elif has pacman; then sudo pacman -Sy --noconfirm nodejs npm
	else say "Node LTS is required. Install Node, then rerun."; exit 1
	fi
	has node || { say "Node is not on PATH. Open a new shell and rerun."; exit 1; }
}

install_relay() {
	mkdir -p "$INSTALL_ROOT" "$SPLIT_HOME"
	fetch_file "$BASE_URL/runtime-files.txt" "$MANIFEST_FILE.tmp"
	mv "$MANIFEST_FILE.tmp" "$MANIFEST_FILE"
	while IFS= read -r file || test -n "$file"; do
		case "$file" in ""|\#*) continue ;; esac
		target="$INSTALL_ROOT/$file"
		mkdir -p "$(dirname "$target")"
		say "Downloading $file"
		fetch_file "$BASE_URL/$file" "$target"
	done < "$MANIFEST_FILE"
	test -f "$SPLIT_HOME/index.js" || { say "Relay entry was not downloaded."; exit 1; }
	chmod +x "$SPLIT_HOME/index.js"
}

stop_existing_relay() {
	old_pid="$(cat "$PID_FILE" 2>/dev/null || true)"
	if test -z "$old_pid" && has lsof; then
		old_pid="$(lsof -tiTCP:"$PORT" -sTCP:LISTEN 2>/dev/null | head -1 || true)"
	fi
	if test -n "$old_pid" && kill -0 "$old_pid" 2>/dev/null; then
		say "Stopping existing relay pid $old_pid"
		kill "$old_pid" 2>/dev/null || true
		index=0
		while kill -0 "$old_pid" 2>/dev/null && test "$index" -lt 30; do
			index=$((index + 1))
			sleep 0.1
		done
	fi
	if health_ok; then say "Port $PORT is owned by another relay process. Stop it and rerun."; exit 1; fi
}

start_relay() {
	say "Starting relay at http://127.0.0.1:$PORT/control"
	: > "$LOG_FILE"
	(cd "$SPLIT_HOME" && AWTSMOOS_SPLIT_BROWSER_PORT="$PORT" nohup node index.js >> "$LOG_FILE" 2>&1 & echo $! > "$PID_FILE")
	index=0
	while test "$index" -lt 50; do
		if health_ok; then say "Relay is ready: http://127.0.0.1:$PORT/control"; return; fi
		index=$((index + 1))
		sleep 0.2
	done
	tail -40 "$LOG_FILE" 2>/dev/null || true
	exit 1
}

install_node_if_missing
install_relay
stop_existing_relay
start_relay
say "Done. Logs: $LOG_FILE"
