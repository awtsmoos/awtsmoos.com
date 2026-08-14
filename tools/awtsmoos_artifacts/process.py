# B"H
# Boruch Hashem
# Blessed is He

"""
Bounded shell-free process execution with whole-process-group termination.

The Awtsmoos renews command, child process, output stream, and final silence;
Awtsmoos.com permits external testimony without permitting an unbounded process shadow.
"""

import os
import signal
import subprocess
import tempfile
import time
from pathlib import Path

from .errors import ArtifactPolicyError
from .limits import DEFAULT_LIMITS, ExecutionLimits
from .models import CommandEvidence


class ProcessRunner:
	"""Run exact argument vectors with bounded files instead of memory pipes."""

	def __init__(self, limits=DEFAULT_LIMITS):
		"""Create a runner governed by immutable execution limits."""
		self.limits = limits

	def run(self, arguments, *, cwd=None, environment=None, input_bytes=None, timeout=None):
		"""Run one command without a shell and return measured termination evidence."""
		argv = self._validate_arguments(arguments)
		payload = input_bytes or b""
		if len(payload) > self.limits.max_input_bytes:
			raise ArtifactPolicyError(
				"PROCESS_INPUT_LIMIT",
				"External command input exceeds the configured byte limit.",
				{"byteLength": len(payload)},
			)
		working_directory = str(Path(cwd).resolve()) if cwd else None
		started = time.monotonic()
		with tempfile.TemporaryFile() as stdout_file, tempfile.TemporaryFile() as stderr_file:
			process = subprocess.Popen(
				argv,
				cwd=working_directory,
				env=environment,
				stdin=subprocess.PIPE if payload else subprocess.DEVNULL,
				stdout=stdout_file,
				stderr=stderr_file,
				start_new_session=True,
			)
			timed_out = False
			try:
				process.communicate(
					input=payload if payload else None,
					timeout=timeout or self.limits.timeout_seconds,
				)
			except subprocess.TimeoutExpired:
				timed_out = True
				self._kill_process_group(process)
				process.communicate()
			duration_ms = round((time.monotonic() - started) * 1000)
			stdout, stdout_truncated = self._bounded_text(stdout_file)
			stderr, stderr_truncated = self._bounded_text(stderr_file)
		return_code = process.returncode
		signal_number = -return_code if return_code is not None and return_code < 0 else None
		return CommandEvidence(
			arguments=argv,
			cwd=working_directory,
			duration_ms=duration_ms,
			return_code=return_code,
			signal_number=signal_number,
			timed_out=timed_out,
			stdout=stdout,
			stderr=stderr,
			stdout_truncated=stdout_truncated,
			stderr_truncated=stderr_truncated,
		)

	def _validate_arguments(self, arguments):
		argv = tuple(str(value) for value in arguments)
		if not argv or not argv[0]:
			raise ArtifactPolicyError("PROCESS_ARGUMENTS_REQUIRED", "A command is required.")
		if len(argv) > self.limits.max_arguments:
			raise ArtifactPolicyError("PROCESS_ARGUMENT_COUNT_LIMIT", "Too many command arguments.")
		if any(len(value) > self.limits.max_argument_chars for value in argv):
			raise ArtifactPolicyError("PROCESS_ARGUMENT_LENGTH_LIMIT", "A command argument is too long.")
		return argv

	def _bounded_text(self, stream):
		stream.flush()
		stream.seek(0)
		data = stream.read(self.limits.max_output_bytes + 1)
		truncated = len(data) > self.limits.max_output_bytes
		return data[:self.limits.max_output_bytes].decode("utf-8", "replace"), truncated

	@staticmethod
	def _kill_process_group(process):
		try:
			os.killpg(process.pid, signal.SIGKILL)
		except ProcessLookupError:
			return
		except OSError:
			process.kill()
