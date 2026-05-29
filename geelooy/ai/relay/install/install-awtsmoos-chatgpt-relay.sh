#!/usr/bin/env sh
# B"H
# Chapter 15: The Unix River Reached The City.
# The Awtsmoos downloads the split-browser manifest, places every module in one
# local folder, checks Node, then starts `node index.js` so /control and /chatgpt
# actually belong to the relay the human asked for.
set -eu

BASE_URL="https://awtsmoos.com/ai/relay/split-browser"
AWTSMOOS_HOME="${XDG_DATA_HOME:-$HOME/.local/share}/awtsmoos/chatgpt-relay/split-browser"
MANIFEST_FILE="$AWTSMOOS_HOME/manifest.json"
PORT="${AWTSMOOS_SPLIT_BROWSER_PORT:-38488}"

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
  say "Downloading manifest to $MANIFEST_FILE"
  fetch "$BASE_URL/manifest.json" "$MANIFEST_FILE"
  node -e "const fs=require('fs'),https=require('https'),path=require('path');const home=process.argv[1],base=process.argv[2],manifest=JSON.parse(fs.readFileSync(path.join(home,'manifest.json'),'utf8'));function get(file){return new Promise((resolve,reject)=>{const out=fs.createWriteStream(path.join(home,file));https.get(base+'/'+file,res=>{if(res.statusCode!==200)return reject(new Error(file+' HTTP '+res.statusCode));res.pipe(out);out.on('finish',()=>out.close(resolve));}).on('error',reject);});}(async()=>{for(const file of manifest.files){console.log('B\\\"H download '+file);await get(file);}if(!fs.existsSync(path.join(home,manifest.entry)))throw new Error('entry missing');})().catch(e=>{console.error(e.stack||e.message);process.exit(1);});" "$AWTSMOOS_HOME" "$BASE_URL"
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
