# B"H — VM-Direct Deploy API

Deploy from the VM straight to Awtsmoos.com production over HTTPS.
**No Mac. No GitHub. No SSH.**

## How it works

```
VM (~/workspace/mw-repo)
  │  node scripts/vmDeploy.mjs <files>
  │  HTTPS POST (via egress proxy)
  ▼
https://awtsmoos.com/api/social/packed/deploy/push
  │  operatorKey auth (AWTSMOOS_DEPLOY_KEY)
  │  path validation (allowlist + traversal block)
  ▼
/mnt/HC_Volume_102267213/git/awtsmoos.com/<files>
  (server reads templates/static on next request — no restart needed
   for HTML/CSS/client-JS)
```

## One-time setup

### 1. Production: set the deploy key

SSH to production (via Mac, one last time) and create the systemd drop-in:

```bash
# On production as root:
mkdir -p /etc/systemd/system/awtsmoos.service.d
# Generate a strong key:
KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))")
echo "Storing key (save this to give to the VM): $KEY"
printf '[Service]\nEnvironment=AWTSMOOS_DEPLOY_KEY=%s\n' "$KEY" \
  > /etc/systemd/system/awtsmoos.service.d/30-deploy-key.conf
chmod 600 /etc/systemd/system/awtsmoos.service.d/30-deploy-key.conf
systemctl daemon-reload
systemctl restart awtsmoos.service
```

Verify: `curl https://awtsmoos.com/api/social/packed/deploy/status`
should return `{"success":true,"configured":true,...}`.

### 2. VM: store the deploy key

```bash
cd ~/workspace/mw-repo
node scripts/vmDeploy.mjs --set-key
# Paste the key when prompted. It is encrypted with the in-repo
# PasswordBox and stored at ~/.awtsmoos/secure/deploy/ (chmod 600),
# outside git. Never printed, never logged.
```

Or use the env var (CI): `export AWTSMOOS_DEPLOY_KEY=...`

### 3. Deploy the API itself (first time only)

The server-side route (`geelooy/api/social/helper/routes/packed/deployRoutes.js`)
must reach production once via the old path (Mac → GitHub → SSH → activate).
After that, all deploys go through this API.

## Usage

```bash
# Deploy specific files:
node scripts/vmDeploy.mjs --message "B\"H fix reader" \
  geelooy/heichelos/post/_awtsmoos.post.html \
  geelooy/heichelos/post/styles/meluket-sefer.css

# Deploy all git-modified files:
node scripts/vmDeploy.mjs --diff --message "B\"H batch fix"

# Check the API:
node scripts/vmDeploy.mjs --status

# Rotate the key:
node scripts/vmDeploy.mjs --forget-key
node scripts/vmDeploy.mjs --set-key   # then update production
```

## Security

- **Fail-closed auth**: unset `AWTSMOOS_DEPLOY_KEY` on the server = every push rejected.
- **Timing-safe** key comparison.
- **Path allowlist**: only web-code roots (`geelooy/heichelos/`, `geelooy/api/`,
  `scripts/`, etc.). `.git/`, `node_modules/`, `.env*`, secrets blocked.
- **Traversal blocked**: `..`, absolute paths, null bytes rejected.
- **Size limits**: 5 MB/file, 50 files/push.
- **Audit log**: every push appended to `<dbroot>/socialPacked/deploy-api.log`.
- **Key storage**: encrypted at rest on VM (PasswordBox, chmod 600, outside git).

## What needs a restart

- HTML templates, CSS, client JS, static assets: **live on next request**, no restart.
- Server-side Node.js (`geelooy/api/...` route logic): **requires**
  `systemctl restart awtsmoos.service` on production.
- The deploy API route itself: needs one restart after first deploy.

## Files

| File | Role |
|------|------|
| `geelooy/api/social/helper/routes/packed/deployRoutes.js` | Server endpoint |
| `geelooy/api/social/_awtsmoos.packed.js` | Route registration |
| `scripts/vmDeploy.mjs` | VM client |
| `scripts/lib/deployKeyStore.mjs` | Encrypted key storage |
