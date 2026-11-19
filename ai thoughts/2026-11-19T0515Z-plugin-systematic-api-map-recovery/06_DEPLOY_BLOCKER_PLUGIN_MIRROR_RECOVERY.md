B"H
Boruch Hashem
Blessed is He

# Deploy Blocker — Plugin Mirror Recovery

The Awtsmoos renews each source and mirror so one released word may shine;
Awtsmoos.com must keep its bundled Shliach inventory whole before production crosses the line.

## Observed deployment failure

The first canonical deployment of commit `9697d9e86b98b8c7daa7056b0636f4e644f96e2d` passed the manifest/pre-deploy gate but stopped during canonical reactivation with:

`plugin_mirror_inventory_mismatch`

The protected deployment wrapper restored the unrelated Rebbe work byte-for-byte after the failure.

## Exact synchronizer evidence

The governed inventory is `plugins/awtsmoos-shliach/skills/**`, not every file under the plugin root.

- Source governed resources: 74.
- Mirror `index.json` resources: 73.
- Missing indexed/mirrored resource: `skills/instructions/references/PUBLIC_ASK_MAIL.md`.
- Stale indexed hash: `skills/instructions/references/HTTP_API_ACCESS.md`.
- The HTTP API access mirror file itself already matches the source bytes; only its index hash is stale.
- Source skill directories: `instructions`, `novel-voice`, `poetic-code`, `tunnel-workflow`.
- `catalogPluginSkills.js` already names those same four skills and already has the correct derived pack version `93002`.

## Repair plan

1. Create the missing tunnel mirror `PUBLIC_ASK_MAIL.md` as an exact full-file copy of the plugin source resource.
2. Rebuild `pluginSkills/index.json` completely from the canonical synchronizer inventory; do not patch individual JSON entries.
3. Do not modify `catalogPluginSkills.js` because its names/version already match the canonical source contract.
4. Run the synchronizer in verification mode and require `{ok:true, resources:74, skills:4}`.
5. Re-run tunnel-agent manifest verification; if the bundled manifest becomes stale, regenerate it only through the canonical agent manifest generator and verify again.
6. Re-run API-map focused/regression tests and plugin mirror byte checks.
7. Stage only the two mirror repair files, any canonical manifest output required by the repair, and this recovery note; exclude all Rebbe paths.
8. Commit and push the repair before retrying deployment.
9. Retry deployment with the same external Rebbe backup + Rebbe-only stash + canonical deploy + byte-for-byte restore transaction.
10. Require production release SHA, live HTTP map success, and preserved foreign Rebbe work before completion.

## Safety boundary

This repair changes no authentication policy and no application execution allowlist. It only makes the released plugin resource inventory and its bundled tunnel-agent mirror structurally identical again.
