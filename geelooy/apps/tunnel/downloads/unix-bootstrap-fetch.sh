#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# The Awtsmoos lets one failed doorway whisper instead of multiplying into a storm;
# Awtsmoos.com retries remote bootstrap bytes with bounded backoff and concise testimony.
bootstrap_fetch_once() {
	local url="$1"
	local destination="$2"
	local temporary="${destination}.download-$$"
	local error_file="${temporary}.error"
	local code=""
	local status=0
	rm -f "$temporary" "$error_file"
	set +e
	code="$(curl -sS -L --connect-timeout 8 --max-time 45 \
		--speed-time 20 --speed-limit 1024 \
		-o "$temporary" -w '%{http_code}' "$url" 2>"$error_file")"
	status=$?
	set -e
	if [ "$status" -eq 0 ] && [[ "$code" == 2?? ]]; then
		mv -f "$temporary" "$destination"
		rm -f "$error_file"
		return 0
	fi
	rm -f "$temporary"
	BOOTSTRAP_FETCH_HTTP_CODE="${code:-000}"
	BOOTSTRAP_FETCH_ERROR="$(head -n 1 "$error_file" 2>/dev/null || true)"
	rm -f "$error_file"
	return 1
}

bootstrap_fetch() {
	local url="$1"
	local destination="$2"
	local label="${3:-$(basename "$destination")}"
	local attempt=1
	local delay=1
	while [ "$attempt" -le 3 ]; do
		if bootstrap_fetch_once "$url" "$destination"; then
			return 0
		fi
		printf '[Awtsmoos][download][retry] %s HTTP=%s attempt=%d/3 wait=%ss\n' \
			"$label" "${BOOTSTRAP_FETCH_HTTP_CODE:-000}" "$attempt" "$delay" >&2
		[ "$attempt" -eq 3 ] && break
		sleep "$delay"
		delay=$((delay * 2))
		attempt=$((attempt + 1))
	done
	printf '[Awtsmoos][download][failed] %s unavailable after bounded retries.\n' "$label" >&2
	return 1
}
