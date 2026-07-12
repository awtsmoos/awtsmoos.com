#!/usr/bin/env bash
# B"H
# One supervisor and one agent own the installed tunnel name.

write_supervisor() {
	cp "$AWTSMOOS_INSTALL_RUNTIME/unix-supervisor.sh" "$SUPERVISOR"
	chmod +x "$SUPERVISOR"
}

is_alive() {
	[ -n "${1:-}" ] && kill -0 "$1" 2>/dev/null
}

process_table() {
	LC_ALL=C LANG=C ps axww -o pid= -o command= 2>/dev/null || true
}

find_agent_pids() {
	process_table | awk -v self="$$" -v needle="$ROOT/$ENTRY" '$1!=self&&index($0,"node " needle)>0{print $1}'
}

find_agent_pid() {
	find_agent_pids | head -1 || true
}

find_supervisor_pids() {
	process_table | awk -v self="$$" -v supervisor="$SUPERVISOR" '$1!=self&&index($0,supervisor)>0{print $1}'
}

find_supervisor_pid() {
	find_supervisor_pids | head -1 || true
}

wait_for_pids_to_exit() {
	label="$1"
	shift
	pids="$*"
	for _ in 1 2 3 4 5; do
		alive=""
		for pid in $pids; do
			is_alive "$pid" && alive="$alive $pid"
		done
		[ -z "$alive" ] && return 0
		sleep 0.1
	done
	for pid in $pids; do
		is_alive "$pid" && {
			echo "Force killing stale Awtsmoos $label PID: $pid"
			kill -9 "$pid" 2>/dev/null || true
		}
	done
}

stop_existing_runtime() {
	write_supervisor
	agent_pids="$(find_agent_pids | tr '\n' ' ')"
	supervisor_pids="$(find_supervisor_pids | tr '\n' ' ')"
	if [ -n "$supervisor_pids" ]; then
		touch "$STOP_FILE"
		for pid in $supervisor_pids; do kill "$pid" 2>/dev/null || true; done
		wait_for_pids_to_exit supervisor $supervisor_pids
	fi
	if [ -n "$agent_pids" ]; then
		for pid in $agent_pids; do kill "$pid" 2>/dev/null || true; done
		wait_for_pids_to_exit agent $agent_pids
	fi
	rm -f "$STOP_FILE" "$PID_FILE" "$SUP_PID_FILE"
}

start_supervisor() {
	write_supervisor
	rm -f "$STOP_FILE"
	supervisor_pid="$(find_supervisor_pid)"
	if is_alive "$supervisor_pid"; then
		echo "$supervisor_pid" > "$SUP_PID_FILE"
		return 0
	fi
	nohup "$SUPERVISOR" > "$ROOT/supervisor-stdout.log" 2>&1 &
	echo $! > "$SUP_PID_FILE"
}
