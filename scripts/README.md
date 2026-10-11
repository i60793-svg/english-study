Run `node scripts/build-assets.cjs` before publishing changes. It uses pinned esbuild 0.28.2 through npm exec (cached after the first run).

- Edit `src/index.template.html` for page markup and base styles.
- Edit `dist/app.js`, `dist/data.js`, `dist/encouragement.js`, `dist/scheduler.js`, and `dist/theme.css` for app content, behavior and theme.
- `dist/index.html` and `dist/sw.js` are generated outputs. Do not edit them directly.
- The initial HTML contains minified styles and scripts, eliminating blocking subrequests.
- The worker caches the self-contained page and checks for updates in the background; the build hash isolates versions.
- Run `node tests/fsrs.test.cjs` and `node tests/loading.test.cjs` after the build.

Reviewed vocabulary batches live in `src/vocabulary/batch-NNN.json`. Run `node scripts/import-vocabulary.cjs` before building after a batch edit. Existing practice identities are retained; duplicate additions and missing meanings, parts of speech, KK or examples fail the import. The page header is generated from the actual word count. See `docs/vocabulary-batch-001.md` for provenance and `tests/vocabulary.test.cjs` for expansion/progress compatibility checks.

Per-word root reviews live in `src/roots/review.json`. Run `node scripts/import-roots.cjs` after editing them. Each practice word needs a verified decomposition or an explicit no-display disposition. The build checks that the runtime matches the reviewed mappings. See `docs/root-data.md` and `tests/root-review.test.cjs`.
