/* Completeness checks for PO-0100 + PO-0104. Pure function of the form state.
   level: "required"  = the form or the official instructions say it must be filled or done
          "recommended" = the instructions advise it, or two answers don't line up
          "info"     = good to know (hearings, attachments, privacy)
   These are completeness checks, not a legal judgement: only a judge decides whether a
   petition is sufficient (PO-0102 p.7; Deskbook ch. 2). */
window.PR = window.PR || {};

PR.check = function (S) {
  const out = [];
  const add = (page, level, msg, src) => out.push({ page, level, msg, src });
  const has = v => v != null && String(v).trim() !== "";
  const lines = t => String(t || "").split(/\n|;/).map(s => s.trim()).filter(Boolean);
  const words = t => String(t || "").trim().split(/\s+/).filter(Boolean).length;
  const anyOf = (obj, keys) => keys.some(k => obj[k]);
  const { caption: c, p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, aff, sign, conf } = S;

  /* Caption */
  if (!has(c.county)) add("caption", "required", "The county is blank.", "PO-0102 p.8, step 5a");
  if (!has(c.court)) add("caption", "required", "The court name is blank.", "PO-0102 p.8, step 5a");
  if (!has(c.petitioner)) add("caption", "required", "Your name (Petitioner) is blank.", "PO-0102 p.8, step 5b");
  if (!has(c.respondent)) add("caption", "required", "The Respondent's full name is blank. You must have the Respondent's correct name to file.", "PO-0102 p.1, Important Notice");
  else if (/\s(and|&)\s|,|\//i.test(c.respondent)) add("caption", "recommended", "There can be only one Respondent per petition. File a separate petition (and Confidential Form) for each Respondent.", "PO-0102 p.4");

  /* ¶1 */
  if (!anyOf(p1, ["dv", "sex", "stalking", "harass"])) add("basis", "required", "No reason is checked in paragraph 1.", "PO-0100 ¶1");
  const harassOnly = p1.harass && !p1.dv && !p1.sex && !p1.stalking;
  if (harassOnly) add("basis", "info", "A petition based on harassment alone: the court can grant relief only after notice to the Respondent and a hearing within 30 days.", "PO-0100 ¶9 note; PO-0102 p.5");

  /* ¶2 */
  if (!has(p2.family)) add("relationship", "required", "Paragraph 2 is not answered. Check the one line that best describes your relationship, or 'none of these'.", "PO-0100 ¶2; PO-0102 p.8, step 5c");
  if (p2.family === "blood" && !has(p2.bloodRel)) add("relationship", "required", "Fill in how you are related by blood or adoption (\"The Respondent is my ____\").", "PO-0100 ¶2a");
  if (p2.family === "marriage" && !has(p2.marriageRel)) add("relationship", "required", "Fill in how you are related by marriage (\"The Respondent is my ____\").", "PO-0100 ¶2a");
  if (p2.family === "offender" && ![p2.offCause, p2.offCourt, p2.offState, p2.offDate].every(has))
    add("relationship", "required", "For the sex or violent offender line, fill in the cause number, the court, the state and the date of conviction.", "PO-0100 ¶2a; PO-0102 p.4");
  if (p1.dv && p2.family === "none") add("relationship", "required", "Paragraph 1 says domestic or family violence, but paragraph 2 says the Respondent is not a family or household member. Domestic or family violence must be committed by a family or household member.", "PO-0102 p.2 (definition)");
  if (p2.family === "none" && !has(p2.nonFamily)) add("relationship", "required", "If the Respondent is not a family or household member, check 2b, 2c or 2d.", "PO-0100 ¶2b–d");
  const nfMap = { stalking: "stalking", sex: "sex", harass: "harass" };
  if (p2.family === "none" && has(p2.nonFamily) && !p1[nfMap[p2.nonFamily]])
    add("relationship", "recommended", "The reason checked in paragraph 2 is not checked in paragraph 1.", "PO-0100 ¶1–2");

  /* ¶3 */
  const age = parseInt(p3.age, 10);
  if (!has(p3.age)) add("respondent", "required", "The Respondent's age is blank.", "PO-0100 ¶3");
  else if (!(age >= 0 && age < 120)) add("respondent", "recommended", "The Respondent's age doesn't look like a number of years.", "PO-0100 ¶3");
  else if (age < 18) add("respondent", "info", "The Respondent is under 18. If a hearing is set, the case may be transferred to juvenile court.", "PO-0102 p.4");
  if (has(conf.rDob) && age >= 0) {
    const d = new Date(conf.rDob);
    if (!isNaN(d)) {
      const now = new Date(); let a = now.getFullYear() - d.getFullYear();
      if (now < new Date(now.getFullYear(), d.getMonth(), d.getDate())) a--;
      if (Math.abs(a - age) > 1) add("respondent", "recommended", `The age in paragraph 3 (${age}) doesn't match the date of birth on the Confidential Form (about ${a}).`, "PO-0100 ¶3; PO-0104");
    }
  }

  /* ¶4 */
  const cases = (p4.cases || []).filter(x => has(x.name) || has(x.number) || has(x.where));
  if (!p4.noCases && !cases.length) add("respondent", "required", "Paragraph 4: list every case involving the Respondent, you, or a child you have with the Respondent. If there are none, say so (write \"None\" on the form).", "PO-0100 ¶4; PO-0102 p.8, step 5d");
  cases.forEach((x, i) => { if (!has(x.name) || !has(x.number) || !has(x.where)) add("respondent", "recommended", `Case ${i + 1} is missing its name, number, or county & state.`, "PO-0100 ¶4; PO-0102 step 5d"); });
  if (cases.length > PR.LISTS["p4.cases"].capacity) add("respondent", "info", `More than ${PR.LISTS["p4.cases"].capacity} cases: put the rest on Attachment 4a and count it in paragraph 10.`, "PO-0100 ¶4");

  /* ¶5–6 */
  if (!anyOf(p5, ["respLives", "happened", "iLive"])) add("venue", "required", "Paragraph 5: check at least one reason the case is filed in this county.", "PO-0100 ¶5");
  if (!has(p6.attorney)) add("venue", "required", "Paragraph 6: say whether you have an attorney.", "PO-0100 ¶6");
  if (p6.attorney === "no" && !has(p6.address)) add("venue", "required", "Paragraph 6: fill in a public mailing address. It will not be kept secret, so use one you are comfortable having public.", "PO-0100 ¶6; PO-0102 p.9, step 5f");

  /* ¶7 */
  if (!anyOf(p7, PR.P7.map(x => x[0]))) add("acts", "required", "Paragraph 7: check at least one act.", "PO-0100 ¶7");
  else {
    if (p1.dv && !anyOf(p7, ["attempted", "threatened", "caused", "fear", "sexual", "animal"])) add("acts", "recommended", "Paragraph 1 says domestic or family violence, but none of the acts that make up domestic or family violence is checked in paragraph 7.", "PO-0102 p.2 (definition)");
    if (p1.stalking && !p7.stalking) add("acts", "recommended", "Paragraph 1 says stalking, but \"committed stalking against me\" is not checked in paragraph 7.", "PO-0100 ¶1, ¶7");
    if (p1.sex && !p7.sexOffense && !p7.sexual) add("acts", "recommended", "Paragraph 1 says sex offense, but no sexual act is checked in paragraph 7.", "PO-0100 ¶1, ¶7");
    if (p1.harass && !p7.harass) add("acts", "recommended", "Paragraph 1 says harassment, but \"committed repeated acts of harassment\" is not checked in paragraph 7.", "PO-0100 ¶1, ¶7");
  }

  /* ¶8 */
  const incs = (p8 || []).filter(x => has(x.date) || has(x.place) || has(x.desc) || has(x.people));
  if (!incs.length) add("incidents", "required", "Paragraph 8: describe at least one incident.", "PO-0100 ¶8");
  const PII = /(\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b)|(\b\d{3}-\d{2}-\d{4}\b)|(\b\d{2,5}\s+\w+(\s\w+)?\s+(St|Street|Ave|Avenue|Rd|Road|Dr|Drive|Ln|Lane|Blvd|Ct|Court)\b)/i;
  const lastName = has(c.petitioner) ? c.petitioner.trim().split(/\s+/).pop().toLowerCase() : "";
  p8.forEach((x, i) => {
    if (!(has(x.date) || has(x.place) || has(x.desc) || has(x.people))) return;
    const n = i + 1, miss = [];
    if (!has(x.date)) miss.push("date"); if (!has(x.place)) miss.push("place"); if (!has(x.desc)) miss.push("description"); if (!has(x.people)) miss.push("people present");
    if (miss.length) add("incidents", "required", `Incident ${n} is missing: ${miss.join(", ")}.`, "PO-0100 ¶8");
    const d = new Date(x.date);
    if (has(x.date) && /^\d{4}-\d{2}-\d{2}$/.test(x.date) && d > new Date()) add("incidents", "required", `Incident ${n}'s date is in the future.`, "PO-0100 ¶8");
    if (has(x.desc) && words(x.desc) < 12) add("incidents", "recommended", `Incident ${n}'s description is very short. Vague allegations without a clear description of the time, place or acts are a common reason ex parte orders are denied.`, "PO-0102 p.7");
    if (x.present === "yes" && has(x.people) && lastName && !x.people.toLowerCase().includes(lastName))
      add("incidents", "required", `Incident ${n}: you were present, so your own name must be in the list of people present.`, "PO-0100 ¶8");
    if (!has(x.present)) add("incidents", "recommended", `Incident ${n}: say whether you were present (the form requires your own name in the list if you were).`, "PO-0100 ¶8");
    if (PII.test(x.desc)) add("incidents", "info", `Incident ${n} may include a phone number or street address. The petition is a public document and may be sent to the Respondent.`, "PO-0100 (Important); PO-0102 p.8");
  });
  if (p1.stalking && incs.length < 2) add("incidents", "recommended", "Stalking is a \"course of conduct\", which means two (2) or more incidents. Only one incident is described.", "PO-0102 p.3 (IC 35-45-10-1)");
  if (p1.harass && incs.length < 2) add("incidents", "recommended", "Harassment means repeated or continuing impermissible contact. Only one incident is described.", "PO-0102 p.3 (IC 34-6-2-51.5)");
  if (p8.length > PR.LISTS.p8.capacity) add("incidents", "info", `More than ${PR.LISTS.p8.capacity} incidents: put the rest on Attachment 8a and count it in paragraph 10.`, "PO-0100 ¶8");

  /* ¶9 */
  const all9 = [...PR.P9_G1, ...PR.P9_G2, ...PR.P9_G3].map(x => x[0]);
  if (!anyOf(p9, all9)) add("relief", "required", "Paragraph 9: check at least one kind of relief.", "PO-0100 ¶9");
  const names = lines(p9.householdNames);
  const confProtected = (conf.protected || []).filter(x => has(x.name)).length;
  if (p9.protectHousehold && !names.length) add("relief", "required", "List the names of the family or household members to be protected.", "PO-0100 ¶9");
  if (names.length > PR.MAX_PROTECTED) add("relief", "required", `Only ${PR.MAX_PROTECTED} protected household members are allowed per order. A second petition is needed for the others.`, "PO-0102 p.4");
  if (p9.protectHousehold && names.length > confProtected) add("relief", "recommended", "Also list each protected family or household member on the Confidential Form. People not listed there may not be protected.", "PO-0102 p.9, step 5g");
  if (p9.stayAway && (!has(p9.stayAwayType) || !has(p9.stayAwayLocation))) add("relief", "required", "Stay-away order: fill in which place it is (residence, school, employment, other) and where it is located.", "PO-0100 ¶9");
  if (p9.indefinite && p2.family !== "offender") add("relief", "required", "An indefinite order requires the sex or violent offender line in paragraph 2 (with the conviction details).", "PO-0100 ¶2a, ¶9");
  if (p9.stayAwayFamily && !has(p9.familyLocations)) add("relief", "required", "List the location(s) frequented by your family or household members.", "PO-0100 ¶9");
  if (!has(p9.owners)) add("relief", (p9.evict || p9.possResidence || p9.stayAway) ? "required" : "recommended", "The form asks you to list all owners or lease signers at your residence (\"Please complete\").", "PO-0100 ¶9");
  if (p9.evict && !has(p9.evictAddress)) add("relief", "required", "Eviction: fill in the address of the residence.", "PO-0100 ¶9");
  if (p9.possession) {
    if (!p9.possResidence && !p9.possVehicle && !p9.possItems) add("relief", "required", "Possession and use: check the residence, a vehicle, or other personal items.", "PO-0100 ¶9");
    if (p9.possResidence && !has(p9.possResidenceAddr)) add("relief", "required", "Possession of the residence: fill in its address.", "PO-0100 ¶9");
    if (p9.possVehicle && !has(p9.possVehicleDesc)) add("relief", "required", "Possession of a vehicle: describe it.", "PO-0100 ¶9");
    if (p9.possItems && !has(p9.possItemsDesc)) add("relief", "required", "Other necessary personal items: describe them.", "PO-0100 ¶9");
  }
  [["animalsProtect", "animalsProtectList"], ["animalsCustody", "animalsCustodyList"]].forEach(([k, l]) => {
    if (!p9[k]) return;
    const list = (p9[l] || []).filter(a => has(a.name) || has(a.ageType) || has(a.sizeBreed) || has(a.color));
    if (!list.length) add("relief", "required", "List at least one animal (name, age/type, size/breed, color/description).", "PO-0100 ¶9");
    list.forEach((a, i) => { if (![a.name, a.ageType, a.sizeBreed, a.color].every(has)) add("relief", "recommended", `Animal ${i + 1}: fill in all four details, like the example on the form.`, "PO-0100 ¶9"); });
    if (list.length > 2) add("relief", "info", "More than 2 animals: list the rest on Attachment 9(a).", "PO-0100 ¶9");
  });
  if (p9.additional && !has(p9.additionalText)) add("relief", "required", "Additional relief: describe what you are asking for.", "PO-0100 ¶9");
  if (p9.reimburse) {
    const subs = PR.REIMBURSE.filter(([k]) => p9[k]);
    if (!subs.length) add("relief", "required", "Reimbursement: check at least one expense.", "PO-0100 ¶9");
    subs.forEach(([k, label]) => { if (!has(p9[k + "Amt"])) add("relief", "recommended", `Reimbursement – ${label}: specify the amount.`, "PO-0100 ¶9"); });
    if (subs.length) add("relief", "info", "Bring documentation of each expense to court for the hearing.", "PO-0100 ¶9");
  }
  if (p9.firearmsSurrender && !lines(p9.firearmsItems).length) add("relief", "required", "Surrender of firearms: list each item.", "PO-0100 ¶9");
  if (lines(p9.firearmsItems).length > PR.FIREARMS_CAPACITY) add("relief", "info", "More firearms than lines on the form: continue on Attachment 9(b).", "PO-0100 ¶9");
  if (p9.wireless) {
    const ph = (p9.phones || []).filter(x => has(x.number));
    if (!ph.length) add("relief", "required", "Wireless transfer: list each telephone number and user, provider and current account holder.", "PO-0100 ¶9");
    ph.forEach((x, i) => { if (!has(x.provider) || !has(x.holder)) add("relief", "recommended", `Telephone ${i + 1}: fill in the wireless service provider and current account holder.`, "PO-0100 ¶9"); });
    if (ph.length > 2) add("relief", "info", "More than 2 telephone numbers: list the rest on Attachment 9(c).", "PO-0100 ¶9");
  }
  if (p9.parentArrange || p9.parentSupervised || p9.parentDeny) add("relief", "info", "Petitions affecting parenting time are required to be filed in the court handling the dissolution or paternity case. Other courts may hear an emergency ex parte petition but must transfer the case.", "Deskbook, Residency/venue section (IC 34-26-5-6)");
  const hearing30 = PR.P9_G2.some(([k]) => p9[k]) || PR.P9_G3.some(([k]) => p9[k]);
  if (hearing30) add("relief", "info", "Some relief you checked requires a hearing within 30 days. The form says that if you ask for it, you must also ask the Court to set a hearing date. Be ready to attend with your evidence and witnesses.", "PO-0100 p.7–8; PO-0102 p.5–6, 9");

  /* ¶10, affirmation, signature */
  const attachments = [
    cases.length > PR.LISTS["p4.cases"].capacity, p8.length > PR.LISTS.p8.capacity,
    (p9.animalsProtectList || []).length > 2 || (p9.animalsCustodyList || []).length > 2,
    lines(p9.firearmsItems).length > PR.FIREARMS_CAPACITY, (p9.phones || []).length > 2,
    parseInt(aff.affidavits, 10) > 0
  ].some(Boolean);
  if (!has(p10.pages)) add("signing", "required", "Paragraph 10: fill in the number of pages attached (0 if none).", "PO-0100 ¶10");
  else if (attachments && parseInt(p10.pages, 10) === 0) add("signing", "recommended", "You have attachments or affidavits, but paragraph 10 says 0 pages attached.", "PO-0100 ¶10");
  if (!aff.a && !aff.b) add("signing", "required", "Choose the basis of your affirmation: (a) your own personal knowledge, (b) information and belief, or both.", "PO-0100 affirmation");
  if (aff.b && !aff.a) {
    if (!(parseInt(aff.affidavits, 10) > 0)) add("signing", "required", "If the petition is based only on information and belief, you must attach affidavits from people with personal knowledge of the facts.", "PO-0100 affirmation note; PO-0102 p.9, step 4");
    add("signing", "info", "People who gave affidavits will have to appear in court as witnesses if a hearing is set.", "PO-0102 p.9, step 4");
  }
  if (!has(sign.name)) add("signing", "required", "Type or print your name under the signature line.", "PO-0100 signature");
  else if (has(c.petitioner) && sign.name.trim().toLowerCase() !== c.petitioner.trim().toLowerCase()) add("signing", "recommended", "The printed name doesn't match the Petitioner name in the caption.", "PO-0100");
  if (!has(sign.date)) add("signing", "required", "Date the petition.", "PO-0102 p.9, step 5h");

  /* PO-0104 Confidential Form */
  if (!has(conf.rName)) add("confidential", "recommended", "Person restrained: name is blank.", "PO-0104");
  else if (has(c.respondent) && conf.rName.trim().toLowerCase() !== c.respondent.trim().toLowerCase()) add("confidential", "recommended", "The Respondent's name differs between the petition and the Confidential Form.", "PO-0104");
  if (!has(conf.rDob) && conf.rSsnKnown !== "yes") add("confidential", "recommended", "Without the Respondent's date of birth or Social Security number, the order cannot go into the national Protection Order Registry (it will still be in Indiana's registry and valid everywhere).", "PO-0102 p.1, p.8 step 3");
  if (!has(conf.rAddress)) add("confidential", "recommended", "The Respondent's current address helps get them served. Without service, an ex parte order may expire and there will be no hearing. (The clerk should not reject a petition for this.)", "PO-0102 p.8 step 3; Deskbook ch. 2");
  if (!has(conf.pAddress)) add("confidential", "recommended", "Your home address goes on the Confidential Form, where it is kept confidential.", "PO-0104; PO-0100 ¶6");
  if (conf.notify === "yes") {
    if (!has(conf.method)) add("confidential", "required", "You asked for notifications: choose email or text.", "PO-0104");
    if (conf.method === "email" && !has(conf.pEmail)) add("confidential", "required", "Notifications by email need your email address.", "PO-0104");
    if (conf.method === "text" && !has(conf.pCell)) add("confidential", "required", "Notifications by text need your cell phone number.", "PO-0104");
  }
  if (confProtected + 0 > PR.MAX_PROTECTED) add("confidential", "required", `Only ${PR.MAX_PROTECTED} protected household members are allowed per order.`, "PO-0102 p.4");
  (conf.protected || []).forEach((x, i) => { if (has(x.name) && !has(x.dob) && !has(x.age)) add("confidential", "recommended", `Protected person ${i + 1}: add an age or date of birth.`, "PO-0104"); });

  return out;
};

/* What to bring / file, from PO-0102 pp.8–9 and PO-0104 */
PR.FILING_CHECKLIST = [
  "4 copies of the Petition (PO-0100): 1 worksheet, 1 for the court's file, 1 to be served on the Respondent, 1 for you.",
  "1 Confidential Form (PO-0104). The \"Confidential Form\" portion must be on green paper (Admin. Rule 9).",
  "3 copies of the Notice of Exclusion of Confidential Information (PNW-0102), filed with the Confidential Form.",
  "Any attachments (4a, 8a, 9(a)–(c)) and affidavits, counted in paragraph 10.",
  "Sign and date the Petition by hand.",
  "There are no fees: no filing, service, witness or subpoena fee.",
  "One set of forms per Respondent."
];
