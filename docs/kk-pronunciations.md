# American KK pronunciations

`dist/data.js` contains curated KK transcriptions for every practice word and every root-related reference word. `kkMarkup` displays them before and after revealing a card, in the library, and beside related words. Pronunciations are bundled locally; opening a card never fetches a dictionary.

American phoneme sequences and stress were checked against [CMUdict](https://github.com/cmusphinx/cmudict), via the dictionary data bundled in cmudict 1.1.3. Its data license is preserved in `dist/vendor/CMUDICT-LICENSE.txt`; the Python wrapper is not part of the website. Transcriptions use KK `e` and `o`, rather than IPA `eɪ` and `oʊ`, and `ɝ`/`ɚ` for rhotic vowels. Conventional Taiwan KK `ɪ` is used for unstressed final -y/-ly; the re- prefix retains `i`. Manual stress placement is before the relevant syllable, not mechanically before its vowel.

Additional pronunciation checks: [KK and IPA conventions (NTU)](https://homepage.ntu.edu.tw/~karchung/intro%20page8.htm), [usually](https://dictionary.cambridge.org/us/pronunciation/english/usually), [export](https://dictionary.cambridge.org/pronunciation/english/export), [floriculture](https://dictionary.cambridge.org/pronunciation/english/floriculture), [aviculture](https://dictionary.cambridge.org/pronunciation/english/aviculture), [cardiogram](https://dictionary.cambridge.org/pronunciation/english/cardiogram).

Import and transport show both noun and verb stress patterns. Export uses the American initial-stress pronunciation for both parts of speech. The reference word addict also shows its noun/verb distinction. Displayed pronunciations are standard variants; the device's existing English-US speech voice may use another accepted variant.

`node tests/kk.test.cjs` checks complete coverage and rendering. The build fails if a practice/reference word has no KK transcription. Rebuild using `node scripts/build-assets.cjs`.
