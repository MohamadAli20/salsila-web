# Salsilah Web

An interactive genealogy archive starting with Binidayan and Bayang in Ranao. Original ivory, forest-green, and gold interface. No build dependencies.

## Run

`npm run dev` starts http://127.0.0.1:3001.

`npm run check` checks JavaScript syntax, data/DOM references, ancestry cycles, source protocols, complete-chart coordinates, edge references, and reference image dimensions.

## Two genealogy views

**Full family tree** is the default Binidayan view. It renders 179 chart entries as HTML cards and 190 chart connections as SVG paths. The uploaded image is not the tree background. Search, zoom, drag, readable zoom, expanded canvas, connected-card highlighting, profile navigation, personal notes, and a searchable directory are available.

**Branch view · partial** retains the smaller structured parent/partnership dataset, with generation controls, collapse/expand, and focused branches. Bayang currently uses this structured view. Both views use our own design.

`chart-index.json` contains names, source-reference positions, and draft directed branches and neutral connecting lines. Labels that group multiple names or unnamed descendants are retained as written, so 179 entries does not mean 179 distinct individuals. Lineage arrows are chart connections and should not be read automatically as immediate biological parentage. All transcription and genealogical claims require review against the source. Ambiguous identities are not merged between the two data models.

The original comparison image is expected at `assets/sayawa-chart.png`; it is currently missing from this checkout. Source links and author attribution are in the Sources library. No claim of independently verified genealogical accuracy is made.

The updated 2026-11-03 text review covers 190 connections across 34 sections: 173 directed branches and 17 red connecting lines of unspecified relationship. Shared source junctions are distinct from direct box branches; the Olodan route remains unresolved. Run `npm run check:transcription` for its regression checks; see `docs/connection-audit.md` for corrections and remaining uncertainty.

The displayed tree uses automatic family rows and clear routing lanes rather than scanned coordinates. Unrelated crossing routes have visible gaps; shared source trunks remain connected. `npm run check:layout` verifies card and line collisions. The user has confirmed Maruhom → Anginta and Anginta’s marriage to Amai Pondag.

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
