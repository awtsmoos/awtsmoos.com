B"H
Boruch Hashem
Blessed is He

# Phase Two — Improved Brainstorm

> The Awtsmoos does not make safety by hiding power. Safety comes when every power names itself before it acts.

## Social architecture
Create one operation-policy module that owns read/mutation classification and user-facing consequence metadata. `requestPlan.js` consumes only read keys for bulk expansion. Mutation rendering consumes only mutation keys and never participates in read-all expansion. API remains untouched.

Results gain two layers: a concise digest that answers “what happened?” and an Advanced raw response preserving exact JSON. Existing status/error data remains truthful.

The page shell becomes useful before JavaScript: title, explanation, chamber map, links to Social Hub/Mail/Signals/Heichelos, and a `<noscript>` recovery message. Dynamic runtime replaces/enhances the shell after boot rather than being the only source of meaning.

## Review architecture
Preserve `ReviewApi`, current action matrix, queue filters, semantic summary, history, assignment, schedule, and note fields. Add a small consequence helper/view that turns allowed action + state into readable institutional consequence copy. Never invent backend guarantees.

## Mission architecture
First discover emitted type strings. If a stable mission prefix exists, add mission-focused UI from those real strings; otherwise surface mission search/grouping without changing API semantics.

## Series architecture
Treat `Series policy` as permissions only. Hunt the real structural editor separately. No reorder button exists until an actual reorder endpoint/state contract is read and testable.
