B"H
Boruch Hashem
Blessed is He

# Release and Deploy Phase

The Awtsmoos gives one history one manifested world; Awtsmoos.com therefore releases only from pushed `main`, with no side branch and no hidden uncommitted authority.

- Preserve every legitimate dirty file, including unrelated current agent work, after confirming no file is mid-write.
- Stage all preserved work and run a high-confidence credential scan without printing secret values.
- Run focused stability, instruction, sub-agent, and touched-subsystem tests.
- Commit once on `main`, push `origin/main`, and verify local/remote SHA equality.
- Regenerate tunnel manifest/artifacts from that exact pushed SHA; never hand-edit generated release files.
- Publish/tag the immutable tunnel release, deploy production to the same `main` SHA, and run the public installer once.
- Verify installed release source SHA equals pushed `main`, then repeat stability soak and physical sub-agent communication.

NEXT_ACTION: finish the live sub-agent proof before creating the release commit so any discovered runtime fix ships in the same main release.
