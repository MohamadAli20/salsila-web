# Salsila Web

An interactive genealogy archive starting with Binidayan and Bayang in Ranao. Original ivory, forest-green, and gold interface. No build dependencies.

## Run

`npm run dev` starts http://127.0.0.1:3001.

`npm run check` checks JavaScript syntax, data/DOM references, ancestry cycles, source protocols, complete-chart coordinates, edge references, and reference image dimensions.

## Two genealogy views

**Full family tree** is the default Binidayan view. It renders 179 source-chart entries plus 14 family-account entries (including one unknown ancestry-span placeholder) as HTML cards, with 203 recorded connections and 4 dashed pending ancestry routes as SVG paths. The uploaded image is not the tree background. Search, zoom, drag, readable zoom, expanded canvas, connected-card highlighting, profile navigation, personal notes, and a searchable directory are available.

**Branch view · partial** retains the smaller structured parent/partnership dataset, with generation controls, collapse/expand, and focused branches. Bayang currently uses this structured view. Both views use our own design.

`chart-index.json` contains names, source-reference positions, and draft directed branches and neutral connecting lines. Labels that group multiple names or unnamed descendants are retained as written, so 179 entries does not mean 179 distinct individuals. Lineage arrows are chart connections and should not be read automatically as immediate biological parentage. All transcription and genealogical claims require review against the source. Ambiguous identities are not merged between the two data models.

The original comparison image is expected at `assets/sayawa-chart.png`; it is currently missing from this checkout. Source links and author attribution are in the Sources library. No claim of independently verified genealogical accuracy is made.

The updated 2026-11-03 text review covers 190 connections across 34 sections: 173 directed branches and 17 red connecting lines of unspecified relationship. Shared source junctions are distinct from direct box branches; the Olodan route remains unresolved. Run `npm run check:transcription` for its regression checks; see `docs/connection-audit.md` for corrections and remaining uncertainty.

The displayed tree uses automatic family rows and clear routing lanes rather than scanned coordinates. Unrelated crossing routes have visible gaps; shared source trunks remain connected. `npm run check:layout` verifies card and line collisions. The user has confirmed Maruhom → Anginta and Anginta’s marriage to Amai Pondag.

The corrected family account records Maruhom → unnamed parent → Samurong (female), whose second spouse was Ginaronai from Poon a Baebao. Their child is Calanda Ginaronai, connected to Bayango Gandamazir. Bayango comes from Digadong through an unknown ancestry span. Ginaronai is identified as male by the user; unspecified entries retain neutral labels. See `docs/personal-lineage.json` and run `npm run check:personal`.

Mohamad Ali Dimaporo has a public-figure badge and a click-to-open sourced biography. The old “Sult. Ali” label remains searchable. Tuan is expanded to the supported contextual name “Tuan sa Binidayan”; a full personal name is not established. It is not merged with Tuan Muhammad Said / Kadi sa Binidayan.

## Files and persistence

- `family.json`: initial structured genealogy, regions, and source metadata.
- `chart-index.json`: full diagram card and connection data.
- `app.js`, `style.css`, `index.html`: application.

Export includes structured genealogy and the native chart graph. Import opens a validated export for the current session only. Personal notes save only on the current browser/device and are excluded from exports. Image assets are project files, not embedded in JSON exports. There is no shared database, authentication, or admin editor yet.

## Vercel

Import the repository and set Root Directory to `salsilah-web` if using the parent repository. Framework: Other. No build command. Output directory: `.`. `vercel.json` is included. No deployment has been performed.

## Choose a descendant root

In Full family tree, use **Start from** to select Maruhom or any chart entry. The graph is re-laid out top-down with that entry at generation 1 and only its recorded descendant links below it. Partners appear as contextual cards. Choose 2, 3, or all generations; **Show full tree** restores the overview. A profile also has **Start from this person**.

This view follows directed draft chart connections, including links from a person's partner. It does not walk backwards into parents or unrelated branches. Repeated reachable entries are shown once in a spanning tree; the source graph remains unchanged. Its descendant relationships are only as reliable and complete as the transcribed source links.

## Relationship tooltips and cousin comparisons

Hover a connector, tap it, or focus it with the keyboard to see its endpoint names and relationship. Known parent/child and partnership links are labelled; chart links without enough parent data remain labelled as lineage connections.

Open **Compare relatives**, select two people, and choose **Show relationship**. A dashed comparison line shows the calculated relationship on hover/focus when both people are displayed. The calculation uses the separate structured parent/union records, not geometric proximity or unverified chart arrow distances. It supports siblings, parent/child, grandparents, aunt/uncle relationships, cousins, and removed cousin degrees. Unknown parent placeholders are excluded from common-ancestor matching. No relationship is inferred when records are insufficient.

Example in Branch view with all generations: Dimaporo and Dimaluna resolve to first cousins through the recorded Ginarapandi line. This is a result based on draft records, not independent verification of those records. The calculation reports the closest encoded relationship; multiple historical paths may exist.

