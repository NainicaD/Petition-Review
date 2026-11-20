# Petition Review Flags

A prototype for Indiana's Protection Order E-filing Service.

## Try it

**Live page: https://nainicad.github.io/Petition-Review/**

Opens in any browser; no account or install needed. The form uses made-up example answers, and nothing you type is saved or sent anywhere.

What to try:
1. **For petitioners** tab: go through the four pages with **Next** and **Back**, or click a step in the bar at the top.
2. On page 2, clear the date or add another incident, then check the notes on page 4.
3. On page 4, open a **Why?** note, use an **Edit** link, then select **Sign and file**.
4. **For court staff** tab: your petition appears at the end of the queue. Select a row to see the details.
5. Use the **Dark mode / Light mode** button at the top right to switch themes.

To run it locally instead, download or clone this repository and open `index.html` in a browser.

## What it does

- **Petitioner side:** four pages (why you are filing, what happened, safety questions, review and sign). Each page says what it is for and has "How to fill in this page" instructions beside the fields. The review page shows neutral notes (missing dates or places, single-incident stalking petitions, possible confidential info in public fields) and links back to each page to edit. Filing is never blocked.
- **Court staff queue:** petitions listed in the order received, with petitioner-reported safety flags and completeness flags. No scoring or ranking.
- Each incident can list photos or files; in this prototype only the file names are kept and nothing is uploaded.
- Light mode is the default, with a dark mode button at the top of the page.

Prototype only; not an official court site and not legal advice.
