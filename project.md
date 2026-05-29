# Smart Nav - Instant Page Tree Macro for Confluence Cloud
## Product Requirements Document v1.0

### 1. Vision & Context
**Problem**: Native Confluence page tree causes full page reloads on expand/collapse, loses scroll position, and doesn't respect user permissions until render. Admins and users report "getting back to where you were is insane" and "left hand menu feels like novice hacked it".

**Solution**: Smart Nav is a Forge Custom UI macro that renders a permission-aware, instant, sticky page tree with zero reloads. Installs in 60s, works instantly, solves the #1 UX complaint in Confluence.

**Success Metrics for MVP**: 
1. <200ms expand/collapse interaction 
2. 0 full page reloads after initial load
3. 4.5★+ rating in first 50 reviews
4. 14-day trial → paid conversion >20%

---

### 2. User Stories

#### As a Confluence User
1. **US-1**: As a user, I want to expand/collapse pages in the tree instantly without the whole page reloading, so I don't lose my place or wait.
2. **US-2**: As a user, I want the nav tree to stay visible while I scroll the page, so I can jump sections without scrolling to top.
3. **US-3**: As a user, I want to search for any page in the current space with `Cmd+K` and jump to it, so I don't click through 10 levels.
4. **US-4**: As a user, I only want to see pages I have permission to view, so I don't click dead links and get errors.
5. **US-5**: As a user, I want the tree to remember which sections I had open last visit, so I don't re-navigate every time.

#### As a Confluence Admin
6. **US-6**: As an admin, I want zero config after install, so I can solve nav pain without training or setup.
7. **US-7**: As an admin, I want this to work on mobile as a slide-out drawer, so my users aren't stuck with broken native nav.
8. **US-8**: As an admin, I want to know this won't slow my instance, so I don't get support tickets.

---

### 3. MVP Features - Ship in 2 Weeks

| **ID** | **Feature** | **Description** | **Acceptance Criteria** | **Tech Notes** |
| --- | --- | --- |
| **F-1** | **Instant Page Tree** | Recursive tree of current space pages. Expand/collapse with no reload. | Click expand → children render <200ms. No browser navigation event. | Forge Custom UI + React. `/rest/api/content/{id}/child/page` recursive. Cache in state. |
| **F-2** | **Permission-Aware** | API call filters pages user can't see. No 403s rendered. | User without view perm never sees node. API: `?limit=250` + check `restrictions` | Use `asUser()` in resolver. Handle `VIEW` operation check. |
| **F-3** | **Sticky Positioning** | Tree component stays fixed on scroll. Desktop only MVP. | On scroll, tree `position: sticky; top: 0` and remains in viewport. | CSS only. Fallback to static on mobile. |
| **F-4** | **Auto-Breadcrumbs** | Show path: Space > Parent > Current Page above tree. Click to jump. | Breadcrumb updates on SPA route change. Each crumb links to page. | `/rest/api/content/{id}?expand=ancestors` |
| **F-5** | **Remember State** | Persist expanded node IDs to `localStorage` per space. | Re-open page → previously expanded nodes are open. Per-user, per-space. | Key: `smartnav:expanded:{spaceKey}:{userId}` |
| **F-6** | **Free Tier Logic** | If instance ≤10 users, all features unlocked. >10 users, show upgrade prompt after 14 days. | `/rest/api/user/search?limit=11` to check size. Use Forge storage for trial start date. | `storage.get('trialStart')` |

**Non-Functional MVP Requirements:**
1. **Performance**: TTI <1.5s for 500-page space. Lazy load children.
2. **Security**: All API calls asUser. No data leaves Atlassian. No external calls.
3. **Mobile**: Graceful degrade - tree becomes collapsible section, not sticky.
4. **Forge Scopes**: `read:confluence-content.summary`, `read:confluence-space.summary`, `read:confluence-user`

---

### 4. Bonus Features - v1.1+ Post-Revenue
Ship these *after* $1k MRR. They increase retention/ACV but aren't needed for first sale.

| **ID** | **Feature** | **User Value** | **Complexity** |
| --- | --- | --- | --- |
| **B-1** | **Cmd+K Quick Search** | Fuzzy search all pages in space, jump instantly. | Medium. Requires indexing titles client-side. |
| **B-2** | **Multi-Space Nav** | Dropdown to switch space context without leaving page. | Medium. Needs `/rest/api/space` + permission check. |
| **B-3** | **Drag-Drop Reorder** | Admin can reorder tree, writes back to Confluence page parent. | High. Write scope + conflict handling. |
| **B-4** | **Page Analytics Badge** | Show "Updated 2d ago" or "3 comments" inline in tree. | Medium. Extra API calls = slower. |
| **B-5** | **Theme Support** | Light/Dark/Auto. Match Confluence theme. | Low. CSS vars. |
| **B-6** | **Export Tree** | Download current tree as Markdown list for docs. | Low. Client-side generation. |
| **B-7** | **Admin Analytics** | Dashboard: "Most clicked pages", "Search terms". | High. Needs Forge Storage + events. |
| **B-8** | **Smart Include+ Bundle Hook** | If Smart Include+ installed, show inline “restricted” badges. | Low. Cross-app signal. |

---

### 5. Technical Constraints & Guidelines
1. **Platform**: Atlassian Forge only. 0% rev share until $1M. No Connect.
2. **UI**: Custom UI with React. Do not use UI Kit 1 - too limited for tree.
3. **Data**: No external DB. Use Forge Storage only for trial dates + user prefs.
4. **API Limits**: Batch child page calls. 500-page space = 3-4 calls max with `limit=250`.
5. **Errors**: Never show stack trace. If API fails, render "Can't load tree. Refresh." + retry.

### 6. Marketplace Listing Copy Block
**Name**: Smart Nav — Instant Page Tree for Confluence  
**Tagline**: Stop the reloads. Navigate Confluence like it’s 2026.  
**Highlights**: 
1. Instant expand/collapse. Zero page reloads.
2. Permission-aware. No broken links.
3. Remembers your place. Sticky & searchable.
4. Install in 60 seconds. Free for 10 users.

### 7. Definition of Done for MVP
1. `forge deploy` to production works
2. Install on 3 test instances: 10, 500, 2000 pages. All <1.5s TTI
3. All 8 User Stories pass manual QA
4. Listing approved by Atlassian
5. Loom demo recorded: 30s before/after

