#!/bin/zsh
REPO="/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com"
OUT="/tmp/meluket_git_archaeology.txt"
{
	echo "B\"H"
	echo "REPO=$REPO"
	cd "$REPO" || exit 1
	echo "===== STATUS ====="
	git rev-parse --show-toplevel
	echo "===== LIFECYCLE HISTORY ====="
	git log --all --date=iso --format="%H|%ad|%s" -- ayzarim/dosdb/awtsmoosBinary/awtsmoosDB/core/db/lifecycle.js | head -100
	echo "===== DATABASE HISTORY ====="
	git log --all --date=iso --format="%H|%ad|%s" -- ayzarim/dosdb/awtsmoosBinary/awtsmoosDB/database.js | head -100
	echo "===== PICKAXE OLD ROOT ====="
	git log --all --date=iso --format="%H|%ad|%s" -S"readBigUInt64BE(8)" -- ayzarim/dosdb/awtsmoosBinary/awtsmoosDB | head -100
	echo "===== PICKAXE AWTSOCIAL ====="
	git log --all --date=iso --format="%H|%ad|%s" -S"social.core.awtsocial" -- . | head -100
	echo "===== GREP HISTORICAL IMPORTS ====="
	for COMMIT in $(git log --all --format=%H -- ayzarim/dosdb/awtsmoosBinary/awtsmoosDB/core/db/lifecycle.js | head -30); do
		echo "--- $COMMIT ---"
		git grep -n -E "core/db/lifecycle|readBigUInt64BE\(8\)|social\.core\.awtsocial" "$COMMIT" -- ayzarim geelooy scripts 2>/dev/null | head -300
	done
} > "$OUT" 2>&1
printf "%s\n" "$?" > /tmp/meluket_git_archaeology.done
