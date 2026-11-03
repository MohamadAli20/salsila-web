# Personal lineage and name research — 3 November 2026

## Family account

Source: the user's supplied family account in chat. Five new entries are distinct from the 179 source-image boxes. They have stable IDs and `recordSource: family-account`, with no fabricated image coordinates. The intermediate child of Maruhom is not presumed to be Samurong's mother. Samurong's reported maternal Malaysian origins do not establish a name, ethnic group, or link to Maruhom. The unnamed father of Bayango is a separate unknown person. The Digadong clan association has no encoded immediate-parent link. The report of first cousins is retained with an unresolved target identity and common ancestor; it does not enter automatic kinship calculations. The user's description of Kalanda as a paternal grandfather is retained as a family-account note without inventing the intervening descendants.

`docs/personal-lineage.json` records the extension and unresolved questions. The original transcription fixture remains independent.

## Mohamad Ali Dimaporo

Stable chart ID `chart-132`, originally “Sult. Ali”. The source account explicitly names Dimaporo and Borngao as parents and identifies Sultan Ali as Mohamad Ali Dimaporo. The original `chart-126` Dimaporo remains a separate entry. “Sultan Dimaporo” alone is ambiguous, including in the user's cousin account; this account is not automatically assigned to either entry.

- Identity and original family context: https://acmaly88.page.tl/SULTAN-ALI-DIMAPORO.htm
- Representative for Lanao del Sur's second district after the 1987 election: Supreme Court decision, 15 October 1991, https://lawphil.net/judjuris/juri1991/oct1991/gr_96859_1991.html
- Acting MSU President, 1976–1986: official university timeline, https://www.msumain.edu.ph/the-msu-system-presidents/

Only these narrow public-service facts are used in the biography; conflicting dates elsewhere in the genealogy account are not copied.

## Tuan

Stable ID `chart-039`, renamed to “Tuan sa Binidayan” with “Tuan” retained as an alias. This is a contextual name, not a claim to have established a full personal name.

- The Ameroden account calls the parent of Amai Makapondag “Tuan sa Binidayan”: https://acmaly88.page.tl/AMERODEN-SA-BAYANG.htm
- The Binidayan account lists Tuan separately after Kadi: https://acmaly88.page.tl/GOGODAN-SA-BINIDAYAN.htm
- The Kadi article calls the scholar Sayyidna Tuan Muhammad Said / Kadi sa Binidayan: https://acmaly88.page.tl/SO-KADI-SA-BINIDAYAN.htm

Those sources do not justify merging the chart's separate Tuan and Kadi entries. Tuan's profile retains this identity limitation with links.

## Verification

Transcription, extended layout, family-account provenance and unknown-identity tests pass. The graph now has 184 entries, 195 active edges and 18 shared source junctions. Browser checks cover Samurong's connections and notes, plus Ali's badge, biography dialog and cited sources. The existing full check still requires the absent original PNG; graph/data and kinship tests run independently of that image check.

## Kawashima Midori references and English label

The 2017 paper, *The Journeys of Two Mindanao Ulama in the Late Eighteenth Century to Early Nineteenth Century*, Journal of Philippine Local History & Heritage 3(1), pp. 1–40, is listed on the author's bibliography: https://kawashimamidori.jp/research_activities.html. Its canonical DOI is https://doi.org/10.69341/2000107. The 2019 chapter *Connecting Mindanao to Hijaz: The Journey of “Sayyidna” Tuan Muhammad Said*, pp. 73–128, is listed there with https://doi.org/10.69341/2003208.

The canonical repository was temporarily inaccessible during this check. The relevant 2017 text was inspected through an indexed reading copy (StudyLib document 25551659), which clearly separates oral tradition from manuscript evidence. The app links the canonical paper, the author bibliography and the 2019 repository record.

The updated chart identifies Kadi sa Binidayan (`chart-038`) as Sayyidna Tuan Muhammad Said and retains the original name as an alias. It uses the English badge **Pioneer Hajj Pilgrim**, reflecting the paper's qualified oral account of an early Lanao pilgrim. It does not claim he was the first pilgrim of the Philippines. The separate Tuan entry (`chart-039`) remains separate.

## Descendant visibility

Previously, every Start here / root-picker action reset depth to two chart steps, excluding distant entries. Those actions now default to all recorded descendants. A separate searchable Descendants list on the canvas uses the full directed traversal, independent of the current depth selector. Connected context cards are excluded from the descendant count. Chart steps are not automatically described as biological generations.

## Reported cousin alignment and path discrepancy

The user's latest instruction requests Samurong and the original Dimaporo entry (`chart-126`, distinct from Mohamad Ali `chart-132`) on the same display row as reported full first cousins. A `layoutConstraints` entry aligns these groups and keeps their outgoing descendants below them. No parent–child edges or ancestor records are inserted or removed.

`generationGapReport` compares the existing paths from Maruhom: Maruhom → unnamed parent → Samurong (2 recorded steps), versus Maruhom → Ginarapandi → Mangotara → Dimaporo (3). The UI reports a one-step discrepancy, while the confirmed number of missing biological generations remains unknown. Possible explanations include omitted generations, an indirect chart arrow, or a family account that needs clarification. Blank display space is not counted as a person. The Samurong route is dashed when both cousins are displayed.

The canvas magnifying-glass button zooms and centers the selected name at a readable scale without requiring the profile panel. It works in both chart and structured views.
