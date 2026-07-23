#!/bin/zsh
SOURCE="/Users/awtsmoos/Documents/awtsmoos-jobs/meluket-translation-job/generated/meluket-swarm/chunks/_D7_AA_D7_A9_D7_A8_D7_99_meluket__BH_POST_1766518913707_theRebbe_562__p001/source.json"
DEST="/Users/awtsmoos/awtsmoos.com/meluket_source_sample.json"
/bin/cp "$SOURCE" "$DEST"
/usr/bin/shasum -a 256 "$SOURCE" "$DEST" > /Users/awtsmoos/awtsmoos.com/meluket_source_sample_hashes.txt
printf "%s\n" "$?" > /Users/awtsmoos/awtsmoos.com/meluket_source_sample.done
