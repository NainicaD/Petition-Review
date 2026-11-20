/* "Check a PDF": reads a PDF in the browser with pdf.js (nothing is uploaded).
   1. A worksheet from this tool: the answers are stored in its metadata, so the check is exact.
   2. A typed copy of the official PO-0100 (e.g. the Word form saved as PDF): the text is
      matched against the form's printed wording. Checkbox lines count as marked when an
      X/check mark appears just before the option text. Anything that can't be read is set
      to UNKNOWN, so it is reported as "couldn't confirm" rather than as passing or failing.
   Scanned or handwritten forms have no text layer and can't be read. */
window.PR = window.PR || {};
PR.UNKNOWN = "[not read]";

PR.parsePetitionText = function (lines) {
  const U = PR.UNKNOWN, S = PR.blank(), notes = [];
  // Drop the form's running header/footer (form number, revision, page number) so it can't leak into answers.
  lines = lines.filter(l => !/^OJA-PO-01\d\d\s+Approved/i.test(l.trim()) && !/^Rev\.\s*by\s/i.test(l.trim()) && !/^\d{1,2}$/.test(l.trim()))
    .map(l => l.replace(/OJA-PO-01\d\d\s+Approved\s+\d\d\/\d\d/i, "").replace(/Rev\.\s*by\s*OJA\.?\s*\d\d\/\d{4}/i, "").trim()).filter(Boolean);
  const norm = s => s.toLowerCase().replace(/[‘’]/g, "'").replace(/\s+/g, " ").trim();
  const NL = lines.map(norm);
  const clean = s => String(s || "").replace(/_+/g, " ").replace(/[\s)(;,]+$/g, "").replace(/^[\s)(:;,]+/g, "").replace(/\s+/g, " ").trim();
  const letters = s => /[a-z0-9]{2,}/i.test(clean(s));
  function find(label, from = 0, nth = 1) {
    const l = norm(label);
    for (let i = from; i < NL.length; i++) if (NL[i].includes(l) && --nth === 0) return i;
    return -1;
  }
  function marked(label, nth = 1, from = 0) {
    const i = find(label, from, nth); if (i < 0) return null;
    const pre = NL[i].slice(0, NL[i].indexOf(norm(label))).replace(/\b[a-d]\.\s*/g, "").slice(-12);
    return /[x✓✔☒■●√]/i.test(pre);
  }
  function after(label, nth = 1) { const i = find(label, 0, nth); if (i < 0) return null; const l = NL[i], p = l.indexOf(norm(label)) + norm(label).length; return clean(lines[i].slice(lines[i].length - (l.length - p))); }
  function block(startLabel, endLabels, nth = 1) {
    const s = find(startLabel, 0, nth); if (s < 0) return null;
    let e = NL.length;
    for (const el of endLabels) { const j = find(el, s + 1); if (j > s && j < e) e = j; }
    const first = after(startLabel, nth) || "";
    return [first, ...lines.slice(s + 1, e)].map(clean).filter(x => letters(x)).join("\n");
  }
  const val = v => (v === null ? U : v);
  const mk = (label, nth, from) => { const m = marked(label, nth, from); if (m === null) notes.push(`Couldn't find "${label}".`); return m === null ? false : m; };

  // Caption
  { const i = find("COUNTY OF"); S.caption.county = i < 0 ? U : clean(lines[i].replace(/.*COUNTY OF/i, "").replace(/\).*/, "")); }
  { const t = lines.join(" "); const m = t.match(/IN THE\s+(.*?)\s*COURT/i); S.caption.court = m ? clean(m[1]) : U; }
  { const i = find("Petitioner (Your Name)"); S.caption.petitioner = i > 0 ? clean(lines[i - 1]) : U; }
  { const i = find("Respondent (Person to be Restrained)"); S.caption.respondent = i > 0 ? clean(lines[i - 1].replace(/\bvs\.?/i, "")) : U; }

  // ¶1
  S.p1.dv = mk("I am or have been a victim of domestic or family violence");
  S.p1.sex = mk("I am or have been a victim of a sex offense");
  S.p1.stalking = mk("I am or have been a victim of stalking");
  S.p1.harass = mk("I am or have been a victim of repeated acts of harassment");

  // ¶2
  const p2labels = {
    spouse: "the Respondent is my spouse", formerSpouse: "the Respondent used to be my spouse", livedIntimate: "resided together in an intimate relationship",
    child: "have a child in common", dating: "are dating, or have dated", sexual: "engaged in a sexual", blood: "related by blood or adoption",
    marriage: "used to be, related by marriage", guardian: "used to be, my guardian", ward: "used to be, my ward", custodian: "used to be, my custodian",
    foster: "used to be, my foster parent", minorChild: "I am a minor child of a person", adopted: "I have adopted the child of the respondent", offender: "I am the victim of a sex or violent offense"
  };
  const fam = Object.entries(p2labels).filter(([, l]) => marked(l)).map(([k]) => k);
  const nf = [["stalking", "the Respondent has committed stalking against me"], ["sex", "the Respondent has committed a sex offense against me"], ["harass", "the Respondent has committed repeated acts of harassment"]].filter(([, l]) => marked(l)).map(([k]) => k);
  if (fam.length > 1) notes.push("More than one line is marked in paragraph 2a; the form says to check only the one that best applies.");
  S.p2.family = fam[0] || (nf.length ? "none" : "");
  S.p2.nonFamily = nf[0] || "";
  { const b = find("related by blood or adoption"); const j = b < 0 ? -1 : find("Respondent is my", b); S.p2.bloodRel = j < 0 ? U : clean(lines[j].replace(/.*Respondent is my/i, "")); }
  { const b = find("used to be, related by marriage"); const j = b < 0 ? -1 : find("Respondent is my", b); S.p2.marriageRel = j < 0 ? U : clean(lines[j].replace(/.*Respondent is my/i, "")); }
  if (S.p2.family === "offender") {
    const i = find("I am the victim of a sex or violent offense"); const t = lines.slice(i, i + 4).join(" ");
    const g = re => { const m = t.match(re); return m && letters(m[1]) ? clean(m[1]) : ""; };
    S.p2.offCause = g(/cause number\s*(.*?)\s*of the/i); S.p2.offCourt = g(/of the\s*(.*?)\s*Court in the state/i);
    S.p2.offState = g(/state of\s*(.*?)\s*\./i); S.p2.offDate = g(/conviction was\s*(.*?)\s*\./i);
  }

  // ¶3–6
  { const t = lines.join(" "); const m = t.match(/How old is the Respondent\?\s*(.*?)\s*years old/i); S.p3.age = m ? clean(m[1]) : U; }
  { const b = block("County & State", ["Continued on Attachment 4a", "If you and Respondent attend"]);
    if (b === null) { S.p4.cases = [{ name: U, number: U, where: U }]; }
    else if (/^\s*none\b/i.test(b)) S.p4.noCases = true;
    else S.p4.cases = b.split("\n").filter(Boolean).map(l => ({ name: l, number: U, where: U })); }
  { const b = block("school corporation.", ["This case is filed in this county"]); S.p4.school = b || ""; }
  S.p5.respLives = mk("the Respondent lives in this county");
  S.p5.happened = mk("the incident(s) of domestic or family violence, stalking, sex");
  S.p5.iLive = mk("I live in this county");
  { const b = block("fill in your public mailing address", ["This address will not be kept secret"]);
    S.p6.attorney = "no"; S.p6.address = b === null ? U : b; if (b === "") notes.push("Paragraph 6 is blank. That's fine only if you have an attorney."); }

  // ¶7
  const p7labels = { attempted: "attempted to cause physical harm to me", threatened: "threatened to cause physical harm to me", caused: "did cause physical harm to me",
    fear: "placed me in fear of physical harm", sexual: "involuntarily engage in sexual activity", stalking: "the Respondent committed stalking against me",
    sexOffense: "the Respondent committed a sex offense against me", animal: "committed an act of animal cruelty", harass: "the Respondent committed repeated acts of harassment" };
  for (const [k, l] of Object.entries(p7labels)) S.p7[k] = mk(l);

  // ¶8
  S.p8 = [];
  for (let k = 1; k <= 3; k++) {
    const date = (() => { const i = find(`Date of Incident #${k}:`); return i < 0 ? null : clean(lines[i].replace(new RegExp(`.*Date of Incident #${k}:`, "i"), "")); })();
    const place = after("Place of Incident:", k);
    const desc = block("Description of Incident:", ["List the names of all of the people"], k);
    const people = block("include your own name if you were present", [`Date of Incident #${k + 1}`, "Continued on Attachment 8a", "I am asking the Court to order"], k);
    const inc = { date: val(date), place: val(place), desc: val(desc), people: val(people), present: U };
    if (k === 1 || [date, place, desc, people].some(v => v && letters(v))) S.p8.push(inc);
  }
  if (marked("Continued on Attachment 8a")) notes.push("Incidents continue on Attachment 8a, which wasn't checked.");

  // ¶9
  const R = {
    protectMe: ["Prohibit the Respondent from committing, or threatening to commit, acts of", 1], protectHousehold: ["Prohibit the Respondent from committing, or threatening to commit, acts of", 2],
    tracking: ["from using a tracking device", 1], noContact: ["Prohibit the Respondent from harassing, annoying", 1], stayAway: ["Order the Respondent to stay away from my residence", 1],
    indefinite: ["Order that this Order of Protection be effective indefinitely", 1], stayAwayFamily: ["Order the Respondent to stay away from the following location", 1],
    evict: ["Evict the Respondent from my residence", 1], possession: ["Order the Respondent to give me the possession and use", 1],
    possResidence: ["The residence located at:", 1], possVehicle: ["An automobile/other motor vehicle", 1], possItems: ["Other necessary personal items, described as", 1],
    animalsProtect: ["Prohibit Respondent from removing, transferring", 1], animalsCustody: ["Order that I will have the exclusive possession", 1],
    additional: ["Order the following additional relief", 1], parentArrange: ["Specify the arrangements for parenting time", 1],
    parentSupervised: ["Require that parenting time be supervised", 1], parentDeny: ["Deny the Respondent parenting time", 1], attorneyFees: ["Order the Respondent to pay my attorney fees", 1],
    rent: ["Order the Respondent to pay rent", 1], mortgage: ["Order the Respondent to make payment on a mortgage", 1], childSupport: ["Order the Respondent to pay child support", 1],
    maintenance: ["Order the Respondent to pay support/maintenance", 1], reimburse: ["Order the Respondent to reimburse me", 1],
    rMedical: ["Medical expenses:", 1], rCounseling: ["Counseling:", 1], rShelter: ["Shelter:", 1], rRepair: ["Repair or replacement of", 1], rOther: ["Other costs or fees I have", 1],
    firearmsProhibit: ["Prohibit the Respondent from using or possessing a firearm", 1], firearmsSurrender: ["Order the Respondent to surrender the following firearm", 1],
    wireless: ["Order a wireless service provider to transfer", 1]
  };
  for (const [k, [l, n]] of Object.entries(R)) S.p9[k] = mk(l, n);
  { const b = block("household members, whose names are:", ["from using a tracking device"]); S.p9.householdNames = b === null ? U : b; }
  { const b = block("all owners or lease signers at my residence", ["NOTE: The following requested relief may be granted immediately by the Judge, but"]); S.p9.owners = b === null ? U : b; }
  // Details of each relief item aren't parsed: mark them unknown so they are reported as "check by hand".
  ["stayAwayType", "stayAwayLocation", "familyLocations", "evictAddress", "possResidenceAddr", "possVehicleDesc", "possItemsDesc", "additionalText", "firearmsItems",
    "rMedicalAmt", "rCounselingAmt", "rShelterAmt", "rRepairAmt", "rOtherAmt"].forEach(k => { S.p9[k] = U; });
  S.p9.animalsProtectList = [{ name: U, ageType: U, sizeBreed: U, color: U }]; S.p9.animalsCustodyList = [{ name: U, ageType: U, sizeBreed: U, color: U }];
  S.p9.phones = [{ number: U, provider: U, holder: U }];

  // ¶10, affirmation, signature
  { const v = after("Number of pages attached:"); S.p10.pages = v === null ? U : v; }
  S.aff.a = mk("on the basis of my own personal knowledge");
  S.aff.b = mk("on the basis that I have been informed and believe");
  S.aff.affidavits = U;
  { const i = find("DATE:"); S.sign.date = i < 0 ? U : clean(lines[i].replace(/.*DATE:/i, "")); }
  { const i = find("PETITIONER (Type or print name)"); S.sign.name = i > 0 ? clean(lines[i - 1]) : U; }

  // The Confidential Form is a separate document: mark it unknown.
  Object.keys(S.conf).forEach(k => { if (typeof S.conf[k] === "string") S.conf[k] = U; });
  return { state: S, notes };
};

