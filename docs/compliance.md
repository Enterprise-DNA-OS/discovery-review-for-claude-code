# Record checks, not a legal certification

Sources checked 25 October 2026. The supplied checks support a New Zealand legal team's record review. Australian matters need their own court rules and lawyer-approved configuration. No automated command decides privilege or serves a document.

## Disclosure and adverse documents

The [Ministry of Justice disclosure guidance](https://www.justice.govt.nz/courts/going-to-court/without-a-lawyer/representing-yourself-civil-high-court/disclosure/) distinguishes the process for ordinary proceedings filed after 1 January 2026. It describes relevant and adverse records, privilege or confidentiality claims and documents outside a party's control. A lawyer checks the applicable rules and orders; the software does not generate or swear the required affidavit.

review-queue finds absent or superseded decisions. adverse-documents lists the reviewer's adverse classifications. privilege-log keeps the reason and reviewer. family-gaps flags an absent parent. The draft schedule holds a recorded family if any member has an unresolved or privileged decision. This family policy is our conservative workflow control, not a court rule. An incomplete export can hide missing evidence and is not detected from row counts alone.

## Privacy purpose and disclosure

[NZ Privacy Principle 11](https://www.privacy.org.nz/privacy-principles/11/) limits disclosure and describes exceptions. The operator records a matter purpose and obtains the firm's authority before using any external service. Our compliance command flags a missing purpose. It does not determine a lawful exception or authorize disclosure. Source tags and redaction flags cannot establish a safe copy; protected and redacted sources are held for separate inspection.

## Retention and legal holds

[NZ Privacy Principle 9](https://www.privacy.org.nz/privacy-principles/9/) concerns keeping information only as long as a lawful purpose requires. The retention_review field is a review date set by the firm, not a statutory expiry. compliance flags missing or past dates. Legal holds are recorded and the CLI never deletes records. Resolve preservation duties with the lawyer before any disposal outside this tool.

## Evidence and access controls

Document revisions bind decisions to the record reviewed. Source changes invalidate earlier reviews; history retains before and after records. MD5 groups candidates for duplicate inspection only. SHA-256 identifies imported files and supplied text. Neither proves chain of custody. Retain originals, access logs and verified backups. Actor fields do not authenticate people. Generated privilege logs and review packs are internal confidential working papers; inspect them before any sharing.