## Private genealogy workspace (local prototype)

Open `/contribute`, also linked as **My genealogy** from the archive header. Add people and sourced parent–child claims, view the generation tree, record supporting/conflicting research notes, mark a connection for future review, inspect the history, and export/import the workspace as JSON.

Data stays in `localStorage` on that browser/origin. This is not an authenticated account or a shared community database. Review requests do not contact other people; local notes and imported histories are not independent verification. There is no public publishing or moderator approval endpoint. All people remain local, including living/unknown-status people. Export files include all records and notes. Clearing browser storage loses the local copy unless exported.

Shared accounts, server-enforced access controls, invitations, moderator decisions, and publishing rules require a hosted backend before opening submissions to the public. Source evidence is contributor-entered, not an automated determination of truth or permission to republish.

Validation: `npm run check`. Model checks cover required evidence, ancestry cycles, duplicate claims, unsafe URLs, import validation, and rejection of a fabricated `verified` status. Browser QA used fictional example people on a separate localhost origin; tested draft creation, source entry, review-request state, a disputed note, reload persistence and a downloadable JSON export. `docs/community-workspace-preview.png` shows the fictional QA example. The main preview's workspace remains empty.
# salsila-web

The Kadi sa Binidayan entry is now shown as Sayyidna Tuan Muhammad Said with a **Pioneer Hajj Pilgrim** badge and citations to Kawashima Midori's 2017 paper and 2019 chapter. These are also listed in Sources. The title reflects a qualified oral account rather than an absolute first-pilgrim claim. Tuan sa Binidayan remains a separate entry.

Selecting a starting person now shows all descendant branches by default. The canvas **Descendants (N)** button opens a searchable list across every recorded chart step, so distant entries can be located without reading the entire zoomed-out graph. Run `npm run check:descendants` for navigation and source-label regressions.

The canvas **🔍 Zoom** button magnifies the selected name. The user-reported cousin pair Samurong and the original Dimaporo entry now share a display row; **View cousin level 🔍** frames them together. The generation note compares their existing paths from Maruhom (2 versus 3 recorded steps) and reports a one-step discrepancy without inventing an extra ancestor or a verified missing-generation count.

Bayango Gandamazir has a pending ancestry route from Digadong. Its placeholder represents an unknown span, not a known individual or one generation. Bayango and Calanda are reported second cousins according to the family account; their common ancestor is unresolved. Pending routes do not contribute to descendant counts or calculated kinship.

Samurong’s unnamed Malaysian mother has a separate family-account card, attributed to the user’s father. Her connection to the unnamed child of Maruhom remains unresolved; these records may refer to the same person, but are not merged without clarification.

The Layout selector defaults to Compressed, with tighter spaces between cards, groups, and generations. Spacious restores the wider layout. Both options retain all entries and connections and automatically fit the canvas when switched.

Compact overview now uses name-only cards by default. Full detailed tree restores card details. Focus family shows the selected entry’s immediate recorded family connections; Show more expands another step. Per-card +/− controls collapse or expand descendants. Expand branches restores collapsed branches; Fit branch frames the selected entry’s visible descendants, and Fit all restores the whole chart.

Ultra compact is the default: connected groups wrap into bands of about six cards, with chart-level labels distinguishing wrapped rows from ancestry generations. Initial distant branches collapse at the third chart level, with hidden-descendant counts. Expand branches and Fit all reveal the full diagram. Search reveals collapsed entries. Long connector lanes are reused only for non-overlapping spans. The fully expanded view is narrower but taller than Compact overview.

The extended branch includes Usman Imam, Tabunawan and an unnamed mother from Bayang (Kawashima Midori, Sophia record 2005239), plus Mamadra and reported family connections (Alicasan, November 9, 2026). Tabunawan is the sixth-generation descendant; missing ancestry runs from Hadji Said to Tabunawan. Typed sibling connections and a maternal-cousin account retain their specific evidence limits. See `docs/alicasan-2026-11-09.md` for the research audit and identity caveat.

The main diagram now places Hadji Said lineage in column 2, followed by Calanda–Bayango in column 3. Column 2 identifies Kawashima’s Sophia parentage reference; column 3 credits Alicasan’s account for the additional family connections. Cross-column sibling and maternal-cousin lines connect the existing Samurong/Ginaronai boxes directly. Mouse dragging disables SVG text selection while preserving record selection and zoom.

Source backup: `docs/references/kawashima-usman-imam-record.html` provides the original Sophia link, offline summary, short source excerpts and checksums. Repository maintenance prevented downloading the full original PDF; the backup manifest records that limitation.

The user’s father clarifies Hadji Said → Tuan sa Magonaya → Gandamasir. Tuan sa Magonaya has a distinct record and third-column card; he is not merged with Hadji Said or Tuan sa Binidayan. Visible relationship labels omit repeated source names, while source headings and record notes preserve attribution.
