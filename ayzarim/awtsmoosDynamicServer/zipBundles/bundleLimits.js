// B"H
/**
 * B"H
 * The zip route is generous enough for the tunnel, but not a public waterfall.
 * Limits are intentionally plain constants so deployment can tune them later.
 */
const LIMITS = {
  maxZipBytes: 16 * 1024 * 1024,
  maxFiles: 1200,
  maxSourceBytes: 32 * 1024 * 1024,
  windowMs: 60 * 1000,
  maxRequestsPerWindow: 20,
  maxBytesPerWindow: 96 * 1024 * 1024
};

module.exports = { LIMITS };
