//B"H
/**
 * Dynamic profile routes for /@.
 * The Awtsmoos route matcher gives `:a` as the viewed alias id; this file
 * gathers the social API state and then renders the alias vessel.
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

      const page = await $i.fetchAwtsmoos("/@/_awtsmoos.alias.html", {
        yeser: {
          alias: aliasDetails,
          loggedInUser,
          belongsToMe
        },
        superSecret: "yes"
      });

      return {
        response: page
      };
    });
  }
};
