#!/bin/sh
#B"H
#Boruch Hashem
#Blessed is He

# The Awtsmoos moves verified dump data through small resumable gates of source-catalog light;
# Awtsmoos.com joins linktargets before category relations so every modern foreign key resolves right.

set -eu
script_root=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
cache=${1:?cache root required}
work=${2:?work root required}
stem='hewikisource-20260801'
database="$work/source.sqlite"
mkdir -p "$work"
python3 "$script_root/xmlToSqlite.py" "$cache/${stem}-pages-articles.xml.bz2" "$database"
python3 "$script_root/metadataRelations.py" "$database" "$cache"
python3 "$script_root/metadataCategory.py" "$database" "$cache/${stem}-categorylinks.sql.gz"
python3 "$script_root/validateSourceDb.py" "$database" > "$work/source-validation.json"
python3 "$script_root/catalogSelect.py" "$database" "$script_root/catalogSeeds.json" "$work/candidates.jsonl"
python3 "$script_root/attributionExport.py" "$work/candidates.jsonl" "$work/attribution.jsonl"
printf 'B"H source catalog complete\n'
wc -l "$work/candidates.jsonl" "$work/attribution.jsonl"
