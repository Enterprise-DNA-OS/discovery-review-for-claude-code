# Move a GoldFynch document register

GoldFynch's [file report guide](https://support.goldfynch.com/support/solutions/articles/2100034018-generating-reports-using-goldfynch-s-report-feature) documents file-list reports and their fields. In the case, open Reports, create a File listing - All files report, choose columns and include tags if needed. Download the spreadsheet. Save only the document listing sheet as UTF-8 CSV; remove any report title or aggregate rows so the first row contains field names. Keep the original spreadsheet unchanged. The guide's listed formats include spreadsheets; do not assume every account has a direct CSV button.

## One command after export

Start a fresh database, apply migrations without demo seed, and create the matter with add-matter. Then:

```bash
node scripts/discovery.mjs import goldfynch path/to/file-list.csv --matter="Your dispute" --actor="Your reviewer" --dry-run
node scripts/discovery.mjs import goldfynch path/to/file-list.csv --matter="Your dispute" --actor="Your reviewer"
```

Required columns are GF ID and File Name. Custodian, Source, Family ID, Parent ID, MD5 Hash, Tags, Redacted? and Protected? map to working fields when present. Every original column is preserved as text in the source row. Headers are case-insensitive. CSV supports quoted commas, doubled quotes, embedded newlines and a UTF-8 BOM. The included example is synthetic and follows the documented field names; no authenticated customer export was used.

The importer validates identifiers, hashes and booleans, rejects duplicate GF IDs within a file and rolls back the whole batch on error. Matching uses matter plus GF ID. An identical row leaves the current review intact. A changed row preserves earlier values in history, clears attached text and invalidates earlier decisions. Rows missing from a later report remain. Each successful run records the file hash and row count.

Source date strings are preserved, not interpreted across ambiguous regional formats or time zones. Use set-document to record a confirmed calendar date and custodian. Source tags, review-set fields and reviewer names are preserved but never converted into approved decisions. Supply a new review after checking them. Attach extracted UTF-8 text with ingest-text when required; inspect it against the native original.

## Reconcile before leaving

Compare the set of GF IDs, total rows, custodians, family membership, tags and original source fields. Review family-gaps and duplicates. A filtered report is not the entire case. Preserve the original files and GoldFynch exports separately. This import does not transfer native binaries, OCR, visual annotations, redaction geometry, production packages, saved searches or user access controls. The JSON export is a private data snapshot, not a court production. Keep the incumbent until the lawyer accepts the evidence and the replacement workflow.
