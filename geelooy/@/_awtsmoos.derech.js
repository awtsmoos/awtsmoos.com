// B"H
/**
 * @module PublicAliasRoute
 * @description
 * Chapter 79: /@alias returns only the shell. CSS and JS are split into small
 * vessels; the browser hydrates everything from the profile API.
 */

function safeAlias(value) {
    return String(value || "").replace(/[<>"']/g, "");
}

function makeAliasShell({ aliasId }) {
    const safe = safeAlias(aliasId);
    return /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>@${safe}</title>
<link rel="stylesheet" href="/style/social/profile/index.css">
</head>
<body data-alias-id="${safe}">
<div id="public-profile-root" aria-live="polite"></div>
<script type="module" src="/scripts/awtsmoos/social/profile/index.js"></script>
</body>
</html>`;
}

module.exports = {
    dynamicRoutes: async $i => {
        await $i.use(":a", async vars => ({ mimeType: "text/html", response: makeAliasShell({ aliasId: vars.a }) }));
    }
};
