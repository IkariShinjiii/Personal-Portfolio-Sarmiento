import type { GearItem } from "@/components/GearCarousel";

export const person = {
  name: "Kervin Sarmiento",
  role: "Full-stack web developer",
  summary: "I build web apps and desktop apps like Gabay, and I'm studying at USA.",
  initials: "KS",
};

export const about = [
  { title: "Education", text: "BS Information Technology, 3rd year, at the University of San Agustin, Iloilo (USA)." },
  { title: "Building", text: "Mind Bridge, my capstone. ACUA, a storefront with GCash checkout. Gabay, a free Windows notch app, now open source. Kape Lokal, a cafe map of Iloilo. Ñuwave, a QR menu for a coffee shop." },
  { title: "Side hobby", text: "For fun I make Roblox games in Roblox Studio, like Anime Pet Simulator. It is a hobby outside my client and school work." },
];

// Newest first. Logos are optional: leave `logo` empty to show the school's initials.
export const education = [
  {
    title: "Bachelor of Science in Information Technology (BSIT)",
    logo: "",
    school: "University of San Agustin",
    detail: "3rd-Year Undergraduate Student",
    years: "2024 - Present",
    place: "Iloilo City, Philippines",
    focus: "Web Systems Development, Full-Stack Architecture, Database Systems, Object-Oriented Programming",
  },
  {
    title: "Senior High School, STEM Track",
    logo: "",
    school: "University of San Agustin",
    detail: "",
    years: "2022 - 2024",
    place: "Iloilo City, Philippines",
    focus: "STEM",
  },
  {
    title: "Junior High School",
    logo: "",
    school: "Georgia International Academy",
    detail: "",
    years: "2018 - 2022",
    place: "Iloilo City, Philippines",
    focus: "",
  },
];

export const mindset = {
  heading: "Mindset",
  text: "I like to understand the problem first, then build something clear and reliable.",
  closing: "Still learning: full-stack development and networking basics.",
  // Cards in the hover-cycled stack: real project screenshots.
  stack: [
    { label: "Mind Bridge", image: "/projects/mind-bridge.jpg", position: "left top" },
    { label: "ACUA", image: "/projects/acua.jpg", position: "center top" },
    { label: "Anime Pet Simulator", image: "/projects/anime-pet-simulator.jpg", position: "center" },
    { label: "Gabay", image: "/projects/gabay.jpg", position: "center" },
  ],
};

export const craft = {
  heading: "Craft",
  text: "I build web apps and desktop apps that work for real users.",
  closing: "Open for freelance projects and internships: web apps, desktop apps and student-focused sites.",
  status: "Open for freelance work",
  strips: [
    ["tailwindcss", "typescript", "react", "vite", "supabase", "firebase", "git"],
    ["github", "vercel", "gsap", "framer", "figma", "robloxstudio", "cisco", "lua", "nodedotjs", "javascript", "html5", "css"],
  ],
};

export const location = { city: "Iloilo City", country: "Philippines", coords: "10.7202° N, 122.5621° E", timezone: "GMT+8" };

export const services = [
  {
    title: "Websites & landing pages",
    text: "Fast, mobile-friendly sites for shops, small businesses and events, like the QR menu I built for a Jaro coffee shop.",
    tags: ["React", "Next.js", "Tailwind"],
  },
  {
    title: "Web apps",
    text: "Sign-in, databases, booking, maps and GCash payments, like Mind Bridge, ACUA and Kape Lokal.",
    tags: ["TypeScript", "Supabase", "Firebase"],
  },
  {
    title: "Desktop apps",
    text: "Windows apps with a clean interface, built with Electron and React, like Gabay.",
    tags: ["Electron", "React", "Windows"],
  },
];

