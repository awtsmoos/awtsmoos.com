B"H
# YouTube Live Setup

Set these server env vars:

- `YOUTUBE_GOOGLE_CLIENT_ID`
- `YOUTUBE_GOOGLE_CLIENT_SECRET`
- `YOUTUBE_OAUTH_REDIRECT_URI=https://awtsmoos.com/api/youtube/auth/callback`
- optional `YOUTUBE_GOOGLE_REFRESH_TOKEN`

Google Cloud requirements:

1. Enable YouTube Data API v3.
2. Configure OAuth consent screen.
3. Add the redirect URI above.
4. Visit `/api/youtube/auth/start`, open the returned URL, approve, and the callback stores the token in memory.
5. For persistent production use, set `YOUTUBE_GOOGLE_REFRESH_TOKEN` from the first callback result or replace memory store with encrypted account storage.

Live flow:

- POST `/api/youtube/live/create` creates liveStream + liveBroadcast + bind.
- It returns `cdn.ingestionInfo` for YouTube ingest.
- Browser/local tunnel sends HLS playlist and segments directly to that ingest URL.
- POST `/api/youtube/live/transition` changes broadcast status.

Video bytes do not pass through awtsmoos.com.
