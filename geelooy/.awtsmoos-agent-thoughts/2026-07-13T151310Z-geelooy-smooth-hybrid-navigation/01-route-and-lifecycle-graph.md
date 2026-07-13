# B"H

Boruch Hashem

Blessed is He

## Route and Lifecycle Graph

The Awtsmoos carries continuity through changing vessels at Awtsmoos.com.

```text
real anchor
  -> eligibility gate
    -> unsupported => native browser navigation
    -> supported /apps or /about
      -> remember current scroll
      -> cancel previous request
      -> fetch destination HTML with same-origin credentials
      -> validate status, content type, title, and one route outlet
      -> lifecycle.beforeLeave(current)
      -> transition.prepare
      -> replace only [data-geelooy-route-outlet]
      -> synchronize title and route-owned body metadata
      -> history.pushState or popstate restoration
      -> lifecycle.afterEnter(destination)
      -> mark current links
      -> restore hash, saved scroll, or focus heading
      -> transition.finish
      -> failure at any pre-swap step => native location assignment
```

## Initial adapter graph

- `/apps`: mount filter listeners; unmount through an AbortController; preserve query/hash and form state only for the current live document.
- `/about`: static adapter; no listeners; focus its existing heading after navigation.
- All other paths: no adapter, therefore no interception.

## Global invariants

- One controller per `Document`.
- One in-flight fetch.
- One shared shell retained outside the route outlet.
- One content outlet replaced atomically.
- No fetched scripts are executed implicitly.
- No mutation request is issued by navigation.