export const projects = [
  {
    n: "01",
    category: "Capstone",
    title: "Mind Bridge",
    summary: "A student wellness platform for USA: private check-ins, counselor booking and confidential chat, with a breathing reset and a printable result summary. Still in active development.",
    tags: ["Firebase", "Role-based access", "In development"],
    href: "https://mind-bridge-omega.vercel.app",
    tone: "from-red-800 to-rose-950",
    image: "/projects/mind-bridge.jpg",
    imageAlt: "Mind Bridge landing page in the University of San Agustin crimson: Ask for help quietly, reach a counselor sooner, with the four steps from check-in to chat.",
    imagePosition: "left top",
  },
  {
    n: "02",
    category: "Storefront",
    title: "ACUA website",
    summary: "A storefront for handmade accessories with GCash and bank-transfer checkout, a custom commission flow, an admin dashboard, newsletters and an AI concierge. Still in active development.",
    tags: ["Supabase", "GCash", "In development"],
    href: "https://acua-three.vercel.app",
    tone: "from-indigo-600 to-violet-900",
    image: "/projects/acua.jpg",
    imageAlt: "ACUA storefront hero over rippling water: From Isla to City, handcrafted accessories.",
    imagePosition: "center top",
  },
  {
    n: "03",
    category: "Desktop app",
    title: "Gabay",
    summary: "A free, open-source Windows app that folds the taskbar into an iPhone-style notch, with a dock, launcher, clipboard, notes, timers and weather one hover away. Now at version 1.4 with automatic updates.",
    tags: ["Electron", "TypeScript", "Open source"],
    href: "https://gabay-site-plum.vercel.app",
    tone: "from-teal-700 to-slate-900",
    image: "/projects/gabay.jpg",
    imageAlt: "Gabay title screen: Your Windows taskbar, folded into a notch, with the notch showing time, weather and battery at the top.",
    imagePosition: "center",
  },
  {
    n: "04",
    category: "Web app",
    title: "Kape Lokal",
    summary: "A local cafe finder for Iloilo City: a dark map of independent cafes, filters for specialty coffee and matcha, menus, and Directions in Google Maps. In English and Filipino.",
    tags: ["Next.js", "MapLibre", "In development"],
    href: "https://kape-lokal.vercel.app",
    tone: "from-orange-700 to-stone-900",
    image: "/projects/kape-lokal.jpg",
    imageAlt: "Kape Lokal map of Iloilo City on a dark basemap, with cafe pins and filters for Specialty, Matcha, Has menu and Include chains.",
    imagePosition: "center",
  },
  {
    n: "05",
    category: "Side hobby",
    title: "Anime Pet Simulator",
    summary: "A hobby project: a Pet Simulator-style Roblox game built around anime characters and pets. In development.",
    tags: ["Roblox Studio", "Luau", "In development"],
    href: "",
    tone: "from-rose-700 to-fuchsia-900",
    image: "/projects/anime-pet-simulator.jpg",
    imageAlt: "Anime Pet Simulator key art: chibi anime characters and cats in front of a red torii gate under cherry blossoms.",
    imagePosition: "center",
  },
];

// Only technologies that are real for Kervin: stated by him, or used in this site, Mind Bridge, ACUA, Gabay or Kape Lokal.
export type SkillKind = "frontend" | "backend" | "tools" | "game";

export const SKILL_COLORS: Record<SkillKind, string> = {
  frontend: "#3ddc84",
  backend: "#f5b942",
  tools: "#7c9cff",
  game: "#f27ba8",
};

export const skillRowAbove: { name: string; kind: SkillKind }[] = [
  { name: "React", kind: "frontend" },
  { name: "TypeScript", kind: "frontend" },
  { name: "JavaScript", kind: "frontend" },
  { name: "HTML5", kind: "frontend" },
  { name: "CSS", kind: "frontend" },
  { name: "Tailwind CSS", kind: "frontend" },
  { name: "Vite", kind: "frontend" },
  { name: "Next.js", kind: "frontend" },
  { name: "Electron", kind: "frontend" },
  { name: "GSAP", kind: "tools" },
  { name: "Framer", kind: "tools" },
  { name: "Framer Motion", kind: "tools" },
  { name: "Storybook", kind: "tools" },
  { name: "Vitest", kind: "tools" },
  { name: "Playwright", kind: "tools" },
  { name: "Recharts", kind: "tools" },
  { name: "MapLibre", kind: "tools" },
  { name: "Zod", kind: "tools" },
  { name: "Figma", kind: "game" },
  { name: "Canva", kind: "game" },
];