/* Group pdf.js text items into lines (by y position), page by page. */
async function pdfLines(pdf) {
  const out = [];
  for (let p = 1; p <= pdf.numPages; p++) {
    const tc = await (await pdf.getPage(p)).getTextContent();
    const rows = [];
    tc.items.forEach(it => {
      if (!it.str) return;
      const y = it.transform[5], x = it.transform[4];
      let r = rows.find(r => Math.abs(r.y - y) < 3); if (!r) rows.push(r = { y, parts: [] });
      r.parts.push({ x, s: it.str });
    });
    rows.sort((a, b) => b.y - a.y).forEach(r => out.push(r.parts.sort((a, b) => a.x - b.x).map(q => q.s).join(" ").replace(/\s+/g, " ").trim()));
  }
  return out.filter(Boolean);
}
PR.pdfLines = pdfLines;

PR.analyzePdf = async function (data) {
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  const meta = await pdf.getMetadata().catch(() => ({}));
  const kw = meta?.info?.Keywords || "";
  if (kw.startsWith(PR.WS_TAG)) {
    const state = PR.decodeState(kw);
    return { kind: "worksheet", state, issues: PR.check(state), notes: [] };
  }
  const lines = await pdfLines(pdf);
  const text = lines.join(" ");
  if (text.replace(/\s/g, "").length < 200) return { kind: "noText" };
  if (/OJA-PO-0101/.test(text)) return { kind: "child" };
  if (!/OJA-PO-0100/.test(text) && !/PETITION FOR AN ORDER FOR PROTECTION/i.test(text)) return { kind: "unknown" };
  const rev = (text.match(/Rev\.\s*by\s*OJA\.?\s*(\d{2}\/\d{4})/i) || [])[1] || null;
  const { state, notes } = PR.parsePetitionText(lines);
  const U = PR.UNKNOWN;
  const issues = PR.check(state).filter(i => i.page !== "confidential");
  // Fields we couldn't read are UNKNOWN (so the checks above skip them); list them as "check by hand".
  const hand = (page, msg, src) => issues.push({ page, level: "unknown", msg, src });
  const s = state;
  [["caption.county", "County"], ["caption.court", "Court name"], ["caption.petitioner", "Petitioner name"], ["caption.respondent", "Respondent name"]]
    .forEach(([p, l]) => { if (p.split(".").reduce((o, k) => o[k], s) === U) hand("caption", `${l} (caption)`, "PO-0100 caption"); });
  if (s.p2.family === "blood" && s.p2.bloodRel === U) hand("relationship", "How you are related by blood or adoption", "PO-0100 ¶2a");
  if (s.p2.family === "marriage" && s.p2.marriageRel === U) hand("relationship", "How you are related by marriage", "PO-0100 ¶2a");
  if (s.p3.age === U) hand("respondent", "Respondent's age", "PO-0100 ¶3");
  if (s.p4.cases.some(c => c.number === U)) hand("respondent", "Each case's name, number, and county & state are filled in", "PO-0100 ¶4");
  if (s.p6.address === U) hand("venue", "Public mailing address", "PO-0100 ¶6");
  s.p8.forEach((x, i) => ["date", "place", "desc", "people"].forEach(f => { if (x[f] === U) hand("incidents", `Incident ${i + 1}: ${{ date: "date", place: "place", desc: "description", people: "people present" }[f]}`, "PO-0100 ¶8"); }));
  hand("incidents", "If you were present at an incident, your own name is in its list of people present", "PO-0100 ¶8");
  if (s.p9.protectHousehold && s.p9.householdNames === U) hand("relief", "Names of protected family or household members", "PO-0100 ¶9");
  if (s.p9.owners === U) hand("relief", "Owners or lease signers at your residence", "PO-0100 ¶9");
  if ([...PR.P9_G1, ...PR.P9_G2, ...PR.P9_G3].some(([k]) => s.p9[k])) hand("relief", "The details under each relief item you checked (places, addresses, descriptions, animals, amounts, firearms, telephone numbers)", "PO-0100 ¶9");
  if (s.p10.pages === U) hand("signing", "Number of pages attached", "PO-0100 ¶10");
  if (s.aff.b && !s.aff.a) hand("signing", "Affidavits from people with personal knowledge are attached (required when the petition is based only on information and belief)", "PO-0100 affirmation note");
  if (s.sign.date === U) hand("signing", "Date", "PO-0100 signature");
  if (s.sign.name === U) hand("signing", "Printed name", "PO-0100 signature");
  hand("signing", "The petition is signed by hand", "PO-0102 step 5h");
  const anyMark = [s.p1, s.p5, s.p7].some(o => Object.values(o).some(v => v === true)) || s.p2.family;
  return { kind: "official", rev, state, issues, notes, blank: !anyMark };
};

