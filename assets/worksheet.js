/* Builds the downloadable practice worksheet with jsPDF (in the browser).
   It is NOT a court form: it lists the answers in PO-0100 / PO-0104 order so they can be
   copied onto the official forms or into the e-filing service. The answers are also
   stored in the PDF's metadata (keywords "POWS1:<base64 JSON>") so the "Check a PDF"
   page can re-check a worksheet exactly. */
window.PR = window.PR || {};

PR.WS_TAG = "POWS1:";
PR.encodeState = s => PR.WS_TAG + btoa(unescape(encodeURIComponent(JSON.stringify(s))));
PR.decodeState = k => JSON.parse(decodeURIComponent(escape(atob(k.slice(PR.WS_TAG.length)))));

PR.downloadWorksheet = function (S, issues, opts = {}) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const W = doc.internal.pageSize.getWidth(), H = doc.internal.pageSize.getHeight(), M = 54;
  let y = M;
  const has = v => v != null && String(v).trim() !== "";
  const X = b => (b ? "[X]" : "[  ]");
  // jsPDF's built-in fonts only cover Latin-1; replace anything else so the PDF stays readable.
  const clean = t => String(t ?? "").replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\xFF—–]/g, "?");

  function need(h) { if (y + h > H - M) { doc.addPage(); y = M; } }
  function text(t, o = {}) {
    doc.setFont("helvetica", o.bold ? "bold" : "normal"); doc.setFontSize(o.size || 10.5);
    const lines = doc.splitTextToSize(clean(t), W - 2 * M - (o.indent || 0));
    lines.forEach(l => { need(15); doc.text(l, M + (o.indent || 0), y); y += (o.size || 10.5) * 1.35; });
  }
  const h1 = t => { y += 6; need(30); text(t, { bold: true, size: 14 }); y += 2; };
  const h2 = t => { y += 4; need(24); text(t, { bold: true, size: 11.5 }); };
  const kv = (k, v) => text(`${k}: ${has(v) ? v : "(blank)"}`, { indent: 10 });
  const item = (t, ind = 10) => text(t, { indent: ind });

  // Title and notice
  text("PRACTICE WORKSHEET - NOT A COURT FORM", { bold: true, size: 16 });
  text("Indiana Petition for an Order for Protection (PO-0100) and Confidential Form (PO-0104)", { size: 11 });
  y += 4;
  text("Do not file this worksheet. Indiana requires the official forms (IC 34-26-5-3). Copy these answers onto the current official PO-0100 and PO-0104 from " + PR.SOURCES.forms + " or enter them in the Protection Order E-filing Service: " + PR.SOURCES.efile, { size: 9.5 });
  text(`Prepared ${new Date().toLocaleDateString()} against PO-0100 revision ${PR.FORM_REVISION}. Completeness check only; not legal advice.`, { size: 9.5 });

  // PO-0100
  h1("PETITION (PO-0100) - this is a PUBLIC document");
  h2("Caption");
  kv("County", S.caption.county); kv("Court", S.caption.court); if (has(S.caption.division)) kv("Division / room", S.caption.division);
  kv("Petitioner", S.caption.petitioner); kv("Respondent", S.caption.respondent);

  h2("1. I am filing this Petition for myself");
  PR.P1.forEach(([k, l]) => item(`${X(S.p1[k])} ${l}`));

  h2("2. The Respondent's relationship to me");
  const fam = PR.P2A.find(([k]) => k === S.p2.family);
  if (fam) {
    item(`[X] 2a. ${fam[1]}`);
    if (S.p2.family === "blood") kv("The Respondent is my", S.p2.bloodRel);
    if (S.p2.family === "marriage") kv("The Respondent is my", S.p2.marriageRel);
    if (S.p2.family === "offender") { kv("Cause number", S.p2.offCause); kv("Court", S.p2.offCourt); kv("State", S.p2.offState); kv("Date of conviction", S.p2.offDate); }
  } else if (S.p2.family === "none") {
    item("Not a family or household member.");
    const nf = PR.P2B.find(([k]) => k === S.p2.nonFamily); item(nf ? `[X] ${nf[1]}` : "(2b/2c/2d not chosen)");
  } else item("(not answered)");

  h2("3. Respondent's age"); kv("Years old", S.p3.age);
  h2("4. Other cases");
  const cases = S.p4.cases.filter(c => has(c.name) || has(c.number) || has(c.where));
  if (S.p4.noCases) item("None"); else if (!cases.length) item("(blank)");
  cases.forEach((c, i) => item(`${i + 1}. ${c.name || "-"} | Case no. ${c.number || "-"} | ${c.where || "-"}${i >= 5 ? "  (Attachment 4a)" : ""}`));
  if (has(S.p4.school)) kv("Same school / school corporation", S.p4.school);

  h2("5. This case is filed in this county because");
  PR.P5.forEach(([k, l]) => item(`${X(S.p5[k])} ${l}`));
  h2("6. Public mailing address");
  item(S.p6.attorney === "yes" ? "Represented by an attorney." : (has(S.p6.address) ? S.p6.address : "(blank)"));

  h2("7. Acts committed by the Respondent");
  PR.P7.forEach(([k, l]) => { if (S.p7[k]) item(`[X] ${l}`); });
  if (!PR.P7.some(([k]) => S.p7[k])) item("(none checked)");

  h2("8. Incidents");
  S.p8.forEach((x, i) => {
    y += 2; text(`Incident #${i + 1}${i >= 3 ? " (Attachment 8a)" : ""}`, { bold: true, indent: 10 });
    kv("Date of Incident", x.date); kv("Place of Incident", x.place);
    text("Description of Incident:", { indent: 10 }); text(has(x.desc) ? x.desc : "(blank)", { indent: 22 });
    kv("People present", x.people);
  });

  h2("9. Relief requested");
  const reliefLines = [];
  PR.P9_G1.forEach(([k, l]) => { if (S.p9[k]) reliefLines.push(l); });
  if (S.p9.protectHousehold) reliefLines.push("   Names: " + S.p9.householdNames.split("\n").filter(Boolean).join("; "));
  if (S.p9.stayAway) reliefLines.push(`   Place: ${S.p9.stayAwayType || "-"}, located at: ${S.p9.stayAwayLocation || "-"}`);
  if (S.p9.stayAwayFamily) reliefLines.push("   Locations: " + (S.p9.familyLocations || "-"));
  PR.P9_G1.length && reliefLines.length && reliefLines.unshift("-- Without a hearing --");
  const g2 = PR.P9_G2.filter(([k]) => S.p9[k]);
  if (g2.length) {
    reliefLines.push("-- Right away, hearing within 30 days --");
    g2.forEach(([k, l]) => {
      reliefLines.push(l);
      if (k === "evict") reliefLines.push("   Residence: " + (S.p9.evictAddress || "-"));
      if (k === "possession") {
        if (S.p9.possResidence) reliefLines.push("   Residence: " + (S.p9.possResidenceAddr || "-"));
        if (S.p9.possVehicle) reliefLines.push("   Vehicle: " + (S.p9.possVehicleDesc || "-"));
        if (S.p9.possItems) reliefLines.push("   Items: " + (S.p9.possItemsDesc || "-"));
      }
      if (k === "animalsProtect" || k === "animalsCustody") (S.p9[k + "List"] || []).forEach((a, i) =>
        reliefLines.push(`   Animal ${i + 1}: ${a.name || "-"} | ${a.ageType || "-"} | ${a.sizeBreed || "-"} | ${a.color || "-"}${i >= 2 ? " (Attachment 9(a))" : ""}`));
      if (k === "additional") reliefLines.push("   " + (S.p9.additionalText || "-"));
    });
  }
  const g3 = PR.P9_G3.filter(([k]) => S.p9[k]);
  if (g3.length) {
    reliefLines.push("-- Only after notice and a hearing within 30 days --");
    g3.forEach(([k, l]) => {
      reliefLines.push(l);
      if (k === "reimburse") PR.REIMBURSE.forEach(([r, rl]) => { if (S.p9[r]) reliefLines.push(`   ${rl}: $${S.p9[r + "Amt"] || "____"}`); });
      if (k === "firearmsSurrender") S.p9.firearmsItems.split("\n").filter(Boolean).forEach((f, i) => reliefLines.push(`   ${f}${i >= PR.FIREARMS_CAPACITY ? " (Attachment 9(b))" : ""}`));
      if (k === "wireless") S.p9.phones.forEach((p, i) => reliefLines.push(`   ${p.number || "-"} | Provider: ${p.provider || "-"} | Holder: ${p.holder || "-"}${i >= 2 ? " (Attachment 9(c))" : ""}`));
    });
  }
  if (!reliefLines.length) item("(none checked)");
  reliefLines.forEach(l => item(l.startsWith("--") || l.startsWith("   ") ? l : "[X] " + l));
  kv("All owners or lease signers at my residence", S.p9.owners);

  h2("10. Number of pages attached"); kv("Pages", S.p10.pages);
  h2("Affirmation (under the penalties for perjury)");
  item(`${X(S.aff.a)} a. on the basis of my own personal knowledge`);
  item(`${X(S.aff.b)} b. on the basis that I have been informed and believe that the facts stated are true`);
  if (S.aff.b) kv("Affidavits attached", S.aff.affidavits);
  kv("Date", S.sign.date); kv("Printed name", S.sign.name);
  item("Signature: sign by hand on the official form.");

  // PO-0104
  doc.addPage(); y = M;
  text("CONFIDENTIAL - for the Confidential Form (PO-0104) only", { bold: true, size: 14 });
  text("Keep these pages separate from the public petition. The Confidential Form is seen only by law enforcement, prosecutors, and court and clerk staff. Write Social Security numbers on the paper form yourself.", { size: 9.5 });
  const c = S.conf;
  h2("Person restrained");
  kv("Name", c.rName); kv("Date of birth", c.rDob); kv("SSN known (write on form)", c.rSsnKnown); kv("Sex", c.rSex); kv("Race", c.rRace);
  kv("Hair / eyes / height / weight", [c.rHair, c.rEye, c.rHeight, c.rWeight].map(v => v || "-").join(" / "));
  kv("Scars or tattoos", c.rScars); kv("Home phone", c.rHomePhone); kv("Cell phone", c.rCellPhone); kv("Home address", c.rAddress); kv("Place of business / usually found", c.rWorkplace);
  h2("Petitioner");
  kv("Home address", c.pAddress); kv("Date of birth", c.pDob); kv("Sex", c.pSex); kv("Race", c.pRace); kv("Cell", c.pCell); kv("Email", c.pEmail);
  kv("Notifications", c.notify === "yes" ? `Yes, by ${c.method || "(method not chosen)"}` : (c.notify || "(blank)"));
  h2("Other protected parties");
  if (!c.protected.length) item("(none listed)");
  c.protected.forEach((p, i) => item(`${i + 1}. ${p.name || "-"} | Age ${p.age || "-"} | DOB ${p.dob || "-"} | ${p.sex || "-"} | ${p.race || "-"}`));
  h2("Household members who are NOT protected");
  if (!c.others.length) item("(none listed)");
  c.others.forEach((p, i) => item(`${i + 1}. ${p.name || "-"} | Age ${p.age || "-"} | ${p.race || "-"} | ${p.sex || "-"}`));

  // Results and checklist
  doc.addPage(); y = M;
  text("Completeness check results", { bold: true, size: 14 });
  text("Required = the form or official instructions say it must be filled or done. Recommended = advised by the instructions, or two answers don't line up. These checks cannot tell you whether a judge will grant an order.", { size: 9.5 });
  const L = { required: "REQUIRED", recommended: "Recommended", info: "Good to know" };
  if (!issues.length) item("No issues found.");
  issues.forEach(i => item(`- ${L[i.level]}: ${i.msg} [${i.src}]`));
  h2("Filing checklist (PO-0102 pp.8-9)");
  PR.FILING_CHECKLIST.forEach(x => item("- " + x));

  const n = doc.getNumberOfPages();
  for (let i = 1; i <= n; i++) {
    doc.setPage(i); doc.setFont("helvetica", "normal"); doc.setFontSize(8.5);
    doc.text(clean(`Practice worksheet - not a court form - page ${i} of ${n}`), M, H - 28);
  }
  doc.setProperties({ title: "Protection order petition practice worksheet", subject: "Practice worksheet - not a court form", creator: "Petition Review practice tool", keywords: PR.encodeState(S) });
  if (opts.returnBytes) return doc.output("arraybuffer"); // used by tests
  doc.save("petition-worksheet.pdf");
};
