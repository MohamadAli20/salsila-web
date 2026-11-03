# Neutral display labels — latest user preference

Display connections as “Connected names”, “Connected boxes” or “Connected people”, without spouse/husband/wife or inferred gender labels. This applies to cards, profiles, the legend and comparison results, including Anginta–Amai Pondag. Earlier relationship clarification remains historical metadata; it does not determine display labels. Maruhom→Anginta retains the gender-neutral parent/child label explicitly supplied by the user. Layout and active connections remain unchanged.

---

# Layout and relationship clarification — 2026-11-03

The user authorizes moving names freely to keep connections legible and explicitly confirms Maruhom as Anginta's parent and Amai Pondag as Anginta's spouse. Those two edges now carry confirmed relationship metadata; all other connection types still follow the updated text transcription. The profile and comparison labels reflect these confirmations.

`chart-layout.js` now arranges cards by the directed graph, keeping red-connected cards on the same row. Original scanned coordinates remain source-reference data only. Both full and focused chart views use this layout. Each arrow travels through row spacing; longer arrows have outside lanes. Unrelated crossing routes have visible gaps instead of touching strokes. Common source trunks remain connected as genuine source junctions. Every active edge is retained. Comparing two chart entries highlights their cards without drawing an extra line across the tree.

Validation: `npm run check:layout` checks all 179 cards and 190 connections, all 179 two-step focused views, and five deep views for card collisions, line/card penetration, and unrelated visible line overlaps. It also verifies Anginta is below Maruhom and alongside Amai Pondag. Transcription regressions still pass. Browser verification covers the Maruhom family layout.

---

# Updated 34-section transcription review — 2026-11-03

Current authority: [updated user transcription](updated-transcription.txt). This supersedes both earlier reviews below. It is a text-based review; no new visual verification of the missing original PNG is claimed.

The active graph now contains 179 source boxes and 190 connections: 173 directed branches and 17 red connecting lines. The red lines use the neutral `connection` type. Shared branches use `junctions`, `origins`, `otherOrigin` and `junctionId`, with no claim of marriage or biological parentage. Profile labels, line tooltips, branch cards, comparison results and the legend use that same distinction. Focused traversal counts chart steps, not established biological generations. Both the full chart and focused branches draw shared routes from the connecting line.

Applied corrections:

- Restored Mino–Moyao and Dimaporo–Borngao as red connections. Palawan/Bandara and the five Borngao-group branches start at their respective junctions; Osinta is only a direct branch from Dimaporo.
- Ampaso has seven outgoing box branches. Removed the three unsupported paired-box connections; notes retain the uncertainty over whether the right-side boxes denote people, titles or alternate names.
- Moved Zolaika and Adawia from Ama Deca to Mangotara.
- Datumangoda–Ganayo share Macadiar, Pagariongan, Datu Manong and Macarangkat. Sangcopan belongs to Datumangoda's separate direct route.
- Sultan Dangcogan–Kamli share Baong. Sultan Dangcogan alone has Gomama, Sowaib, Barabad, Pitaga, M’lukba and Pantalan. Removed the previous Tangcolo routes and Macarangkat→Baong interpretation.
- Bandara–Babayoalan share Datu & Itoraga and Sult Papanok. Amai Darnang and Amai Pondag now branch from Sult Papanok.
- Added Dimasangca to Amai Pondag–Anginta's shared junction. Kept Gondarangin, Lomabao and the grouped Maulad entry as Amai Pondag's direct branches.
- Added Datu Manong→Maintok/Angkay/Dinganoman, Maintok→Odato/Azis/Dianib/Bilan, and Sultan Abdulmadid to the eight shared Dinganoman–Pangcoga branches.
- Preserved direct/shared separation for Lumb–Maruhom, Manggis–Dimasangca and Matala–Batawi Datumulok. Anginta, Alangadi/Amero/Pundamdag and Malindato do not leak into the other connected box's branches.
- Corrected Kaharoden, Batawi Datumulok, Macadiar and Lomabao; retained earlier spellings as searchable aliases. The two Shiek boxes remain distinct. Grouped +, & and & MORE labels remain intact.

Uncertainty and interpretation:

- Olodan remains a visible box with an unresolved-route note. Its arrow's origin could be Oranto or the surrounding group, so it is excluded from directed traversal.
- Sections 11 and 17 are read as continuing arrow chains, consistent with the earlier transcription: Dayangindo→Sambae + Radiatua→Gagamuk + Radia-Ali→Mokayan + Bara→Bobonga + Marug, and Diwan→Amdag→Ameroden sa Bayang.
- Prior active connections and prior unresolved records are archived in `supersededConnections`. Earlier routes not supported by this expanded transcription are excluded from the active graph, including the lower-right Odato/Azis/Dianib/Bilan/Maintok/Angkay routes into the Dinganoman–Pangcoga group. The original records remain recoverable in that archive.
- The separately sourced structured `family.json` branch view remains a separate dataset. Chart comparisons do not infer biological kinship from similarly named records in that dataset.

