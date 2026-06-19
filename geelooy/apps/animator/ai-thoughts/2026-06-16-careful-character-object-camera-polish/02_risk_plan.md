B"H

# Risk Plan

Risks:
- Data fields may be ignored by renderer.
- Changing position scale could break grounding.
- PropBuilder graph coordinates may be screen-space while character coords are world-space.
- Camera events may override defaults.

Mitigations:
- Keep same schemas.
- Change only scene data, PropProcessor/PropBuilder if needed.
- Add smoke assertions on sane scales, camera zoom range, prop bounds, speech events.
