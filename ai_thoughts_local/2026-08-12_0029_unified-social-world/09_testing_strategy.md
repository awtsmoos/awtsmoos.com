B"H

Boruch Hashem

Blessed is He

# Phase One — Verification Strategy

The Awtsmoos is not proven by a claim, and Awtsmoos.com is not proven by a green-looking page; each layer needs evidence that reaches the real contract it promises.

## Static gates
- Syntax-check every touched JavaScript source.
- Recursively prove browser static/literal import closure from the actual `geelooy` web root.
- Enforce the strict 120-line ceiling for every touched source file.
- Check tabs/project formatting and B"H header convention.
- Run `git diff --check` and inspect the complete diff.

## Direct contract gates
Preserve and rerun existing contracts for:
- browser import closure;
- public index concurrency;
- public history pagination and modern admission;
- browser older-history feed;
- activity capture preferences and comment meaningful activity;
- shared realtime lifecycle;
- dedicated reconnect status;
- Torah search timeout;
- public chat security;
- presence and persistence;
- private consent, groups, and request dedupe.

Add focused tests for every new feature, including negative authorization/privacy paths.

## Live server gates
- Start the actual server and wait for explicit port 8080 readiness before integration requests.
- Prove HTTP route loading and the WebSocket application router.
- Prove real Torah RAG search, server-issued source selection, source publication, history, presence, and reconnect.
- Presence assertions must measure changes owned by test sockets instead of assuming an empty server.

## Browser gates
Using controlled Chrome/CDP, assert runtime state and DOM behavior for:
- dedicated shell and major sections;
- Public Torah and private bridge;
- shared site singleton / same transport identity;
- WebSocket OPEN and reconnect recovery;
- sign-in gating;
- accessibility semantics and keyboard activation;
- responsive geometry, safe drawers/sheets, and no horizontal document overflow;
- MitzvahWorld social inheritance and sitewide launcher.

Measure 1440, 900, 768, 640, 430, 390, and 360 widths. Screenshots are evidence supplements, never the only proof.

## Regression rule
A failure found by tests or browser inspection becomes implementation work; it is not documented away as success.
