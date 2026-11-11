import { gear, projects } from "@/content";

export type SectionEntry = {
  id: string;
  /** Shown before the label in the index: "01", "··" or empty. */
  num: string;
  label: string;
  /** Facts shown on the right rail while this section is in view. */
  rail?: { label: string; value: string }[];
};

/** Main index: the story of the page, in order. */
export const mainSections: SectionEntry[] = [
  { id: "top", num: "00", label: "Home" },
  { id: "about", num: "01", label: "About" },
  { id: "education", num: "02", label: "Education", rail: [{ label: "School", value: "University of San Agustin" }, { label: "Program", value: "BSIT, 3rd year" }] },
  { id: "skills", num: "03", label: "Skills" },
  { id: "projects", num: "04", label: "Projects", rail: [{ label: "Projects", value: String(projects.length) }] },
  { id: "activity", num: "··", label: "Activity" },
];

/** Everything that used to sit at the end of the page lives under "Other". */
export const otherSections: SectionEntry[] = [
  { id: "services", num: "", label: "Work with me" },
  { id: "gear", num: "", label: "Gear", rail: [{ label: "Items", value: String(gear.length) }] },
  { id: "explore", num: "", label: "More" },
  { id: "guestbook", num: "", label: "Guestbook" },
  { id: "contact", num: "", label: "Contact" },
];

export const allSections = [...mainSections, ...otherSections];
