//B"H // Boruch Hashem // Blessed is He

/**
 * @file Parses one terminal async child result without making transport wrappers look successful.
 * @description The Awtsmoos preserves the child deed beneath its carrier. Awtsmoos.com unwraps the
 * known childAction/result shape, surfaces JSON parse failures explicitly, and gives observers one
 * reusable terminal error vocabulary across status, history, and batch result views.
 */
function terminalResult(task = {}) {
	if (nonterminal(task.status)) return null;
	const text = String(task.stdout || "").trim();
	if (!text) return failureResult(task);
	try {
		const parsed = JSON.parse(text);
		return parsed?.childAction && Object.hasOwn(parsed, "result") ? parsed.result : parsed;
	} catch {
		return failureResult(task, "async_task_output_not_json");
	}
}

function terminalError(task = {}, status = task.status) {
	if (task.error) return String(task.error);
	if (task.signal) return `async_task_signal:${task.signal}`;
	if (Number(task.exitCode ?? 0) !== 0) return `async_task_exit_${task.exitCode}`;
	if (status === "cancelled") return "async_task_cancelled";
	return `async_task_${status || "failed"}`;
}

function failureResult(task = {}, error = terminalError(task)) {
	return {
		ok: false,
		error,
		status: task.status,
		exitCode: task.exitCode,
		signal: task.signal,
		stderr: String(task.stderr || "").slice(-12000)
	};
}

function nonterminal(status) {
	return ["running", "running_unverified"].includes(String(status || ""));
}

module.exports = { failureResult, nonterminal, terminalError, terminalResult };