PR.initUpload = function () {
  const input = document.getElementById("pdf"), out = document.getElementById("pdf-result");
  if (!input || input._wired) return; input._wired = true;
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const L = { required: "Required", recommended: "Recommended", info: "Good to know" };
  input.addEventListener("change", async () => {
    const f = input.files[0]; if (!f) return;
    out.innerHTML = `<p>Reading ${esc(f.name)}…</p>`;
    try {
      if (!window.pdfjsLib) throw new Error("The PDF reader didn't load. Check your internet connection and reload the page.");
      pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      const r = await PR.analyzePdf(new Uint8Array(await f.arrayBuffer()));
      const msg = {
        noText: "This PDF has no readable text. It is probably a scan or a photo of a handwritten form, which this tool can't read. Check it page by page using \"Fill in the form\" instead.",
        child: "This is form PO-0101 (petition filed on behalf of a child). This tool only checks PO-0100 (filed by the person seeking protection).",
        unknown: "This doesn't look like the Indiana protection order petition (PO-0100) or a worksheet from this tool."
      }[r.kind];
      if (msg) { out.innerHTML = `<div class="callout">${msg}</div>`; return; }
      const U = PR.UNKNOWN;
      const issues = r.issues.slice();
      const order = { required: 0, recommended: 1, unknown: 2, info: 3 };
      issues.sort((a, b) => order[a.level] - order[b.level]);
      const head = r.kind === "worksheet"
        ? `<div class="callout ok"><b>Worksheet from this tool.</b> The answers were read exactly. You can load them into the form to keep editing.</div>
           <div class="actions"><button class="btn primary" type="button" id="load-ws">Load these answers into the form</button></div>`
        : `<div class="callout"><b>Official petition PO-0100${r.rev ? `, revision ${esc(r.rev)}` : ""}.</b> Read from the PDF's text, so this check is approximate. Anything it couldn't read is listed as "Check by hand". It can't read the details under each kind of relief, the Confidential Form, or attachments.</div>` +
          (r.rev && r.rev !== PR.FORM_REVISION ? `<div class="callout warn">This form's revision (${esc(r.rev)}) is not the one this tool was built against (${PR.FORM_REVISION}). Check the <a href="${PR.SOURCES.forms}" target="_blank" rel="noopener">forms page</a> for the current version.</div>` : "") +
          (r.blank ? `<div class="callout warn">No checked boxes were found. This may be a blank form, or the marks may not be readable (for example if they were drawn rather than typed).</div>` : "");
      const LV = { ...L, unknown: "Check by hand" };
      out.innerHTML = head +
        `<h3>Results</h3><ul class="issues">${issues.length ? issues.map(i => `<li class="issue ${i.level}"><span class="lvl">${LV[i.level]}</span> ${esc(i.msg.replaceAll(U, "(couldn't read)"))} <span class="src">${esc(i.src)}</span></li>`).join("") : "<li>No issues found.</li>"}</ul>` +
        (r.notes.length ? `<h3>Notes from reading the PDF</h3><ul>${r.notes.map(n => `<li>${esc(n)}</li>`).join("")}</ul>` : "") +
        (r.kind === "official" ? `<p class="fine">Not checked from this PDF: details under each relief item, the Confidential Form (PO-0104), affidavits and attachments.</p>` : "");
      const lb = document.getElementById("load-ws");
      if (lb) lb.onclick = () => { PR.setState(r.state); PR.render("review"); };
    } catch (e) {
      out.innerHTML = `<div class="callout warn">Couldn't read this PDF: ${esc(e.message)}</div>`;
    }
  });
};
