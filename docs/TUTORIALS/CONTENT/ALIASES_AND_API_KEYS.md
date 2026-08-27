B"H
Boruch Hashem
Blessed is He

# Aliases and API Keys

## Alias role

Aliases are Social-facing identities owned through user/account state and reused across Heichel/content/profile/follow/drive/mail behavior.

## API keys

Social keys can be created, listed, revoked, and verified. Raw key material is shown at creation; SHA-256 hash and metadata persist rather than plaintext secret storage.

## Inputs

Supported key evidence includes named input/header/Bearer forms. Inspect `helper/apiKeys.js` for current precedence and validation.

## Security rule

An alias name in a body/path is not proof the authenticated principal owns that alias. Ownership checks remain required for privileged actions.
