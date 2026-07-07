// B"H

/**
 * B"H
 * Chapter 1940: The hour is split into safe sparks.
 * Every number here protects the tunnel from becoming one giant breath.
 */
const TICK_TIMEOUT_MS = 1200;
const MAX_TICK_TIMEOUT_MS = 1500;
const PROMPT_MAX_CHARS = 2000;
const HANDOFF_MAX_BYTES = 2500;
const LEASE_MS = 60 * 60 * 1000;
const STRESS_PROBE_INTERVAL_MS = 5000;
const MAX_SAME_FAILURE = 3;
const MAX_REPEATED_NEXT = 5;
const STATE_DIR = 'chatgpt-hour-loop';

module.exports = {
  TICK_TIMEOUT_MS,
  MAX_TICK_TIMEOUT_MS,
  PROMPT_MAX_CHARS,
  HANDOFF_MAX_BYTES,
  LEASE_MS,
  STRESS_PROBE_INTERVAL_MS,
  MAX_SAME_FAILURE,
  MAX_REPEATED_NEXT,
  STATE_DIR
};
