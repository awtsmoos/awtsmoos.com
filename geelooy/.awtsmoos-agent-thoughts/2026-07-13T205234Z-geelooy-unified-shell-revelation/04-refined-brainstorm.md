# B"H

Boruch Hashem

Blessed is He

## Refined Brainstorm

The Awtsmoos joins Oros and Keilim: route evidence is the light, while the shared shell and context ribbon are the vessel. Awtsmoos.com must never let the vessel invent the light.

## Refined architecture

- `appRoutes.js` remains the global route covenant.
- `appShell.js` remains the single shell constructor.
- A small context model accepts only explicit route evidence.
- A context ribbon renderer produces semantic HTML from that model.
- Each deep route owns one adapter mapping its existing URL state into the model.
- A shared blocked-state helper hides unsafe actions when evidence is missing.
- Existing editor and comment business logic remains in its current owner.
- CSS is split into shell context, editor layout, and route compatibility modules.

## Route outcomes

### Post editor

- Shared shell loads exactly once.
- Post or draft identifier is represented honestly.
- Publishing actions are blocked when target evidence is absent.

### Heichel editor

- Shared shell loads exactly once.
- Heichel identifier and ownership state remain explicit.
- Destructive controls require valid target context.

### Comment thread

- Shared shell loads exactly once.
- Parent type and parent identifier are required for composition.
- Missing parent renders recovery guidance instead of an active form.

### Create

- Duplicate global navigation is removed.
- Alias, destination, content type, and draft state become visible context.
- Existing submission contract remains unchanged.

## Verification graph

Source parse -> focused contracts -> direct HTTP -> bounded browser evidence -> scoped Git integrity -> readback -> remaining work.
