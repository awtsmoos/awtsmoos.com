B"H

Boruch Hashem

Blessed is He

# Phase One — Security and Privacy Invariants

The Awtsmoos gives life without exposing what must remain concealed; Awtsmoos.com must let social light travel only through vessels whose consent and authority are real.

## Identity and authorization
- A socket connection is never sufficient proof of public identity.
- Account identity must be verified by the existing server boundary.
- Active alias ownership must be verified before alias-scoped action.
- Target aliases must be resolved server-side before private or relationship actions.
- Group membership and roles must be enforced by server authorization, never browser state alone.

## Public Torah
- Public discussion may publish only server-issued, server-validated source selections.
- Private search prompts and arbitrary client prose do not become public messages.
- Source sessions, selection identifiers, and admission rules remain bounded and validated.

## Private communication
- Unrestricted private text requires an accepted direct relationship or valid private-group membership under current policy.
- Whisper/chat/friend/group/mail requests never bypass consent by implicitly opening unrestricted messaging.
- Blocking and request policies are authoritative and server-enforced.
- Duplicate pending requests and request spam must be bounded.

## Presence
- Hidden visitors never appear as identifiable aliases.
- Anonymous visitors may contribute only to safe aggregate counts unless they explicitly authenticate and reveal an allowed alias.
- Presence context must not leak account identifiers, socket identifiers, IP-derived data, or private navigation context.

## Activity and personalization
- Capture meaningful semantic outcomes rather than raw requests, frames, cursor movement, or every navigation.
- Do not duplicate private message/comment bodies into activity.
- Anonymous personalization should be session-local or short-lived and non-fingerprinting.
- Anonymous history is not silently merged into permanent account history on sign-in.
- Reset/disable controls must erase or stop the relevant personalization state where implemented.

## RAG and recommendations
- Bound and sanitize reading context before RAG.
- Private input stays private; recommendation endpoints cannot be used as public-text publication channels.
- Expensive requests require dedupe, cache, rate limits, and safe timeout behavior.
- Structured cards must carry only information the requester is authorized to receive.

## Verification requirement
Every new feature receives at least one negative authorization/privacy test in addition to its success-path test.
