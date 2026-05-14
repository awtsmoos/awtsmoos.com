
// B"H

async function readBodyIfNeeded({ request, getPostData, getPutData, getDeleteData }) {
  const method = String(request.method || "GET").toUpperCase();

  if (method === "POST") await getPostData();
  if (method === "PUT") await getPutData();
  if (method === "DELETE") await getDeleteData();
}

module.exports = { readBodyIfNeeded };
