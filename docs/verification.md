# Verification

- JavaScript syntax and data checks pass: 44 records (43 named people plus one unknown-partner placeholder), 9 partnership groups.
- Browser checks passed: Binidayan tree, cross-generation Dimaporo search and parent profile, Bayang switch, filtered people directory, and source library links.
- Layout checked at 390px and 1440px viewport overrides with no document horizontal overflow; browser override reset afterward.
- Actual desktop screenshot: `desktop-preview.png`.
- Genealogy remains a selected source transcription, pending independent family review.
- Not deployed to Vercel. No shared editing or authentication in this initial version.

## Native full tree update

All 179 source-chart entries now render as original HTML cards, with 188 draft SVG connections; the source image is comparison material only. The full graph supports source-linked profiles and adjacent-entry navigation. Link counts and endpoints pass structural checks, but connection transcription remains subject to source and family review.

## Descendant root selector

Verified in the browser: selecting Maruhom shows only the root, five direct descendant entries, and two contextual partner cards at two generations; three generations expands to 16 entries. Reset restores all 179 entries. Automated checks cover depth limits, deep descendants, ancestor exclusion, leaf roots, and cycle safety.
