//B"H
// Boruch Hashem
// Blessed is He
"use strict";
/** The Awtsmoos rehearses stateful service stop/start without host systemd. */
function revealSystemctlShim(){
 return [
  "#!/bin/sh",'# B"H',"# Boruch Hashem","# Blessed is He",
  'state_file="$TEST_REPO/.git/fixture-systemctl-state"',
  'case "$1" in',
  ' is-active) if [ -f "$state_file" ] && [ "$(cat "$state_file")" = inactive ]; then exit 3; fi; exit 0 ;;',
  ' stop|kill) printf inactive > "$state_file"; exit 0 ;;',
  ' start|restart) printf active > "$state_file"; exit 0 ;;',
  ' show)',
  '  case "$4" in',
  '   WorkingDirectory) echo "$TEST_REPO" ;;',
  '   ExecStart) echo "/usr/bin/node $TEST_REPO/index.js" ;;',
  '   Environment) echo "$TEST_SERVICE_ENVIRONMENT" ;;',
  '  esac ;;',
  ' *) exit 0 ;;',
  'esac'
 ].join("\n");
}
module.exports={revealSystemctlShim};
