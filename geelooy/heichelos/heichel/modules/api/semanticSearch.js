//B"H
import { AwtsmoosRequest, BASE_API_URL } from './base.js';
const api = path => `${BASE_API_URL}${path.replace(/^\/+/, '')}`;

export async function semanticSearch({ query = '', embedding = '', limit = 10, entityType = '' } = {}) {
  return await AwtsmoosRequest.fetch(api(`search/semantic?${new URLSearchParams({ query, embedding, limit, entityType })}`));
}
