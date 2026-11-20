/* Form definitions for Indiana protection order petition PO-0100 (rev. 07/2026) and
   Confidential Form PO-0104 (rev. 07/2019). Labels follow the official wording.
   Sources: https://www.in.gov/courts/iocs/publications/po-forms/ */
window.PR = window.PR || {};

PR.SOURCES = {
  forms: "https://www.in.gov/courts/iocs/publications/po-forms/",
  po0100: "https://www.in.gov/courts/iocs/files/center-bb-po-form-po-0100.pdf",
  po0102: "https://www.in.gov/courts/iocs/files/center-bb-po-form-po-0102.pdf",
  po0104: "https://www.in.gov/courts/iocs/files/center-bb-po-form-po-0104.pdf",
  deskbook: "https://www.in.gov/courts/iocs/files/center-bb-po-deskbook.pdf",
  efile: "https://public.courts.in.gov/porefsp#/",
  efileHelp: "https://www.in.gov/courts/help/efiling/protection-orders",
  advocates: "https://www.in.gov/courts/selfservice/protection-orders#advocates",
  acp: "https://www.in.gov/attorneygeneral/about-the-office/appeals/victim-services/address-confidentiality-program/"
};
PR.FORM_REVISION = "07/2026"; // revision printed on PO-0100 when this tool was built

PR.blank = () => ({
  caption: { county: "", court: "", division: "", petitioner: "", respondent: "" },
  p1: { dv: false, sex: false, stalking: false, harass: false },
  p2: { family: "", bloodRel: "", marriageRel: "", offCause: "", offCourt: "", offState: "", offDate: "", nonFamily: "" },
  p3: { age: "" },
  p4: { noCases: false, cases: [], school: "" },
  p5: { respLives: false, happened: false, iLive: false },
  p6: { attorney: "", address: "" },
  p7: { attempted: false, threatened: false, caused: false, fear: false, sexual: false, stalking: false, sexOffense: false, animal: false, harass: false },
  p8: [{ date: "", place: "", desc: "", people: "", present: "" }],
  p9: {
    protectMe: false, protectHousehold: false, householdNames: "", tracking: false, noContact: false,
    stayAway: false, stayAwayType: "", stayAwayLocation: "", indefinite: false, stayAwayFamily: false, familyLocations: "",
    owners: "",
    evict: false, evictAddress: "",
    possession: false, possResidence: false, possResidenceAddr: "", possVehicle: false, possVehicleDesc: "", possItems: false, possItemsDesc: "",
    animalsProtect: false, animalsProtectList: [], animalsCustody: false, animalsCustodyList: [], additional: false, additionalText: "",
    parentArrange: false, parentSupervised: false, parentDeny: false, attorneyFees: false, rent: false, mortgage: false,
    childSupport: false, maintenance: false,
    reimburse: false, rMedical: false, rMedicalAmt: "", rCounseling: false, rCounselingAmt: "", rShelter: false, rShelterAmt: "",
    rRepair: false, rRepairAmt: "", rOther: false, rOtherAmt: "",
    firearmsProhibit: false, firearmsSurrender: false, firearmsItems: "", wireless: false, phones: []
  },
  p10: { pages: "" },
  aff: { a: false, b: false, affidavits: "" },
  sign: { date: "", name: "" },
  conf: {
    rName: "", rDob: "", rSsnKnown: "", rSex: "", rRace: "", rHair: "", rEye: "", rHeight: "", rWeight: "", rScars: "",
    rHomePhone: "", rCellPhone: "", rAddress: "", rWorkplace: "",
    pAddress: "", pDob: "", pSex: "", pRace: "", pCell: "", pEmail: "", notify: "", method: "",
    protected: [], others: []
  }
});

/* ¶1 */
PR.P1 = [
  ["dv", "a. I am or have been a victim of domestic or family violence"],
  ["sex", "b. I am or have been a victim of a sex offense"],
  ["stalking", "c. I am or have been a victim of stalking"],
  ["harass", "d. I am or have been a victim of repeated acts of harassment"]
];

/* ¶2a: family or household member lines (check only one) */
PR.P2A = [
  ["spouse", "the Respondent is my spouse"],
  ["formerSpouse", "the Respondent used to be my spouse"],
  ["livedIntimate", "the Respondent and I resided together in an intimate relationship"],
  ["child", "the Respondent and I have a child in common"],
  ["dating", "the Respondent and I are dating, or have dated, each other"],
  ["sexual", "the Respondent and I are, or have been, engaged in a sexual relationship"],
  ["blood", "the Respondent and I are related by blood or adoption"],
  ["marriage", "the Respondent and I are, or used to be, related by marriage"],
  ["guardian", "the Respondent is, or used to be, my guardian"],
  ["ward", "the Respondent is, or used to be, my ward"],
  ["custodian", "the Respondent is, or used to be, my custodian"],
  ["foster", "the Respondent is, or used to be, my foster parent"],
  ["minorChild", "I am a minor child of a person in one of the types of relationships described above"],
  ["adopted", "I have adopted the child of the respondent"],
  ["offender", "I am the victim of a sex or violent offense committed by the Respondent, who is required to register as a lifetime sex or violent offender"]
];
PR.P2B = [
  ["stalking", "b. the Respondent has committed stalking against me"],
  ["sex", "c. the Respondent has committed a sex offense against me"],
  ["harass", "d. the Respondent has committed repeated acts of harassment against me"]
];

PR.P5 = [
  ["respLives", "a. the Respondent lives in this county"],
  ["happened", "b. the incident(s) of domestic or family violence, stalking, sex offense, or harassment happened in this county"],
  ["iLive", "c. I live in this county"]
];

