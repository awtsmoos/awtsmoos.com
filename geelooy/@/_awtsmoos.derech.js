// B"H

/**
 * B"H
 * Escapes text before it enters the small inline bootstrap script.
 *
 * @param {unknown} value
 * The finite spark being prepared for safe HTML/JavaScript travel.
 *
 * @returns {string}
 * A JSON string literal, sealed so the page can receive the alias without
 * raw template syntax spilling into the visible world.
 */
function quoteForScript(value) {
  return JSON.stringify(String(value || ""));
}

/**
 * B"H
 * Builds the public alias shell.
 *
 * @param {object} params
 * The profile sparks gathered by the dynamic route.
 *
 * @param {string} params.aliasId
 * The viewed alias id.
 *
 * @returns {string}
 * A complete HTML document whose client module hydrates the advanced alias UI.
 */
function makeAliasShell({ aliasId }) {
  return /* html */ `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@${aliasId}</title>
    <link rel="stylesheet" href="/style/social/alias.css">
  </head>
  <body>
    <main class="all awtsmoospage">
      <section class="main">
        <div class="alias-container" aria-live="polite"></div>
      </section>
    </main>
    <script type="module">
      // B"H
      import {
        getAliasOwnership,
        getAliasDetails
      } from "/scripts/awtsmoos/api/social/alias.js";
      import {
        makeAliasPage
      } from "/scripts/awtsmoos/social/aliasPage.js";

      const alias = ${quoteForScript(aliasId)};
      const container = document.querySelector(".alias-container");

      async function awakenAliasPage() {
        const [ownership, details] = await Promise.all([
          getAliasOwnership(alias),
          getAliasDetails(alias)
        ]);

        if (!details || details.error) {
          container.textContent = "B'H - @" + alias + " was not found.";
          return;
        }

        await makeAliasPage({
          details,
          ownership: ownership?.code === "YES",
          container
        });
      }

      awakenAliasPage().catch(error => {
        console.error("B'H - Alias profile rupture:", error);
        container.textContent = "B'H - Could not load @" + alias + ".";
      });
    </script>
  </body>
</html>`;
}

/**
 * Dynamic profile routes for /@.
 */
module.exports = {
  dynamicRoutes: async ($i) => {
    const loggedInUser = $i.request.user ? $i.request.user.info.userId : null;

    await $i.use(":a", async (vars) => {
      const aliasId = vars.a;
      const encodedAlias = encodeURIComponent(aliasId);

      const ownershipPath = `/api/social/alias/${encodedAlias}/ownership`;
      const detailsPath = `/api/social/alias/${encodedAlias}/details`;

      const belongsToMeResponse = loggedInUser
        ? await $i.fetchAwtsmoos(ownershipPath, { superSecret: "maybe" })
        : { code: "NO" };

      const belongsToMe = belongsToMeResponse && belongsToMeResponse.code !== "NO";
      const aliasDetails = await $i.fetchAwtsmoos(detailsPath, { superSecret: "maybe" });

      if (!aliasDetails || aliasDetails.error) {
        return {
          mimeType: "text/html",
          response: `B\"H<br>User @${aliasId} not found.`
        };
      }

      return {
        mimeType: "text/html",
        response: makeAliasShell({
          aliasId,
          loggedInUser,
          belongsToMe
        })
      };
    });
  }
};
