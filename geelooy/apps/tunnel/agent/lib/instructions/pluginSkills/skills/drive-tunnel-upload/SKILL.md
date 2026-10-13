---
name: drive-tunnel-upload
description: Upload files to Awtsmoos Drive using the tunnel's own Ed25519 service authentication. No user login needed — the VM's signing key is the credential. Use whenever you need to store a file on Awtsmoos Drive or get a public URL for an image, document, or any file.
---

<!-- B"H -->
<!-- Boruch Hashem -->
<!-- Blessed is He -->

# Drive Upload via Tunnel Service Auth

The tunnel's Ed25519 signing key authenticates as a service actor across the Awtsmoos API. No user session, no password, no OAuth — the key IS the login.

## Quick upload (one command)

```bash
node ~/workspace/mw-repo/scripts/driveServiceUpload.mjs \
  --alias <aliasId> \
  --path <drive/path/file.png> \
  --file <local-file.png> \
  --visibility public
```

**Example:**
```bash
node ~/workspace/mw-repo/scripts/driveServiceUpload.mjs \
  --alias awtsmoos-service-test \
  --path generated/my-image.webp \
  --file /tmp/my-image.webp \
  --visibility public
```

On success prints:
```
HTTP 201
PUBLIC URL: https://awtsmoos.com/api/social/drive/public/<alias>/<path>
```

## How it works

1. The script signs the request with `~/.awtsmoos/secure/deploy-signing-key` (Ed25519, chmod 600, never leaves the VM).
2. Production verifies via `geelooy/api/social/helper/serviceAuth.js` (public key baked in source).
3. The Drive API (`geelooy/api/social/helper/drive/authorization.js`) accepts the service actor with `drive.write` + `drive.public` scopes.
4. File streams via `PUT /api/social/drive/{alias}/stream/{path}`.
5. Public files resolve at `https://awtsmoos.com/api/social/drive/public/{ALIAS}/{path}`.

## Options

- `--alias`: Drive alias to upload under (required)
- `--path`: Destination path within the alias's Drive (required)
- `--file`: Local file to upload (required)
- `--visibility`: `public` or `private` (default: private)
- `--mime`: MIME type (auto-detected if omitted)
- `--key`: `deploy` or `import` (default: deploy) — which signing key to use

## Verify the upload

```bash
curl -s -o /dev/null -w "HTTP %{http_code}, %{size_download} bytes, %{content_type}\n" \
  "https://awtsmoos.com/api/social/drive/public/<alias>/<path>"
```

Expect `HTTP 200` with the correct content type and byte size.

## Security notes

- Private keys never leave `~/.awtsmoos/secure/` (chmod 600). Never commit, log, or transmit them.
- Service actor gets `drive.write` + `drive.public` only — far less than deploy power.
- Signatures are bound to the alias and operation (5-min window, replay guard). A signature for one alias cannot be reused for another.

## Troubleshooting

- `401 LOGIN_OR_CREDENTIAL_REQUIRED`: The serviceAuth module isn't deployed yet, or the key doesn't match. Check that `geelooy/api/social/helper/serviceAuth.js` is live on production.
- `403 CREDENTIAL_SCOPE_REQUIRED`: The operation needs a scope the service actor doesn't have. Service actors have `drive.write` and `drive.public` only.
