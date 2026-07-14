// B"H
/** Shared notification preview: a small bell that never replaces the full route. */
export async function loadNotificationPreview(aliasId,{limit=5}={}){
  if(!aliasId) return {items:[],total:0,hasMore:false};
  const q=new URLSearchParams({limit:String(limit),offset:'0',includeRead:'true'});
  const res=await fetch(`/api/social/notifications/${encodeURIComponent(aliasId)}?${q}`);
  const data=await res.json().catch(()=>({}));
  if(!res.ok||data.error) throw new Error(data.error?.message||data.message||res.statusText||'Notifications failed.');
  return data.success||data;
}
export function notificationPreviewCard(n){
  const article=document.createElement('article');
  article.className=`inline-notification-card ${n.read?'read':'unread'}`;
  const title=escapeText(n.title||n.type||'Notification');
  const body=escapeText(n.body||n.message||'A quiet graph pulse was recorded.');
  const type=escapeText(n.type||'signal');
  article.innerHTML=`<strong>${title}</strong><p>${body}</p><small>${type}</small>${n.actionUrl?`<p><a href="${escapeAttr(n.actionUrl)}">Open full signal</a></p>`:''}`;
  return article;
}
export function escapeText(value){return String(value??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
function escapeAttr(value){return escapeText(value).replace(/'/g,'&#39;');}