Validation: `npm run check:transcription` checks all 190 connections against the extracted source fixture, direct/shared traversal boundaries, both Shiek IDs, aliases, unresolved Olodan, neutral comparison labels, junction consistency and cycle safety. Existing data, descendant, kinship and community checks pass independently of the original-image check. Full `npm run check` still fails at the missing `assets/sayawa-chart.png` check. Browser verification covers Ampaso, Ganayo and Dimaporo, with no JavaScript errors observed.

---

Historical reviews below are superseded by the updated transcription above.

# Partial text transcription review — 2026-11-03

Source: the user's partial text transcription supplied in chat on 2026-11-03. This review compares encoded connections with that text; the original PNG is absent from this checkout, so it does not claim a new visual inspection.

Reviewed 74 supplied directed or paired connections. Most were already present. Applied these corrections:

- Mino → Moyao replaces the earlier Mino/Moyao partnership interpretation. Palawan and Bandara retain their outgoing links from Mino, without inferred second parent Moyao.
- Dimaporo → Borngao replaces the earlier Dimaporo/Borngao partnership interpretation. Osinta remains linked from Dimaporo; Sult. Ali, Naga, Monib, Macacna and Minango are linked from Borngao, without inferred second parent Dimaporo.
- The two superseded partnership interpretations are retained in unresolvedConnections with their provenance, excluded from the active graph and descendant traversal. Their former shared-parent union records have been removed.
- Display spellings now follow Kharoden, Macacna, Babayoalan and Battawi Datumulok. Stable IDs and earlier spellings are preserved; full-tree search accepts those aliases.
- Profile research notes preserve “Grandson of Alionden of Sulu,” “Granddaughter of Kabunsoan,” “Apo o Rahmatulah,” and “Apo o Dadiyoba.” These annotations do not invent intermediate ancestors or immediate-parent links.
- The upper Shiek under Kadi sa Binidayan remains separate from the lower Shiek. Grouped names joined by + or & remain grouped entries.

The user's legend describes arrows as directions and horizontal lines as connected names. Directed chart links remain draft lineage connections; paired links retain the existing chart partnership representation and do not independently establish marriage. Unlisted routes retain their earlier draft status because this transcription is explicitly partial. Spelling choices and revised arrow interpretations remain subject to clarification of overlapping source lines.

Validation: `npm run check:transcription` verifies all 74 supplied connections, aliases, annotations, removed shared-parent assumptions, generation placement, union consistency and absence of directed cycles. Existing graph, kinship and community checks also pass when the unavailable PNG dimension check is excluded. Full `npm run check` remains blocked by missing `assets/sayawa-chart.png`.

---

The earlier visual audit below is retained as historical context. The text-review corrections above supersede its Mino/Moyao and Dimaporo/Borngao union interpretations.

# Sayawa chart visual audit — 2026-11-03

Status: partial audit, not a certification of all genealogy. Source: assets/sayawa-chart.png (1650 × 1275). Inspected enlarged upper, middle, lower and junction crops from the user attachment.

Corrections applied:
- Changed Asahid/Duma sa Madamba, Ginto/Blak sa Madalum, Anol/Amba sa Uyaan from parent-child links to partnership links (double-ended horizontal source arrows).
- Asamat connects to Babayolan. Datu & Itoraga, Sult Papanok, Amai Darnang and Amai Pondag attach to the Bandara/Babayolan junction, rather than Asamat or Sult Papanok.
- Sult Papanok connects to Apaki & Lopayo, Odal & Monar, Pondaagan and Oranto. Amai Pondag connects to Gondarangin, Lomaao and Maulad & Polayagan & More. The separate Amai Pondag/Anginta junction connects to Suma and the lower Shiek.
- Matala/Batawi Datumulok junction connects to Malamit, Gakut, Bukhari and Bukilan. Malindato has a separate Batawi route. Lopak retains its separate routes to Muliloda, Magidala and S’mpayar.
- Added Datu Abdal → Luman and Dimasangca → Alangadi/Amero. Removed Galawan → Amero. Corrected Paramanis → Sapiro & Posaka & Bato.
- Added explicit second-parent metadata for 13 visible child junction groups. Descendant traversal follows each person's own child links and shared junctions, without automatically inheriting every child of their spouse. Osinta remains outside the Dimaporo/Borngao shared junction; Anginta remains outside Maruhom/Lumb's four-child junction.

Excluded pending confirmation (retained in unresolvedConnections): D. Simban → Palawan a Olama sa Basak; Macarangkat → Pitaga/M’lukba/Pantalan. Other complex lower-right routes have not been fully audited. Grouped source boxes remain grouped entries, not individual people.

Validation: npm run check in salsilah-web; regression checks for partnerships, branch reassignment, generation limits, Matala's four children, and isolation of children across unions. Browser checked Matala root with two generations; screenshot connection-review.png. These checks verify implementation consistency; they cannot prove the chart's historical claims.