export const skillRowBelow: { name: string; kind: SkillKind }[] = [
  { name: "Node.js", kind: "backend" },
  { name: "Supabase", kind: "backend" },
  { name: "PostgreSQL", kind: "backend" },
  { name: "PostGIS", kind: "backend" },
  { name: "Firebase", kind: "backend" },
  { name: "Firestore", kind: "backend" },
  { name: "Cloud Functions", kind: "backend" },
  { name: "Nodemailer", kind: "backend" },
  { name: "Gemini API", kind: "game" },
  { name: "GCash", kind: "game" },
  { name: "Roblox Studio", kind: "game" },
  { name: "Lua", kind: "game" },
  { name: "Luau", kind: "game" },
  { name: "SQL", kind: "backend" },
  { name: "Cisco", kind: "tools" },
  { name: "Networking basics", kind: "tools" },
  { name: "Accessibility", kind: "tools" },
  { name: "Vercel", kind: "tools" },
  { name: "Git", kind: "tools" },
  { name: "GitHub Actions", kind: "tools" },
  { name: "GitHub", kind: "tools" },
];

/** Logos on the sphere: slug in BRAND_ICONS plus the label shown when it faces the viewer. */
export const sphereIcons = [
  { slug: "react", name: "React" },
  { slug: "typescript", name: "TypeScript" },
  { slug: "javascript", name: "JavaScript" },
  { slug: "html5", name: "HTML5" },
  { slug: "css", name: "CSS" },
  { slug: "tailwindcss", name: "Tailwind CSS" },
  { slug: "vite", name: "Vite" },
  { slug: "gsap", name: "GSAP" },
  { slug: "framer", name: "Framer" },
  { slug: "storybook", name: "Storybook" },
  { slug: "vitest", name: "Vitest" },
  { slug: "nodedotjs", name: "Node.js" },
  { slug: "supabase", name: "Supabase" },
  { slug: "firebase", name: "Firebase" },
  { slug: "vercel", name: "Vercel" },
  { slug: "git", name: "Git" },
  { slug: "github", name: "GitHub" },
  { slug: "robloxstudio", name: "Roblox Studio" },
  { slug: "cisco", name: "Cisco" },
  { slug: "lua", name: "Lua / Luau" },
  { slug: "figma", name: "Figma" },
];

/** Hardware and tools I use. The Gear section stays hidden until this list has entries. */
export const gear: GearItem[] = [
  { name: "ASUS TUF Gaming F15", category: "Laptop", note: "Where I build and test everything.", image: "/gear/asus-tuf-f15.webp", tag: "Daily driver", accent: "#f59e0b" },
  { name: "RK65", category: "Keyboard", note: "65% wireless board for coding.", image: "/gear/rk-rk65.webp", accent: "#3b82f6" },
  { name: "Skyloong SK61", category: "Keyboard", note: "Compact 60% with RGB.", image: "/gear/skyloong-sk61.webp", accent: "#ec4899" },
  { name: "Logitech G305", category: "Mouse", note: "Reliable wireless mouse.", image: "/gear/logitech-g305.webp", accent: "#10b981" },
  { name: "Attack Shark X6", category: "Mouse", note: "Ultralight wireless mouse.", image: "/gear/attack-shark-x6.webp", accent: "#14b8a6" },
  { name: "AOC Gaming 27G42E", category: "Monitor", note: "27 inch 180Hz IPS.", image: "/gear/aoc-27g42e.webp", accent: "#f43f5e" },
  { name: "AOC 27B30H3", category: "Monitor", note: "27 inch 120Hz IPS.", image: "/gear/aoc-27b30h3.webp", accent: "#8b5cf6" },
];

export const explore: { title: string; text: string; href: string; tone: string; newTab?: boolean }[] = [
  { title: "Resume", text: "Download my CV (PDF).", href: "/Kervin_Sarmiento_Resume.pdf", newTab: true, tone: "text-accent" },
  { title: "Links", text: "My GitHub and Instagram.", href: "https://github.com/IkariShinjiii", tone: "text-accent2" },
  { title: "Contact", text: "Say hello.", href: "#contact", tone: "text-accent" },
];

export const contact = {
  email: "kervinsarmiento2.0@gmail.com",
  github: "https://github.com/IkariShinjiii",
  instagram: "https://instagram.com/__oddyseus__",
};