PR.P7 = [
  ["attempted", "the Respondent attempted to cause physical harm to me"],
  ["threatened", "the Respondent threatened to cause physical harm to me"],
  ["caused", "the Respondent did cause physical harm to me"],
  ["fear", "the Respondent placed me in fear of physical harm"],
  ["sexual", "the Respondent caused me to involuntarily engage in sexual activity by force, threat of force, or duress"],
  ["stalking", "the Respondent committed stalking against me"],
  ["sexOffense", "the Respondent committed a sex offense against me"],
  ["animal", "the Respondent committed an act of animal cruelty by beating, torturing, mutilating, or killing a vertebrate animal without justification with an intent to threaten, intimidate, coerce, harass or terrorize a family or household member"],
  ["harass", "the Respondent committed repeated acts of harassment against me"]
];

/* ¶9 relief, in the three groups printed on the form */
PR.P9_G1 = [
  ["protectMe", "Prohibit the Respondent from committing, or threatening to commit, acts of domestic or family violence, stalking, or sex offenses against me"],
  ["protectHousehold", "Prohibit the Respondent from committing, or threatening to commit, acts of domestic or family violence, stalking, or sex offenses against my family or household members"],
  ["tracking", "Prohibit the Respondent from using a tracking device to determine the location of me, my property, or my family or household members or their property"],
  ["noContact", "Prohibit the Respondent from harassing, annoying, telephoning, contacting, or directly or indirectly communicating with me"],
  ["stayAway", "Order the Respondent to stay away from my residence, school, place of employment, or other place"],
  ["indefinite", "Order that this Order of Protection be effective indefinitely (I.C. 34-26-5-9), because I was the victim of a sex or violent offense by the Respondent, who must register as a lifetime sex or violent offender"],
  ["stayAwayFamily", "Order the Respondent to stay away from location(s) frequented by my family or household member(s)"]
];
PR.P9_G2 = [
  ["evict", "Evict the Respondent from my residence"],
  ["possession", "Order the Respondent to give me the possession and use of a residence, a vehicle, or other necessary personal items"],
  ["animalsProtect", "Prohibit the Respondent from removing, transferring, injuring, concealing, harming, attacking, mistreating, threatening to harm, or otherwise disposing of animal(s)"],
  ["animalsCustody", "Order that I will have the exclusive possession, care, custody, or control of animal(s)"],
  ["additional", "Order additional relief necessary to provide for my safety and welfare and that of my family or household members"]
];
PR.P9_G3 = [
  ["parentArrange", "Specify the arrangements for parenting time with our minor child(ren)"],
  ["parentSupervised", "Require that parenting time be supervised by a third party"],
  ["parentDeny", "Deny the Respondent parenting time"],
  ["attorneyFees", "Order the Respondent to pay my attorney fees"],
  ["rent", "Order the Respondent to pay rent for my residence"],
  ["mortgage", "Order the Respondent to make payment on a mortgage for my residence"],
  ["childSupport", "Order the Respondent to pay child support for our minor child(ren)"],
  ["maintenance", "Order the Respondent to pay support/maintenance for me"],
  ["reimburse", "Order the Respondent to reimburse me for expenses related to the domestic or family violence, stalking, sex offense, or harassment"],
  ["firearmsProhibit", "Prohibit the Respondent from using or possessing a firearm, ammunition, or deadly weapon"],
  ["firearmsSurrender", "Order the Respondent to surrender firearm(s), ammunition, or deadly weapon(s) to a specified law enforcement agency"],
  ["wireless", "Order a wireless service provider to transfer to me the right to continued use of, and financial responsibility for, telephone number(s) used by me or a minor child in my custody"]
];
PR.REIMBURSE = [["rMedical", "Medical expenses"], ["rCounseling", "Counseling"], ["rShelter", "Shelter"], ["rRepair", "Repair or replacement of damaged property"], ["rOther", "Other costs or fees I have as a result of bringing this case"]];

/* Repeatable lists: fields per row and the form's printed capacity (more rows need an attachment) */
PR.LISTS = {
  "p4.cases": { item: "Case", fields: [["name", "Case name"], ["number", "Case number"], ["where", "County & State"]], capacity: 5, attach: "Attachment 4a" },
  "p8": { item: "Incident", capacity: 3, attach: "Attachment 8a" },
  "p9.animalsProtectList": { item: "Animal", fields: [["name", "Name"], ["ageType", "Age/Type"], ["sizeBreed", "Size/Breed"], ["color", "Color/Description"]], capacity: 2, attach: "Attachment 9(a)" },
  "p9.animalsCustodyList": { item: "Animal", fields: [["name", "Name"], ["ageType", "Age/Type"], ["sizeBreed", "Size/Breed"], ["color", "Color/Description"]], capacity: 2, attach: "Attachment 9(a)" },
  "p9.phones": { item: "Telephone number", fields: [["number", "Telephone Number and User"], ["provider", "Wireless Service Provider"], ["holder", "Current Account Holder"]], capacity: 2, attach: "Attachment 9(c)" },
  "conf.protected": { item: "Protected person", fields: [["name", "Name"], ["age", "Age"], ["dob", "Date of Birth"], ["sex", "Sex"], ["race", "Race"]] },
  "conf.others": { item: "Person", fields: [["name", "Name"], ["age", "Age"], ["race", "Race"], ["sex", "Sex"]] }
};
PR.FIREARMS_CAPACITY = 6; // lines printed on the form before Attachment 9(b)
PR.MAX_PROTECTED = 9;     // IDACS/NCIC limit per order (PO-0102 p.4)
