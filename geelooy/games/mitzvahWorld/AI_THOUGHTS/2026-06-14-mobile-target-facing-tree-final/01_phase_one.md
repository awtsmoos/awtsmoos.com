B'H
# Phase One: Stop Pretending, Hit The Original Bugs
The screenshots prove three original bugs remain: mobile tap highlights fox but does not set it as target; attack requires facing instead of selecting/locking nearest valid target; many old blob-stick trees remain because region director/runtime still emits old tree styles in addition to the upgraded renderer; model visual facing is still not aligned with actual displacement. Need inspect touch selection, attack flow, movement physics vector, and tree emitters. Whole-file rewrites only.
