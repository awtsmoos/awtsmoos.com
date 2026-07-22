#!/bin/zsh
NODE="/Users/awtsmoos/.nvm/versions/node/v24.17.0/bin/node"
"$NODE" /Users/awtsmoos/awtsmoos.com/meluket_legacy_open_probe.js > /tmp/meluket_legacy_open_probe.log 2>&1
printf "%s\n" "$?" > /tmp/meluket_legacy_open_probe.done
