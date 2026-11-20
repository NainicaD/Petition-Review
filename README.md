# Protection Order Petition: Practice and Completeness Check

A practice tool for Indiana's **Petition for an Order for Protection** (form PO-0100) and **Confidential Form** (PO-0104). People can fill in every field page by page, or check a PDF of their petition, to see whether the fields the official form and instructions ask for are complete and consistent.

## Try it

**Live page: https://nainicad.github.io/Petition-Review/**

The page opens in any browser, with no account or install. Everything you type stays in your browser tab and is never saved or sent anywhere. A **Quick exit** button leaves the site immediately.

Two ways to use it:
1. **Fill in the form.** Ten pages follow PO-0100 paragraph by paragraph (¶1–¶10, the affirmation and signature), then the Confidential Form. Each page has "How to fill in this page" instructions taken from the official instructions (PO-0102), and live checks. At the end you can download a **worksheet PDF** to copy onto the official forms or into the e-filing service.
2. **Check a PDF.** Choose a typed PDF of the official PO-0100 (for example, the Word form filled in on a computer and saved as PDF) or a worksheet from this tool. The file is read in the browser with pdf.js and never uploaded.

To run it locally, clone the repository and open `index.html`. The PDF features load jsPDF and pdf.js from cdnjs, so they need an internet connection.

## What it is, and what it is not

- It is a **completeness check**: are the fields filled in, and do the answers line up (for example, domestic violence requires a family or household relationship in ¶2, stalking means two or more incidents, and a petition based only on information and belief needs affidavits).
- It is **not legal advice** and cannot say whether a petition is legally sufficient. Only the judge decides that (PO-0102 p.7).
- The worksheet is **not a court form**. Indiana requires the official forms (IC 34-26-5-3; Protection Order Deskbook). Copy the answers onto the current PO-0100 and PO-0104 from the [forms page](https://www.in.gov/courts/iocs/publications/po-forms/), or use the [Protection Order E-filing Service](https://public.courts.in.gov/porefsp#/).
- The tool never asks for Social Security numbers; it tells you to write them on the paper form.

Each check is labeled by how strong the source's requirement is:
- **Required:** the form or the official instructions say it must be filled in or done.
- **Recommended:** the instructions advise it, or two answers don't line up.
- **Good to know:** hearings, attachments and privacy.
- **Check by hand:** only in the PDF check, for parts that couldn't be read.

## Sources

| Document | Revision | Used for |
|---|---|---|
| [PO-0100 Petition](https://www.in.gov/courts/iocs/files/center-bb-po-form-po-0100.pdf) | 07/2026 | Every field and its wording |
| [PO-0102 Instructions](https://www.in.gov/courts/iocs/files/center-bb-po-form-po-0102.pdf) | 05/2025 | Definitions, what must be filled in, hearings, filing checklist |
| [PO-0104 Confidential Form](https://www.in.gov/courts/iocs/files/center-bb-po-form-po-0104.pdf) | 07/2019 | Confidential Form fields |
| [Protection Order Deskbook](https://www.in.gov/courts/iocs/files/center-bb-po-deskbook.pdf) | current at time of writing | Mandatory forms, e-filing, venue, what clerks may not reject |

The official forms change. When PO-0100 is revised, update `assets/data.js` (labels and `FORM_REVISION`) and the matching text labels in `assets/pdfcheck.js`. The PDF check warns when it reads a revision different from `FORM_REVISION`.

## Limits of the PDF check

- It reads text, so scanned or handwritten forms can't be checked.
- On the official form, a checkbox counts as marked when an X or check mark is typed just before the option text.
- It does not read the details under each relief item, the Confidential Form, attachments or affidavits; it lists these as "Check by hand".
- A worksheet downloaded from this tool stores its answers inside the PDF, so it is checked exactly and can be loaded back into the form.

## Files

- `index.html`: page shell
- `assets/data.js`: form fields and official wording
- `assets/rules.js`: the checks, each with its source
- `assets/app.js`: pages and navigation
- `assets/worksheet.js`: worksheet PDF (jsPDF)
- `assets/pdfcheck.js`: PDF reader (pdf.js)
- `assets/style.css`: styles
- `tests/rules-test.html`: open it in a browser; every line should say PASS

Prototype only; not an official court site and not legal advice.
