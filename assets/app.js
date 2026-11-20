/* Petition practice check: pages, data binding and navigation.
   All data stays in this browser tab (a JS variable). Nothing is saved or sent anywhere. */
(function () {
  const $ = s => document.querySelector(s);
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  let S = PR.blank();
  let current = "start";

  /* ---------- state helpers ---------- */
  const get = p => p.split(".").reduce((o, k) => (o == null ? o : o[k]), S);
  function set(p, v) {
    const ks = p.split("."); let o = S;
    for (let i = 0; i < ks.length - 1; i++) o = o[ks[i]];
    o[ks[ks.length - 1]] = v;
  }
  PR.getState = () => S;
  PR.setState = s => { S = s; };

  /* ---------- field helpers (return HTML) ---------- */
  let uid = 0;
  const id = () => "f" + (++uid);
  function txt(path, label, hint = "", o = {}) {
    const i = id(), h = hint ? `<span class="hint" id="${i}h">${hint}</span>` : "";
    const ctl = o.area
      ? `<textarea id="${i}" data-k="${path}" ${hint ? `aria-describedby="${i}h"` : ""} rows="${o.rows || 4}"></textarea>`
      : `<input id="${i}" type="${o.type || "text"}" data-k="${path}" ${o.inputmode ? `inputmode="${o.inputmode}"` : ""} ${hint ? `aria-describedby="${i}h"` : ""} autocomplete="off">`;
    return `<div class="field ${o.cls || ""}"><label class="lbl" for="${i}">${label}${o.optional ? ' <span class="opt">(optional)</span>' : ""}</label>${h}${ctl}</div>`;
  }
  const chk = (path, label) => `<label class="check"><input type="checkbox" data-k="${path}"><span>${label}</span></label>`;
  function radios(path, opts, legend, hint = "") {
    const n = "r" + (++uid);
    return `<fieldset class="radios"><legend class="lbl">${legend}</legend>${hint ? `<span class="hint">${hint}</span>` : ""}
      ${opts.map(([v, l]) => `<label class="check"><input type="radio" name="${n}" data-k="${path}" value="${v}"><span>${l}</span></label>`).join("")}</fieldset>`;
  }
  const show = (cond, html) => `<div class="sub" data-show="${cond}">${html}</div>`;
  const list = path => `<div class="list" data-list="${path}"></div>`;
  const group = (title, note, html) => `<section class="group"><h3>${title}</h3>${note ? `<p class="note-inline">${note}</p>` : ""}${html}</section>`;

  /* ---------- pages ---------- */
  const P = PR;
  const PAGES = [
    { id: "start", nav: "Start", title: "Practice your protection order petition", body: startBody },
    { id: "caption", n: 1, nav: "Court and names", ref: "PO-0100, top of page 1", title: "Court and names",
      lead: "The top of the petition says which court you are filing in and who the case is between.",
      how: ["Fill in the county where you will file and the court's name (your county clerk can tell you which court hears protection orders).",
        "Petitioner is you. Respondent is the person you want the order against.",
        "Use the Respondent's correct full name. You cannot file without it.",
        "Only one Respondent per petition. If you need protection from more than one person, fill in a separate petition and Confidential Form for each."],
      src: "PO-0102 p.1, p.4, p.8 (steps 5a–5b)",
      body: () => txt("caption.county", "County", "The county where you will file (see page 5 for which counties you can use).") +
        txt("caption.court", "Court", "For example: Marion Superior Court. Ask the clerk if you're not sure.") +
        txt("caption.division", "Division and room", "Only if the clerk tells you one.", { optional: true }) +
        txt("caption.petitioner", "Petitioner (your name)") +
        txt("caption.respondent", "Respondent (person to be restrained)", "Full, correct name of one person.") },
    { id: "basis", n: 2, nav: "Why you are filing", ref: "PO-0100 ¶1", title: "Why you are filing",
      lead: "Paragraph 1 says what you have been a victim of. Check every one that applies.",
      how: ["Read the definitions below, then check each one that applies to you.",
        "If you check only harassment, the court can't give any relief until the Respondent is notified and there is a hearing within 30 days."],
      src: "PO-0100 ¶1; definitions from PO-0102 pp.2–4",
      body: () => P.P1.map(([k, l]) => chk("p1." + k, l)).join("") + `
        <details class="defs"><summary>What these words mean (from the official instructions)</summary>
        <p><b>Domestic or family violence</b>: a family or household member attempting to cause, threatening to cause, or causing physical harm; placing you in fear of physical harm; forcing you into sexual activity by force, threat of force, or duress; or cruelty to a vertebrate animal meant to threaten, intimidate, coerce, harass or terrorize a family or household member.</p>
        <p><b>Stalking</b>: a knowing or intentional course of conduct involving repeated or continuing harassment that would make a reasonable person feel terrorized, frightened, intimidated, or threatened, and actually makes you feel that way. "Course of conduct" means two (2) or more incidents.</p>
        <p><b>Harassment</b>: conduct directed toward you, including repeated or continuing impermissible contact (following you; contacting you in person, in writing, by phone or electronically; social media posts directed to or about you) that would cause a reasonable person emotional distress and actually causes you emotional distress.</p>
        <p><b>Sex offense</b>: crimes listed in Indiana Code 35-42-4, such as rape, sexual battery and child molesting. Criminal charges do not have to be filed.</p>
        <p class="src">Source: <a href="${P.SOURCES.po0102}" target="_blank" rel="noopener">PO-0102</a> pp.2–4</p></details>` },
    { id: "relationship", n: 3, nav: "Relationship", ref: "PO-0100 ¶2", title: "Your relationship to the Respondent",
      lead: "Paragraph 2 says how you know the Respondent. Domestic or family violence requires a family or household relationship.",
      how: ["If the Respondent is a family or household member, check only the one line that best applies.",
        "Some lines need a blank filled in (how you are related, or the details of a conviction).",
        "If none of these fits, choose \"None of these\" and then check 2b, 2c or 2d."],
      src: "PO-0100 ¶2; PO-0102 pp.2–3, step 5c",
      body: () => radios("p2.family", [...P.P2A, ["none", "None of these: the Respondent is not a family or household member"]], "2a. The Respondent is my family or household member (check only the line which best applies)") +
        show("p2.family=blood", txt("p2.bloodRel", "The Respondent is my ____", "For example: brother, aunt, adoptive parent.")) +
        show("p2.family=marriage", txt("p2.marriageRel", "The Respondent is my ____", "For example: stepfather, sister-in-law.")) +
        show("p2.family=offender", txt("p2.offCause", "Cause number") + txt("p2.offCourt", "Court") + txt("p2.offState", "State") + txt("p2.offDate", "Date of conviction")) +
        show("p2.family=none", radios("p2.nonFamily", P.P2B.map(([k, l]) => [k, l]), "If the Respondent is not a family or household member (check only the line which best applies)")) },
    { id: "respondent", n: 4, nav: "Respondent and other cases", ref: "PO-0100 ¶3–4", title: "Respondent's age and other cases",
      lead: "Paragraph 3 asks the Respondent's age. Paragraph 4 lists other court cases so the judge knows about them.",
      how: ["Give the Respondent's age in years.",
        "List all cases (divorce, protection orders, paternity, guardianship, criminal, juvenile, civil, military protection orders) involving the Respondent, you, or a child you have with the Respondent.",
        "If you and the Respondent go to the same school, list the school and school corporation so the school can be notified."],
      src: "PO-0100 ¶3–4; PO-0102 step 5d",
      body: () => txt("p3.age", "3. How old is the Respondent? (years)", "", { inputmode: "numeric", cls: "short" }) +
        `<div class="field"><div class="lbl">4. Cases</div>${chk("p4.noCases", "There are no other cases (write \"None\" on the form)")}</div>` +
        show("!p4.noCases", list("p4.cases")) +
        txt("p4.school", "School and school corporation (if you and the Respondent attend the same school)", "", { optional: true }) },
    { id: "venue", n: 5, nav: "County and address", ref: "PO-0100 ¶5–6", title: "Why this county, and your public address",
      lead: "Paragraph 5 says why you are filing in this county. Paragraph 6 is a mailing address that will be public.",
      how: ["Check every reason that applies. There is no minimum time you must have lived in the county; staying temporarily with a relative or at a shelter counts.",
        "If you don't have an attorney, give a mailing address you are comfortable having public. It will not be kept secret.",
        "Your home address goes on the Confidential Form instead, where it is kept confidential."],
      src: "PO-0100 ¶5–6; PO-0102 steps 5e–5f; Deskbook (Residency)",
      body: () => `<fieldset class="radios"><legend class="lbl">5. This case is filed in this county because</legend>${P.P5.map(([k, l]) => chk("p5." + k, l)).join("")}</fieldset>` +
        radios("p6.attorney", [["no", "No, I am not represented by an attorney"], ["yes", "Yes, I have an attorney"]], "Do you have an attorney?") +
        show("p6.attorney=no", txt("p6.address", "6. Your public mailing address", "This address will NOT be kept secret. If the order is granted, you may be eligible for the Attorney General's Address Confidentiality Program.", { area: true, rows: 3 })) },
    { id: "acts", n: 6, nav: "What the Respondent did", ref: "PO-0100 ¶7", title: "What the Respondent did",
      lead: "Paragraph 7 lists the kinds of acts. You describe each incident on the next page.",
      how: ["Check every act that applies.", "Make sure the acts match the reasons you checked in paragraph 1."],
      src: "PO-0100 ¶7",
      body: () => P.P7.map(([k, l]) => chk("p7." + k, l)).join("") },
    { id: "incidents", n: 7, nav: "Incidents", ref: "PO-0100 ¶8", title: "Describe each incident",
      lead: "Paragraph 8: describe what happened in each incident, with the date, place and everyone who was present.",
      how: ["One incident per box. Use \"Add another incident\" for each separate time something happened.",
        "Be specific about the time, the place, and exactly what the Respondent did or said. Vague descriptions are a common reason emergency orders are denied.",
        "List everyone who was present. You must include your own name if you were present.",
        "The petition is public and may be sent to the Respondent. Don't include information you need to keep private."],
      src: "PO-0100 ¶8; PO-0102 pp.7–8",
      body: () => list("p8") },
    { id: "relief", n: 8, nav: "What you are asking for", ref: "PO-0100 ¶9", title: "What you are asking the court to order",
      lead: "Paragraph 9 lists every kind of relief. The form groups them by when the judge can grant them.",
      how: ["Check everything you are asking for, and fill in the details each one needs.",
        "Family or household members you want protected must also be listed on the Confidential Form. If you don't list anyone, only you are protected.",
        "Some relief can only be granted after a hearing within 30 days."],
      src: "PO-0100 ¶9; PO-0102 pp.4–7, step 5g",
      body: reliefBody },
    { id: "signing", n: 9, nav: "Attachments and signing", ref: "PO-0100 ¶10 and affirmation", title: "Attachments, affirmation and signature",
      lead: "Count the pages you are attaching, say what your statements are based on, and sign.",
      how: ["Count every attached page (extra cases, incidents, animals, firearms, phone numbers, affidavits). Write 0 if none.",
        "(a) Personal knowledge means you saw or experienced it yourself. (b) Information and belief means others told you.",
        "If your petition is based only on what others told you, attach sworn affidavits from people who have personal knowledge. They must come to court if there is a hearing.",
        "You affirm under the penalties for perjury, so make sure everything is true. Sign by hand on the printed form."],
      src: "PO-0100 ¶10 and affirmation; PO-0102 p.9, step 4",
      body: () => txt("p10.pages", "10. Number of pages attached", "", { inputmode: "numeric", cls: "short" }) +
        `<fieldset class="radios"><legend class="lbl">I affirm, under the penalties for perjury, that the foregoing representations are true:</legend>
          ${chk("aff.a", "a. on the basis of my own personal knowledge")}${chk("aff.b", "b. on the basis that I have been informed and believe that the facts stated are true")}</fieldset>` +
        show("aff.b", txt("aff.affidavits", "Number of affidavits attached", "Required if (b) is your only basis.", { inputmode: "numeric", cls: "short" })) +
        txt("sign.date", "Date", "", { type: "date", cls: "short" }) + txt("sign.name", "Petitioner (type or print name)") +
        `<p class="note-inline">The signature itself must be written by hand on the printed form.</p>` },
    { id: "confidential", n: 10, nav: "Confidential Form", ref: "PO-0104", title: "Confidential Form (PO-0104)",
      lead: "This separate form is seen only by law enforcement, prosecutors, and court and clerk staff. It must be filed with the petition.",
      how: ["Give as much identifying information about the Respondent as you can. Their date of birth or Social Security number is needed to put the order in the national registry.",
        "A current address for the Respondent helps them get served. Without service, the order may not be enforced and there will be no hearing.",
        "List each family or household member to be protected (at most 9 per order), and anyone else living in your household who is not protected.",
        "This tool does not ask for Social Security numbers. Write them on the paper form yourself."],
      src: "PO-0104; PO-0102 pp.1, 4, 5, 8",
      body: confBody },
    { id: "review", nav: "Review and download", title: "Review and download", body: reviewBody },
    { id: "upload", nav: "Check a PDF", title: "Check a petition PDF", body: uploadBody }
  ];
  const FORM_PAGES = PAGES.filter(p => p.n);

  function reliefBody() {
    const g1 = P.P9_G1.map(([k, l]) => chk("p9." + k, l) + ({
      protectHousehold: show("p9.protectHousehold", txt("p9.householdNames", "Names of the family or household members", "One name per line (at most 9 per order).", { area: true, rows: 3 })),
      stayAway: show("p9.stayAway", txt("p9.stayAwayType", "Which place is it?", "Residence, school, place of employment, or other.") + txt("p9.stayAwayLocation", "Located at", "This petition is public. The address will be in the court file.")),
      indefinite: show("p9.indefinite", `<p class="note-inline">Requires the sex or violent offender line in paragraph 2.</p>`),
      stayAwayFamily: show("p9.stayAwayFamily", txt("p9.familyLocations", "Location(s) frequented by family or household members", "", { area: true, rows: 2 }))
    }[k] || "")).join("") + txt("p9.owners", "Please list all owners or lease signers at my residence", "The form asks everyone to complete this.", { area: true, rows: 2 });
    const g2 = P.P9_G2.map(([k, l]) => chk("p9." + k, l) + ({
      evict: show("p9.evict", txt("p9.evictAddress", "Residence located at")),
      possession: show("p9.possession", chk("p9.possResidence", "The residence") + show("p9.possResidence", txt("p9.possResidenceAddr", "Residence located at")) +
        chk("p9.possVehicle", "An automobile / other motor vehicle") + show("p9.possVehicle", txt("p9.possVehicleDesc", "Described as")) +
        chk("p9.possItems", "Other necessary personal items") + show("p9.possItems", txt("p9.possItemsDesc", "Described as", "", { area: true, rows: 2 }))),
      animalsProtect: show("p9.animalsProtect", `<p class="hint">Example: Name: Max · Age/Type: 9 year old dog · Size/Breed: Large 55 pound black lab · Color/Description: Black hair, pink collar</p>` + list("p9.animalsProtectList")),
      animalsCustody: show("p9.animalsCustody", list("p9.animalsCustodyList")),
      additional: show("p9.additional", txt("p9.additionalText", "Describe the additional relief", "", { area: true, rows: 3 }))
    }[k] || "")).join("");
    const g3 = P.P9_G3.map(([k, l]) => chk("p9." + k, l) + ({
      reimburse: show("p9.reimburse", P.REIMBURSE.map(([r, rl]) => chk("p9." + r, rl) + show("p9." + r, txt("p9." + r + "Amt", "Amount ($)", "", { inputmode: "decimal", cls: "short" }))).join("")),
      firearmsSurrender: show("p9.firearmsSurrender", txt("p9.firearmsItems", "List each firearm, ammunition or deadly weapon", "One per line.", { area: true, rows: 3 })),
      wireless: show("p9.wireless", `<p class="hint">A wireless provider's normal requirements for a new account still apply.</p>` + list("p9.phones"))
    }[k] || "")).join("");
    return group("Can be granted right away, without a hearing", "Unless the petition is based on harassment alone.", g1) +
      group("Can be granted right away, but a hearing must be held within 30 days", "", g2) +
      group("Can be granted only after notice and a hearing within 30 days", "", g3);
  }

  function confBody() {
    return group("Person restrained (Respondent)", "",
      txt("conf.rName", "Name") + `<div class="row">` + txt("conf.rDob", "Date of birth", "", { type: "date" }) +
      radios("conf.rSsnKnown", [["yes", "Yes"], ["no", "No"]], "Do you know their Social Security number?", "Don't type it here. Write it on the paper form.") + `</div>` +
      `<div class="row">` + radios("conf.rSex", [["male", "Male"], ["female", "Female"]], "Sex") + txt("conf.rRace", "Race") + `</div>` +
      `<div class="row">` + txt("conf.rHair", "Hair color") + txt("conf.rEye", "Eye color") + txt("conf.rHeight", "Height") + txt("conf.rWeight", "Weight") + `</div>` +
      txt("conf.rScars", "Scars or tattoos (nature and location)", "", { optional: true }) +
      `<div class="row">` + txt("conf.rHomePhone", "Home phone", "", { optional: true }) + txt("conf.rCellPhone", "Cell phone", "", { optional: true }) + `</div>` +
      txt("conf.rAddress", "Home address", "", { area: true, rows: 2 }) +
      txt("conf.rWorkplace", "Place of business or where they are usually found", "", { optional: true })) +
      group("You (Petitioner)", "Kept confidential under Indiana Code 5-2-9-7.",
        txt("conf.pAddress", "Home address", "", { area: true, rows: 2 }) +
        `<div class="row">` + txt("conf.pDob", "Date of birth", "", { type: "date" }) + radios("conf.pSex", [["male", "Male"], ["female", "Female"]], "Sex") + txt("conf.pRace", "Race") + `</div>` +
        `<div class="row">` + txt("conf.pCell", "Cell phone") + txt("conf.pEmail", "Email", "", { type: "email" }) + `</div>` +
        radios("conf.notify", [["yes", "Yes"], ["no", "No"]], "Do you wish to receive notifications when the order is issued, served, and about to expire?") +
        show("conf.notify=yes", radios("conf.method", [["email", "Email"], ["text", "Text"]], "Method", "Standard text-messaging fees apply. Tell the Clerk if your contact details change."))) +
      group("Other protected parties", "Family or household members to be protected (at most 9 per order).", list("conf.protected")) +
      group("People in your household who are NOT protected", "", list("conf.others"));
  }

  function startBody() {
    return `<p class="lead">This is a practice tool for Indiana's <b>Petition for an Order for Protection</b> (form PO-0100) and the <b>Confidential Form</b> (PO-0104). It checks whether the fields the forms and the official instructions ask for are filled in and consistent.</p>
      <div class="callout"><b>What this tool does not do.</b> It does not file anything, it is not legal advice, and it cannot tell you whether a judge will grant an order. Only the judge decides that. Everything you type stays in this browser tab and disappears when you close it.</div>
      <div class="choices2">
        <button class="card" type="button" data-go="caption"><b>Fill in the form</b><span>Go through the petition page by page with instructions, then download a worksheet to copy onto the official form or into e-filing.</span></button>
        <button class="card" type="button" data-go="upload"><b>Check a PDF I already have</b><span>Check a typed PDF of the official form, or a worksheet you downloaded from this tool. The file is read in your browser and never uploaded.</span></button>
      </div>
      <h3>Before you start, try to have</h3>
      <ul><li>The Respondent's correct full name (required to file).</li><li>Their date of birth and current address, if you know them.</li>
        <li>The dates, places and people present for each incident.</li><li>Case numbers of any other court cases involving you, the Respondent, or your children.</li></ul>
      <h3>Official resources</h3>
      <ul><li><a href="${P.SOURCES.forms}" target="_blank" rel="noopener">Official protection order forms</a> (Indiana Office of Court Services)</li>
        <li><a href="${P.SOURCES.efile}" target="_blank" rel="noopener">Indiana Protection Order E-filing Service</a> and <a href="${P.SOURCES.efileHelp}" target="_blank" rel="noopener">how to e-file</a></li>
        <li><a href="${P.SOURCES.advocates}" target="_blank" rel="noopener">Find an advocate</a>: advocates can help you fill out the forms and plan for safety, confidentially.</li></ul>
      <p class="alert"><b>If you are in danger right now, call 911.</b></p>`;
  }

  function reviewBody() {
    return `<p class="lead">All checks across the petition and the Confidential Form. Fix what you can, then download your worksheet.</p>
      <div id="review-summary"></div>
      <div class="actions"><button class="btn primary" type="button" id="dl">Download worksheet (PDF)</button></div>
      <p class="fine">The worksheet is <b>not a court form</b>. Copy your answers onto the official PO-0100 and PO-0104, or into the <a href="${P.SOURCES.efile}" target="_blank" rel="noopener">e-filing service</a>. The official forms must be used to file.</p>
      <h3>Filing checklist</h3><ul>${P.FILING_CHECKLIST.map(x => `<li>${esc(x)}</li>`).join("")}</ul>
      <p class="src">Source: <a href="${P.SOURCES.po0102}" target="_blank" rel="noopener">PO-0102</a> pp.8–9; <a href="${P.SOURCES.po0104}" target="_blank" rel="noopener">PO-0104</a></p>
      <h3>Get the official forms</h3>
      <ul><li><a href="${P.SOURCES.forms}" target="_blank" rel="noopener">Forms page</a>: PO-0100 (Petition), PO-0104 (Confidential Form), PNW-0102 (Notice of Exclusion), PO-0102 (Instructions). Check that the revision date matches the latest one.</li>
        <li><a href="${P.SOURCES.efile}" target="_blank" rel="noopener">E-filing Service</a> (you can also file on paper at the clerk's office).</li></ul>
      <div class="actions"><button class="btn" type="button" id="clear">Clear everything and start over</button></div>`;
  }

  function uploadBody() {
    return `<p class="lead">Choose a PDF of your petition. It is read only in your browser; nothing is uploaded.</p>
      <div class="callout">Works best with: a worksheet downloaded from this tool, or the official Word form typed on a computer and saved as PDF. Scanned or handwritten forms can't be read; check those page by page with the form instead.</div>
      <div class="field"><label class="lbl" for="pdf">PDF file</label><input type="file" id="pdf" accept="application/pdf"></div>
      <div id="pdf-result" aria-live="polite"></div>`;
  }

  /* ---------- rendering ---------- */
  function renderNav() {
    const issues = PR.check(S);
    $("#nav").innerHTML = PAGES.map(p => {
      const req = p.n ? issues.filter(i => i.page === p.id && i.level === "required").length : 0;
      const rec = p.n ? issues.filter(i => i.page === p.id && i.level === "recommended").length : 0;
      const st = p.n ? (req ? `<span class="badge req">${req} to fix</span>` : rec ? `<span class="badge rec">${rec} to check</span>` : `<span class="badge ok">✓</span>`) : "";
      return `<li><button type="button" data-go="${p.id}" ${p.id === current ? 'aria-current="page"' : ""}>${p.n ? `<span class="num">${p.n}</span>` : ""}<span class="t">${p.nav}</span>${st}</button></li>`;
    }).join("");
    $("#nav-progress").textContent = `${issues.filter(i => i.level === "required").length} required items left`;
  }

  const LEVEL = { required: "Required", recommended: "Recommended", info: "Good to know" };
  const issueHTML = i => `<li class="issue ${i.level}"><span class="lvl">${LEVEL[i.level]}</span> ${esc(i.msg)} <span class="src">${esc(i.src)}</span></li>`;

  function renderPageIssues(pid) {
    const box = $("#page-issues"); if (!box) return;
    const list = PR.check(S).filter(i => i.page === pid);
    const order = { required: 0, recommended: 1, info: 2 };
    list.sort((a, b) => order[a.level] - order[b.level]);
    box.innerHTML = list.length ? `<h3>Checks on this page</h3><ul class="issues">${list.map(issueHTML).join("")}</ul>`
      : `<p class="allgood">✓ Nothing to fix on this page.</p>`;
  }

  function renderReview() {
    const all = PR.check(S), el = $("#review-summary"); if (!el) return;
    const cnt = l => all.filter(i => i.level === l).length;
    el.innerHTML = `<p class="counts"><span class="badge req">${cnt("required")} required</span> <span class="badge rec">${cnt("recommended")} recommended</span> <span class="badge inf">${cnt("info")} good to know</span></p>` +
      FORM_PAGES.map(p => {
        const l = all.filter(i => i.page === p.id);
        return `<section class="rev"><header><h3>${p.n}. ${p.nav} <span class="ref">${p.ref}</span></h3><button class="btn link" type="button" data-go="${p.id}">Edit</button></header>
          ${l.length ? `<ul class="issues">${l.map(issueHTML).join("")}</ul>` : `<p class="allgood">✓ Complete</p>`}</section>`;
      }).join("");
  }

  function renderList(container) {
    const path = container.dataset.list, def = PR.LISTS[path], arr = get(path);
    if (path === "p8") {
      container.innerHTML = arr.map((x, i) => `<div class="item" role="group" aria-label="Incident ${i + 1}">
        <header><b>Incident #${i + 1}</b>${arr.length > 1 ? `<button class="btn link" type="button" data-rm="${path}" data-i="${i}">Remove</button>` : ""}</header>
        <div class="row">${txt(`p8.${i}.date`, "Date of incident", "Exact if you know it; otherwise approximate, e.g. \"early March 2026\".")}${txt(`p8.${i}.place`, "Place of incident", "A general description is fine, e.g. \"outside my workplace\".")}</div>
        ${txt(`p8.${i}.desc`, "Description of incident", "What the Respondent did or said, in order. Include any weapons used or threatened.", { area: true, rows: 5 })}
        ${radios(`p8.${i}.present`, [["yes", "Yes"], ["no", "No"]], "Were you present?")}
        ${txt(`p8.${i}.people`, "Names of all the people who were present", "You must include your own name if you were present. Write \"No one else\" if that's true.", { area: true, rows: 2 })}
      </div>`).join("") + `<button class="btn" type="button" data-add="p8">+ Add another incident</button>` +
        (arr.length > def.capacity ? `<p class="note-inline">The form has room for ${def.capacity} incidents. Put the rest on ${def.attach}.</p>` : "");
    } else {
      container.innerHTML = arr.map((x, i) => `<div class="item" role="group" aria-label="${def.item} ${i + 1}">
        <header><b>${def.item} ${i + 1}</b><button class="btn link" type="button" data-rm="${path}" data-i="${i}">Remove</button></header>
        <div class="row">${def.fields.map(([f, l]) => txt(`${path}.${i}.${f}`, l)).join("")}</div></div>`).join("") +
        `<button class="btn" type="button" data-add="${path}">+ Add ${def.item.toLowerCase()}</button>` +
        (def.capacity && arr.length > def.capacity ? `<p class="note-inline">The form has room for ${def.capacity}. Put the rest on ${def.attach}.</p>` : "");
    }
  }

  function fillValues(root) {
    root.querySelectorAll("[data-k]").forEach(el => {
      const v = get(el.dataset.k);
      if (el.type === "checkbox") el.checked = !!v;
      else if (el.type === "radio") el.checked = v === el.value;
      else el.value = v ?? "";
    });
  }
  function applyShow(root) {
    root.querySelectorAll("[data-show]").forEach(el => {
      let c = el.dataset.show, neg = c.startsWith("!"); if (neg) c = c.slice(1);
      const [p, val] = c.split("="); const v = get(p);
      let on = val !== undefined ? v === val : !!v; if (neg) on = !on;
      el.hidden = !on;
    });
  }

  function render(pid, focusHeading = true) {
    current = pid; uid = 0;
    const p = PAGES.find(x => x.id === pid);
    const head = p.n ? `<p class="stepno">Page ${p.n} of ${FORM_PAGES.length} · ${p.ref}</p>` : "";
    const how = p.how ? `<details class="how" open><summary>How to fill in this page</summary><ol>${p.how.map(h => `<li>${h}</li>`).join("")}</ol><p class="src">Based on the official form and instructions: ${p.src}</p></details>` : "";
    const idx = FORM_PAGES.indexOf(p);
    const prev = p.n ? (idx > 0 ? FORM_PAGES[idx - 1].id : "start") : null;
    const next = p.n ? (idx < FORM_PAGES.length - 1 ? FORM_PAGES[idx + 1] : PAGES.find(x => x.id === "review")) : null;
    $("#page").innerHTML = `${head}<h2 id="ph" tabindex="-1">${p.title}</h2>${p.lead ? `<p class="lead">${p.lead}</p>` : ""}${how}
      <div class="fields">${p.body()}</div>${p.n ? `<div id="page-issues" class="page-issues" aria-live="polite"></div>` : ""}
      ${p.n ? `<div class="pager"><button class="btn" type="button" data-go="${prev}">Back</button><button class="btn primary" type="button" data-go="${next.id}">Next: ${next.nav}</button></div>` : ""}`;
    $("#page").querySelectorAll("[data-list]").forEach(renderList);
    fillValues($("#page")); applyShow($("#page"));
    renderPageIssues(pid); renderNav(); renderReview();
    if (pid === "upload" && PR.initUpload) PR.initUpload();
    if (focusHeading) { window.scrollTo({ top: 0 }); $("#ph").focus({ preventScroll: true }); }
  }
  PR.render = render;

  function refresh() { applyShow($("#page")); renderPageIssues(current); renderNav(); }

  /* ---------- events ---------- */
  document.addEventListener("click", e => {
    const g = e.target.closest("[data-go]"); if (g) { render(g.dataset.go); return; }
    const a = e.target.closest("[data-add]");
    if (a) {
      const path = a.dataset.add, arr = get(path), def = PR.LISTS[path];
      arr.push(path === "p8" ? { date: "", place: "", desc: "", people: "", present: "" } : Object.fromEntries(def.fields.map(([f]) => [f, ""])));
      render(current, false);
      const items = document.querySelectorAll(`[data-list="${path}"] .item`);
      items[items.length - 1]?.querySelector("input,textarea")?.focus();
      return;
    }
    const r = e.target.closest("[data-rm]");
    if (r) { get(r.dataset.rm).splice(+r.dataset.i, 1); render(current, false); return; }
    if (e.target.id === "dl") PR.downloadWorksheet(S, PR.check(S));
    if (e.target.id === "clear" && confirm("Clear everything you entered?")) { S = PR.blank(); render("start"); }
  });
  document.addEventListener("input", e => {
    const k = e.target.dataset?.k; if (!k) return;
    set(k, e.target.type === "checkbox" ? e.target.checked : e.target.value);
    refresh();
  });
  document.addEventListener("change", e => {
    const k = e.target.dataset?.k; if (!k || e.target.type !== "radio") return;
    set(k, e.target.value); refresh();
  });

  /* Theme and quick exit */
  function setTheme(dark) {
    if (dark) document.documentElement.dataset.theme = "dark"; else delete document.documentElement.dataset.theme;
    const b = $("#theme"); b.setAttribute("aria-pressed", dark);
    b.innerHTML = dark ? `<span aria-hidden="true">☀</span> Light mode` : `<span aria-hidden="true">☾</span> Dark mode`;
    try { localStorage.setItem("pr-theme", dark ? "dark" : "light"); } catch (e) { }
  }
  $("#theme").onclick = () => setTheme(document.documentElement.dataset.theme !== "dark");
  $("#exit").onclick = () => { S = PR.blank(); document.body.innerHTML = ""; location.replace("https://www.google.com/"); };

  setTheme(document.documentElement.dataset.theme === "dark");
  render("start", false);
})();
