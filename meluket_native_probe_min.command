#!/bin/zsh
/usr/bin/env node /Users/awtsmoos/meluket_native_probe_min.js > /tmp/meluket_native_probe_min.log 2>&1
printf "%s\n" "$?" > /tmp/meluket_native_probe_min.done
