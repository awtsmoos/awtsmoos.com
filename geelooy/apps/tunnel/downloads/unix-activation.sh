#!/usr/bin/env bash
# B"H
# Boruch Hashem
# Blessed is He

# Activation proves staged life before any predecessor path is displaced. Fresh install
# alone grants explicit identity creation authority; update probes remain read-only.
activate_fresh() {
	local stamp="$(date -u +%Y%m%dT%H%M%SZ)"
	local displaced=""
	local failed="${ROOT}.failed-${CANDIDATE_VERSION}-${stamp}-$$"
	mkdir -p "$(dirname "$ROOT")"
	install_progress 69 "Proving staged runtime before first promotion"
	if ! prove_candidate_before_promotion fresh; then
		install_fail "candidate-probe" \
			"Fresh candidate could not prove registered command readiness." \
			"candidate=$CANDIDATE_ROOT"
	fi
	if [ -e "$ROOT" ]; then
		displaced="${ROOT}.incomplete-${stamp}-$$"
	fi
	install_progress 78 "Promoting proven fresh runtime"
	if ! promote_candidate_root "$displaced"; then
		install_fail "activate" \
			"Could not promote the proven fresh candidate." \
			"candidate=$CANDIDATE_ROOT root=$ROOT"
	fi
	start_promoted_candidate "$displaced" "$failed"
}

activate_update() {
	local stamp="$(date -u +%Y%m%dT%H%M%SZ)"
	local rollback="${ROOT}.activation-rollback-${stamp}-$$"
	local failed="${ROOT}.failed-${CANDIDATE_VERSION}-${stamp}-$$"
	install_progress 69 "Proving candidate while predecessor remains recoverable"
	write_activation_journal "predecessor_preserved" "$CANDIDATE_ROOT" "$ROOT"
	if ! prove_candidate_before_promotion readonly; then
		install_fail "candidate-probe" \
			"Candidate failed before predecessor displacement; predecessor was restored." \
			"candidate=$CANDIDATE_ROOT root=$ROOT"
	fi
	install_progress 78 "Promoting registered candidate atomically"
	if ! promote_candidate_root "$rollback"; then
		install_fail "activate" \
			"Candidate promotion failed; predecessor path was restored." \
			"candidate=$CANDIDATE_ROOT root=$ROOT rollback=$rollback"
	fi
	start_promoted_candidate "$rollback" "$failed"
}

activate_release_candidate() {
	install_rescue_runtime
	if skip_start_requested; then
		prepare_without_activation
		return 0
	fi
	if [ -f "$ROOT/main.js" ]; then
		activate_update
	else
		activate_fresh
	fi
}
