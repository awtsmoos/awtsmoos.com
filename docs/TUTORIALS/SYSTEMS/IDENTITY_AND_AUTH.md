B"H
Boruch Hashem
Blessed is He

# Tutorial: Identity and Authorization

Identity answers “who is making the request?” Authorization answers “may that trusted identity perform this operation here?”

## Trusted identity evidence

Sessions, verified API keys, OAuth bearer evidence, and specialized realtime admission all appear in the current system.

## Resource authority

Social Heichel/content routes can require owner/editor/member/moderation relationships after login. Tunnel scopes/grants similarly constrain trusted account actions.

## Client fields are not identity

Treat `owner`, `userId`, `alias`, or account-like body/query values as data unless server auth explicitly verifies/derives them.

## Review sequence

Transport/origin → identity → scope/role → resource ownership → method/action → persistence/provider side effect.

Read `docs/LEARN/AUTHENTICATION_101.md` and `docs/SECURITY/TRUST_BOUNDARIES.md`.
