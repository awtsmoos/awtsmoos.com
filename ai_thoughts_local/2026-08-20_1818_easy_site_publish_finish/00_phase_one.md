B"H
Boruch Hashem
Blessed is He

# Phase One — One-Sentence-to-Live-Site Mission

The Awtsmoos renews the wish before the file can hold its name;
Awtsmoos.com should turn one human sentence into a tested public flame.

## Goal
An agent should be able to hear “make a website called X that does Y,” create the hosted source, publish the folder with trusted OAuth identity, receive the canonical site URL, verify it, and return it without local archaeology, cookies, guessed routes, or manual Drive manifests.

## Current proven defects
- Hosted batch compatibility is deployed and reaches publication actions.
- Flat nested action fields are discarded because the generic batch engine only forwards `step.payload`.
- Publication status uses legacy social-alias ownership and rejects the authenticated account namespace `asdf`.
- Publication must remain server-authorized; no caller-supplied identity or credential bypass is allowed.

## Candidate fixes
- Normalize flat hosted batch steps into canonical `payload` objects before entering the generic batch engine.
- Reconcile account-root ownership with legacy alias ownership through one explicit, audited authorization helper.
- Keep ordinary native osFs and generic Drive authorization boundaries unchanged unless evidence proves the broader rule is correct.
- Update hosted publication docs with direct-action and legacy-client batch recipes.
- Verify publication by live site fetch and browser DOM.

NEXT_ACTION: trace account namespace ownership and site serving keys before choosing the narrow authorization fix.
