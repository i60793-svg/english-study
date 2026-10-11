# Reviewed root data

Reviewed 2026-10-07: all 611 practice words have an individual disposition in `src/roots/review.json`. 184 have verified displayable components; 427 intentionally have no decomposition. This is not a claim that every word is decomposable or that all remote pages supplied usable evidence. Entries marked `unavailable` record missing primary evidence.

Membean's root catalog provides the organizing vocabulary and meanings. Etymonline's individual word entries (and explicitly recorded base-word entries for derivations) verify membership, spelling changes and context. root.eng.tw articles supplement Chinese explanations where their root agrees with that verification. Displayed Chinese descriptions are original summaries, not copied source paragraphs. The old Scribd reference is no longer used.

Only reviewed parts display. There is no substring inference or fallback to legacy `refs`. A verified prefix can display by itself; unknown stems stay omitted. The visible line is the selected historical components, not a claim to reproduce every letter of the modern word. Word notes explain phonetic changes where necessary. All unrelated homographs remain separate families: port carrying / harbor, card paper / cardi heart, ess existence / -ess feminine, par appearing / preparing, in- negative / entering. Uncertain cap-to-head and unknown native roots stay hidden.

Common grammatical/part-of-speech suffixes are excluded in both the dataset importer and runtime. The JSON contains the exact list, including -ful, -ly, -tion, -ness, -ment, -able, -er and common inflections. Semantic suffixes such as -ess (female) and -gram (record) are allowed when individually documented. Multiple confirmed roots remain visible (floriculture, aviculture). Related words are deduplicated and the UI limits them to 10. The study word count stays 611; reference examples never alter learning progress.

## Editing and rebuilding

1. Review the intended word sense in Etymonline, then match a Membean component. Do not transfer another homograph's meaning. Use root.eng.tw only as a supplement.
2. Update `src/roots/review.json`: root catalog, per-word parts, original Chinese note, exact retrieved source URLs, status and review date. Unverified parts have an empty parts list. Each displayed entry must have Etymonline evidence; component meanings require an actual catalog or etymology source.
3. Run `node scripts/import-roots.cjs`, then `node scripts/build-assets.cjs`.
4. Run the tests. Adding a practice word also requires an individual root review, including an explicit no-display disposition when appropriate.

The importer is idempotent. Full external article bodies remain research-only and are not shipped. No progress data, storage keys, scheduling or backups are changed by this review.
