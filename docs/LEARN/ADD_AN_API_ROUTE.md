B"H
Boruch Hashem
Blessed is He

# Add an API Route

## Before coding

Read the owning local `DOCUMENTATION.md`, family tutorial, derech file, neighboring handlers, auth helpers, persistence paths, and tests.

## Decide ownership

Prefer the existing family derech/route table when the behavior belongs to that subsystem. Do not create a new mount merely to avoid understanding the ancestor routing model.

## Implementation checklist

1. Define an explicit route/path shape.
2. Choose method behavior in the exact handler.
3. Parse only required query/body/path inputs.
4. Establish trusted identity before privileged actions.
5. Apply resource-level authorization separately.
6. Return explicit status/header/body semantics.
7. Add focused tests and representative caller integration if appropriate.
8. Update the human family tutorial when meaning/workflow changes.
9. Regenerate docs so the route tutorial appears automatically.

## Documentation gate

```sh
node scripts/docs/generate-docs.js
node scripts/docs/tutorial-engine-test.js
node scripts/docs/validate-docs.js
```

The generated tutorial must never invent payload fields that the implementation does not prove.
