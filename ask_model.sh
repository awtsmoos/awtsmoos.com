#!/bin/bash
# B"H
# Boruch Hashem
# Blessed is He
#
# The Awtsmoos turns hidden weights to language, from silence into light;
# this vessel asks one honest question and preserves the answer right.

set -u

ROOT="$HOME/.local/share/smollm3-chat"
CLI="$ROOT/llama.cpp/build/bin/llama-cli"
MODEL="$ROOT/model/SmolLM3-Q4_K_M.gguf"
ANSWER="$ROOT/model-answer.txt"
RUN_LOG="$ROOT/model-run.log"
STATUS="$ROOT/ask.status"
QUESTION="Explain in three concise sentences how semantic search can provide useful context to a local chatbot."

rm -f "$STATUS" "$ANSWER" "$RUN_LOG"

if [ ! -x "$CLI" ] || [ ! -f "$MODEL" ]; then
	echo 10 > "$STATUS"
	exit 10
fi

STARTED=$(date +%s)
"$CLI" \
	-m "$MODEL" \
	-sys "You are a concise and helpful local chatbot." \
	-p "$QUESTION" \
	-c 2048 \
	-t 4 \
	-n 160 \
	--temp 0.3 \
	--top-p 0.9 \
	--jinja \
	-cnv \
	-st \
	--simple-io \
	--no-display-prompt \
	> "$ANSWER" 2> "$RUN_LOG"
EXIT_CODE=$?
FINISHED=$(date +%s)

echo "question=$QUESTION" > "$ROOT/question-and-timing.txt"
echo "elapsed_seconds=$((FINISHED - STARTED))" >> "$ROOT/question-and-timing.txt"
echo "exit_code=$EXIT_CODE" >> "$ROOT/question-and-timing.txt"
echo "$EXIT_CODE" > "$STATUS"
exit "$EXIT_CODE"
