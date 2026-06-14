B"H

Phase two plan:
1. Add a new isolated test file under geelooy/apps/tunnel/agent/tools/fs/testing.
2. Include at least 25 named cases, each run via simulateNodeDomRuntime in fresh runtime.
3. Each case will assert values and sometimes console/error/interactionLog.
4. Run the test. If runtime failures indicate missing real support, distinguish actual regression from unsupported browser APIs. Fix core runtime only when a reasonable DOM behavior should work.
5. Rebuild manifest after adding the test.
