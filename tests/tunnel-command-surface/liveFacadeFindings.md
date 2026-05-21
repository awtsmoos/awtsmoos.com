# B"H Live Facade Stress Findings

## Verified passing in repo-side tests
- Catalog has 400 unique actions.
- Command-tree aliases normalize into action batch payloads.
- `dispatchOsFs()` executes `commandTreeDryRun` through command-tree handlers.
- Plain newline/CSV/JSON path parsing works in `parsePlainList()`.

## Live facade mismatches still observed
- `commandTreeDryRun` returns `unknown_command_action` before repo dispatch.
- `actionBatch` returns ok/count 0 for valid JSON steps instead of executing or rejecting.
- `workflowValidate` accepts workflow JSON with no errors.
- `workflowRun` returns ok but empty `steps:{}` for the same valid workflow.
- `testMatrix` returns ok but empty `results` and empty `plan`.

## Next repair target
The external action dispatcher/facade must route advanced workflow and command-tree actions into the same implementation tested under `geelooy/API/tunnel/control/routes/osFs`.
