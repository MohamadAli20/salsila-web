# Personal lineage and name research — 3 November 2026

## Family account

Source: the user's corrected family account in chat (3 November 2026). Seven family-account entries, including one unknown ancestry-span placeholder, are distinct from the 179 source-image boxes and have no fabricated image coordinates. Samurong is explicitly identified as female. Ginaronai from Poon a Baebao was Samurong's second spouse; their child is Calanda Ginaronai. The earlier unknown father of Bayango entry and the Samurong → Bayango child attribution have been replaced by this correction. Bayango's Digadong ancestry is pending, with intervening identities and generation count unknown. The intermediate child of Maruhom is not presumed to be Samurong's mother. According to the user’s father, Samurong’s mother was Malaysian. Her name and specific ethnicity remain unknown, and this does not establish whether she was the child of Maruhom. The reported first-cousin relationship with Dimaporo and second-cousin relationship between Bayango and Calanda retain unresolved common ancestors and do not enter automatic kinship calculations. Calanda's description as a paternal grandfather remains a family-account note without invented intervening descendants.

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

A separate card records Samurong’s unnamed Malaysian mother, according to the user’s father. It has a maternal link to Samurong, without an asserted link to Maruhom. The maternal card and the unnamed child of Maruhom could represent the same person; their identity remains unresolved.

The user explicitly identifies Ginaronai as male: Samurong’s second husband and Calanda’s father. The earlier wording about unspecified gender for Ginaronai has been removed.

## Alicasan, November 9, 2026

Usman Ali, Tabunawan, Mamadra, and the maternal-cousin and half-brother accounts are documented in [the November 9 evidence audit](alicasan-2026-11-09.md). The accessible 2017 Kawashima paper names Usman Imam Shiek al-Aman as a direct descendant and mentions his parents as narrators; it does not name Tabunawan. The 2019 collection-history chapter is linked as a parentage reference awaiting full-text verification.

## Verified Sophia parentage correction

Sophia record 2005239, Kawashima Midori’s commentary section II.1, names Tabunawan as Usman Imam’s father, identifies the unnamed mother as from Bayang, and describes **Tabunawan** as the sixth-generation descendant of Sayyidna. This supersedes earlier notes attributing parentage solely to Alicasan or treating Usman as the sixth-generation descendant. See `docs/alicasan-2026-11-09.md` for current attribution. The repository is under maintenance; `docs/references/` holds offline research notes and checksums, not a full PDF backup.
