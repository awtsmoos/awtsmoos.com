# B"H — Awtsmoos YouTube integration

## Public manager

The browser manager lives at `/youtube/`. A user connects Google with the server-side OAuth flow, selects a YouTube channel, uploads videos, and updates owned video metadata.

## Google Cloud configuration

Enable YouTube Data API v3 and create a Web application OAuth client. The required production redirect URI is:

```text
https://awtsmoos.com/api/youtube/oauth/callback
```

The manager requests permissions incrementally through these modes:

- `read`: identity and `youtube.readonly`
- `upload`: read plus `youtube.upload`
- `manage`: upload plus `youtube.force-ssl` for metadata and live-broadcast changes

## Secret installation

The OAuth JSON must never enter Git. From a repository worktree, run:

```bash
node scripts/youtube/deploySecrets.mjs /absolute/path/to/client_secret.json
```

The script uses the repository's custom SSH and SFTP implementation. It atomically installs the JSON at `/root/.awtsmoos-secrets/youtube/google-oauth.json`, creates independent session-signing and token-encryption keys, and applies mode `0700` to directories and `0600` to files.

## Token model

Refresh and access tokens are encrypted with AES-256-GCM. Each Google subject receives a separate encrypted record under `/root/.awtsmoos-secrets/youtube/users`. Browser cookies contain only signed opaque identity state; Google tokens never enter browser JavaScript.

## Upload model

Awtsmoos authenticates the user and creates a Google resumable-upload session. The browser then sends the selected video directly to that Google upload URL. This keeps large media files out of Awtsmoos process memory while preserving upload progress.

## API routes

- `GET /api/youtube/auth/start?mode=manage&returnTo=/youtube/`
- `GET /api/youtube/oauth/callback`
- `GET /api/youtube/auth/status`
- `POST /api/youtube/auth/logout`
- `GET /api/youtube/channel/mine`
- `POST /api/youtube/uploads/start`
- `GET /api/youtube/videos/list`
- `POST /api/youtube/videos/update`
- `GET /api/youtube/live/list`
- `POST /api/youtube/live/create`
- `POST /api/youtube/live/transition`
