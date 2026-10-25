# Discovery Review for Claude Code

Find unfinished reviews, preserve privilege decisions and draft discovery schedules from records you own. An MIT-licensed review desk for legal teams with exported document registers and text.

| Do it yourself | We customise it | We run it for you |
|---|---|---|
| Free. Try the demo and import your document register. | Your review fields, evidence rules, reports, history and any agreed screens. | Installed and operated through Omni by Enterprise DNA. One setup fee, then a retainer. |
| [Quick start](#quick-start) | [Get your version built](https://enterprisedna.co/omni/book/?offer=replace-software&utm_campaign=goldfynch&utm_medium=customise) | [Book a call](https://enterprisedna.co/omni/book/?offer=replace-software&utm_campaign=goldfynch&utm_medium=managed) |

## The weekly discovery meeting

Five rituals: reconcile the register, assign outstanding reviews, check privilege and family gaps, examine adverse documents, and draft the lawyer's schedule. The fictional Harbour Supply and Coastal lease disputes include a privileged attachment, duplicate agreement, missing parent and overdue review.

## Quick start

Node 20 or later. The same commands run on Windows and Linux:

```bash
git clone https://github.com/Enterprise-DNA-OS/discovery-review-for-claude-code.git
cd discovery-review-for-claude-code
npm install
npm run demo
npm test
node scripts/discovery.mjs weekly-review
npm run view
npm run docs
```

Open this folder in Claude Code, Codex, OpenCode or Cursor. There are 30 CLI commands and 31 recurring slash recipes including /customise and /new-view. [CLI reference](docs/cli.md).

PGlite stores local records under .data/db. DATABASE_URL selects Postgres with verified TLS. Use a fresh DATA_DIR and npm run migrate without seed for business data. Embedded mode is for one trusted operator; a shared installation needs authenticated users, restricted roles, case isolation and backups. The supplied tables have row-level security enabled with no public grants. The database owner can still read and change records. An actor is attribution, not authentication. Protect exports and generated documents as confidential working papers.

## Evidence rules

Source rows are preserved as received. Import matches matter plus GF ID; changed rows increment the document revision, clear previously attached text and make earlier decisions stale. A repeated identical row does not reset a review. A missing row is never deleted. Full import batches are transactional, including the import ledger. --dry-run rolls back all changes.

A reviewer supplies a disposition, reason and name. Source tags do not decide privilege. Draft schedules include only current disclose decisions, known custodians, no protected or redacted source flags, no missing parent and no unresolved or privileged member of the recorded family. This is a conservative internal filter, not a legal conclusion. A lawyer must inspect source documents and confirm scope, family completeness, confidentiality and privilege before any service. MD5 groups possible duplicates; it does not prove authenticity. Search covers filenames and explicitly supplied text only. Dates are entered explicitly; raw vendor dates remain in the preserved source row until normalized.

This free base does not process native office files, OCR scans, draw redactions, certify legal compliance, send documents or produce a court-ready bundle. GoldFynch provides those broader processing and review facilities. Enterprise DNA scopes additional processing, storage and screens for your version. Keep source files and the incumbent available until reconciliation and lawyer review finish.

## Ten questions beyond a fixed report

GoldFynch already supports search and reporting. These demonstrate the queries shipped here; they do not claim that its product cannot answer them.

1. Which reviewed document is held because its attachment is privileged? disclosure-readiness
2. Which records changed after the last review? review-queue
3. Which duplicate copies have different custodians? duplicates
4. Which imported attachment has no parent? family-gaps
5. Which adverse documents remain held from the schedule? adverse-documents
6. Who has overdue reviews without an assigned owner? attention
7. Which matter needs its retention purpose reviewed while under legal hold? compliance
8. What did a corrected source record replace? history
9. Which import supplied these records? imports
10. What evidence mentions damaged deliveries? search damaged

## Your first hour: ten things to ask for

1. Put our name, logo and colours on the internal review pack.
2. Find the overdue reviews.
3. Show the family with a privileged attachment.
4. Compare duplicate documents and custodians.
5. Check our export without saving it.
6. Import into a fresh matter.
7. Reconcile every source id and row count.
8. Draft a schedule for the lawyer to check.
9. Add our disclosure category with /customise.
10. Add our weekly custodian view with /new-view.

## Working papers

brand.json controls the business name, logo and colours. npm run docs creates internal review packs, privilege logs and candidate discovery schedules. npm run view creates the review desk and evidence quality report as read-only HTML. All drafts stay local. [Record checks and their sources](docs/compliance.md). [Why no front end](docs/why-no-front-end.md).

## Move from GoldFynch

[The replacement guide](docs/replace-goldfynch.md) covers a one-command import of the file-list report saved as UTF-8 CSV. It moves the register, not the full account. [Selection research](docs/research.md) distinguishes published pricing from observed invoices.

MIT licence. Not affiliated with GoldFynch or Anthropic. Database hosting and agent usage have separate costs. [Book 30 minutes with Sam](https://enterprisedna.co/omni/book/?offer=replace-software&utm_campaign=goldfynch&utm_medium=readme).
