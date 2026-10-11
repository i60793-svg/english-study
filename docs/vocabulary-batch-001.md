# Vocabulary expansion: batch 001

Added 500 distinct practice words to the existing 111, for 611 total. The original 111 identities, order, meanings, parts of speech and KK transcriptions remain unchanged. New words are appended in alphabetical order. Existing localStorage and backup identities remain word strings; no reset or migration is necessary.

## Word selection

All 500 additions were checked against level 1 of the 大學入學考試中心 (CEEC) 高中英文參考詞彙表－111 學年度起適用－, July 2020 edition. This is a selected foundational batch, not the whole first level or the whole high-school list. Subsequent batches should exclude every already imported identity.

Official source: https://www.ceec.edu.tw/xmdoc?xsmsid=0K213553204833715309

Reviewed PDF: https://www.ceec.edu.tw/files/file_pool/1/0N118345621497981164/高中英文參考詞彙表(111學年度起適用).pdf

PDF SHA-256: `27b010f8230b2e8763653ddb35783fe9e0140c143b0040f13839046aebb2a126`

Checked on 2026-10-05. The official table supplies English headwords, levels and parts of speech. Chinese learning meanings, English example sentences and Traditional Chinese translations were authored separately for this Site; they are not copied from the reference PDF. Meanings and examples focus on common senses, not exhaustive dictionary entries.

## Pronunciation and roots

American phoneme sequences were read from CMUdict data bundled in cmudict 1.1.3 and converted to the Site's existing KK convention. The 500 resulting transcriptions were reviewed, with conventional vowel/stress corrections, compound stress placement and part-of-speech choices. In particular, close is the verb, live means reside, read is present tense, and minute is the time unit. KK data is bundled locally. Existing CMUdict attribution/license remains in `dist/vendor/CMUDICT-LICENSE.txt`.

Only the already reviewed fin root is inherited by finish from the existing reference-word catalog. Other new words do not receive a speculative decomposition. Matching strings such as cap or card do not imply a root relationship. Prefix/root details and related-word limits retain the existing behavior.

## Maintenance

`src/vocabulary/batch-001.json` is the reviewed batch source, containing level, headword, part of speech, meaning, KK and bilingual example. Run `node scripts/import-vocabulary.cjs` after changing a batch, then `node scripts/build-assets.cjs`. Import is idempotent and rejects duplicates or incomplete entries. The generated header uses the actual vocabulary count, so later imports do not leave a stale total.

Verification: complete examples/KK across 611 cards; 500 additions with no repeated identities; exact original-111 content comparison; existing learned cards, review logs and exclusions after reload; new English/Chinese search; users who finished the old bank receive exactly 500 new words; daily quota, continuation, forecasts; old and new backups; existing scheduler, audio, roots and loading checks. Minified initial HTML is approximately 176 KB, 63 KB gzipped, with no additional blocking script requests.
