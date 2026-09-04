B"H
Boruch Hashem
Blessed is He

# Post-Inspection Mutation Manifest — Operator Parity Contract

> One gate receives the hand, the script, the JSON word, and AI light;
> Awtsmoos.com reveals whether every vessel changes one project right.

## Observed Foundation
The current Nesher Studio runtime already routes canonical commands through one validated transaction engine. Public API, AI facade, JSON operation facade, macro replay, and preset application all delegate to that same runtime. Atomic macro rollback is already proven by test 069.

## Exact First-Pass Write Set
Only one new source artifact is authorized in this pass:

- `geelooy/apps/nesher-studio/tests/070_creative_operator_parity_smoke.mjs`

No existing runtime file is authorized for mutation unless this new contract fails and the failure demonstrates a real product gap.

## Contract To Prove
The stable `project.rename` capability must:

1. be discoverable through the public command catalog and AI discovery with identical metadata;
2. explicitly advertise human, command, script, JSON, AI, macro, and preset surfaces;
3. execute through direct human-provenance runtime dispatch;
4. execute through public API dispatch;
5. execute through public JSON operation dispatch;
6. execute through AI command dispatch;
7. execute through AI JSON-operation dispatch;
8. produce the same deterministic canonical project projection for every operator;
9. create exactly one undo snapshot per invocation;
10. record the same command identity and parameters while preserving descriptive provenance.

## Volatile Data Rule
Cross-vessel equality will intentionally normalize generated IDs, timestamps, and transaction IDs. Those values should differ. Equality is defined over deterministic creative truth: project name, command identity, parameters, result meaning, undo delta, and the project snapshot returned by the safe public API.

## Failure Policy
If the test fails:

- identify the narrowest failing runtime contract;
- reread the exact target file in full;
- compare its current SHA-256 against the prewrite fingerprint;
- write a new mutation manifest naming that existing file;
- rewrite that entire file only, never patch a fragment;
- rerun parity plus test 069.

## Success Shadow Work
If parity passes without runtime mutation, the next work becomes a separate undo/redo + serialization round-trip contract, followed by browser/mobile proof. Passing this test does not authorize a whole-product completion claim.

## REMAINING_WORK
- Create test 070 atomically if the path is still absent.
- Run test 070.
- Resolve any demonstrated runtime gap.
- Add undo/redo + serialization evidence.
- Verify browser exposure and mobile intent behavior.
- Re-read created artifacts and write plan-vs-actual delta.

## NEXT_ACTION
Recheck `070_creative_operator_parity_smoke.mjs` does not exist, then create it as one complete file.
