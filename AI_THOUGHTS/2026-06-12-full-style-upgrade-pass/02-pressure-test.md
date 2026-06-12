B"H

# Pressure Test

Potential failure modes:
1. Over-styling creates visual noise.
2. Broad selectors leak across domains.
3. Reduced motion gets broken by new transitions.
4. Compatibility wrappers accidentally gain declarations.
5. Reader sidebar selectors conflict with imported ownership tests.
6. Mobile gets worse if desktop spacing is blindly scaled down.

Countermeasures:
- Prefer custom properties and scoped domain selectors.
- Rewrite only CSS files and no JS behavior.
- Run existing contracts after writing.
- Leave runtime behavior untouched unless tests demand it.
