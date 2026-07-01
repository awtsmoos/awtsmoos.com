// B"H
export default /*css*/`
@media(max-width:720px),(pointer:coarse) and (max-width:900px){
  .file-explorer{height:100%!important;min-height:0!important;overflow:hidden!important;background:linear-gradient(180deg,rgba(4,13,25,.98),rgba(8,35,62,.96))!important}
  .file-explorer>.drive-shelf{display:none!important}
  .file-explorer-header{flex:0 0 auto!important;position:sticky!important;top:0!important;z-index:9!important;margin:4px!important;padding:5px!important;border-radius:15px!important;gap:5px!important;max-height:104px!important;overflow:hidden!important}
  .button-bar{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:5px!important;align-items:stretch!important;max-height:84px!important;overflow:hidden!important}
  .toolbar-group{display:contents!important}.toolbar-group:not(.toolbar-nav){display:none!important}.toolbar-spacer,.toolbar-status,.path-bar-container{display:none!important}
  .toolbar-action,.sidebar-toggle-btn,.nav-btn,.edit-path-btn{min-width:0!important;min-height:34px!important;padding:3px 2px!important;font-size:10px!important;line-height:1.05!important;border-radius:11px!important;white-space:normal!important;overflow:hidden!important;text-overflow:ellipsis!important}
  .toolbar-group.toolbar-nav .toolbar-action:nth-child(2),.toolbar-group.toolbar-nav .toolbar-action:nth-child(3){display:none!important}
  .toolbar-search{grid-column:1/-1!important;width:100%!important;max-width:none!important;min-height:40px!important;font-size:16px!important;padding:7px 12px!important;border-radius:14px!important}
  .file-explorer-content{display:flex!important;flex:1 1 auto!important;flex-direction:column!important;min-height:0!important;height:auto!important;overflow:hidden!important}.file-explorer-sidebar{display:none!important}.file-explorer:not(.sidebar-collapsed) .file-explorer-sidebar{display:none!important}.sidebar-resizer{display:none!important}
  .file-explorer-body{flex:1 1 auto!important;height:auto!important;min-height:220px!important;margin:0 4px 4px!important;border-radius:16px!important;overflow:auto!important;-webkit-overflow-scrolling:touch!important}.icons-view{grid-template-columns:1fr!important;gap:8px!important;padding:6px!important}.details-view{min-width:0!important}.details-header,.details-view .file-item{grid-template-columns:minmax(0,1fr) 76px!important}.details-header span:nth-child(n+3),.details-view .file-item>span:nth-child(n+3){display:none!important}
  .selection-action-bar{left:8px!important;right:8px!important;bottom:calc(env(safe-area-inset-bottom,0px) + 48px)!important;transform:none!important;flex-wrap:wrap!important;border-radius:18px!important}
}
`;
/** B"H: mobile Explorer now shows tools as a small crown and files as the kingdom. */
