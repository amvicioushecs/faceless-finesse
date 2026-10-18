# State Management

> Faceless Finesse · Draft v1

| Kind | Tool | Used for |
|---|---|---|
| Local | React `useState`/`useReducer`, React Hook Form | Form inputs, editor UI, modals |
| Global UI | **Zustand** | Current workspace/brand, editor panel state, theme |
| Server | **TanStack Query** | All API data: niches, posts, calendar, usage; caching, background refetch, **optimistic updates** on calendar drag-and-drop and approvals |
| Realtime | Supabase Realtime → invalidates TanStack Query caches | Render/publish job status |
| Persistence | Zustand `persist` (localStorage) | Last workspace, theme, **unsaved drafts** (restored after refresh/offline) |
| Mutations | Server Actions / REST via TanStack Query mutations | With retry + rollback on error |

Rules: server is the source of truth; never store tokens or secrets client-side; Whop identity comes from the iframe token, not client state.
