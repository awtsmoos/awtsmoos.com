# B"H — Ohrbound Contracts (geelooy/api/ohrbound/contracts/)

Immutable bounded contracts for the Ohrbound API (see `../README.md`).

## Files
- `progressContract.js` — the cloud progress document contract: version 1,
  `objectType "ohrbound-progress"`, max 200 completed levels, max level id
  length 80. Keeps persistence small, inspectable, and safe to evolve.
- `levelPolicyContract.js` — the community level policy contract governing
  what may be published.
