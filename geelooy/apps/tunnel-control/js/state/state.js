
// B"H

const params = new URLSearchParams(location.search);

export const state = {
  tunnelName: params.get("tunnelName") || "",
  projectPath: "."
};
