export const person = {
  name: "Kervin Sarmiento",
  role: "Student developer",
  summary: "I build web apps and Roblox games, and I'm studying at USA.",
  initials: "KS",
};

export const about = [
  { title: "Education", text: "BS Information Technology, 3rd year, at the University of San Agustin, Iloilo (USA)." },
  { title: "Building", text: "My Mind Bridge capstone, a student wellness platform, and the ACUA storefront with PayMongo and GCash checkout." },
  { title: "Games", text: "I build Roblox games in Roblox Studio with Luau, like Anime Pet Simulator, and I like turning anime ideas into playable games." },
];

export const mindset = {
  heading: "Mindset",
  text: "I like to understand the problem first, then build something clear and reliable.",
  closing: "Still learning: full-stack development, Luau and networking basics.",
  // Cards in the cycling stack: real project screenshots, plus a Roblox card for the game.
  stack: [
    { label: "Mind Bridge", image: "/projects/mind-bridge.jpg", position: "left top" },
    { label: "ACUA", image: "/projects/acua.jpg", position: "center top" },
    { label: "Anime Pet Simulator", image: "/projects/anime-pet-simulator.jpg", position: "center" },
  ],
};

export const craft = {
  heading: "Craft",
  text: "I build web apps and game systems that work for real users.",
  closing: "Open for internships and collaborations on Roblox games and student-focused web projects.",
  status: "Open for internships",
  strips: [
    ["tailwindcss", "typescript", "react", "vite", "supabase", "firebase", "git"],
    ["github", "vercel", "gsap", "framer", "figma", "robloxstudio", "cisco", "lua", "nodedotjs", "javascript", "html5", "css"],
  ],
};

export const location = { city: "Iloilo City", country: "Philippines", coords: "10.7202° N, 122.5621° E", timezone: "GMT+8" };

export const projects = [
  {
    n: "01",
    category: "Capstone",
    title: "Mind Bridge",
    summary: "A student wellness platform with assessments, counseling requests and scheduling. Still in active development.",
    tags: ["Wellness", "Scheduling", "In development"],
    href: "https://mind-bridge-omega.vercel.app",
    tone: "from-emerald-700 to-teal-900",
    image: "/projects/mind-bridge.jpg",
    imageAlt: "Mind Bridge landing page: Ask for help quietly, reach a counselor sooner, with the four steps from check-in to chat.",
    imagePosition: "left top",
  },
  {
    n: "02",
    category: "Storefront",
    title: "ACUA website",
    summary: "A storefront with online checkout through PayMongo and GCash, plus a custom commission flow. Still in active development.",
    tags: ["PayMongo", "GCash", "In development"],
    href: "https://acua-three.vercel.app",
    tone: "from-indigo-600 to-violet-900",
    image: "/projects/acua.jpg",
    imageAlt: "ACUA storefront hero over rippling water: From Isla to City, handcrafted accessories.",
    imagePosition: "center top",
  },
  {
    n: "03",
    category: "Roblox game",
    title: "Anime Pet Simulator",
    summary: "A Pet Simulator-style Roblox game built around anime characters and pets. In development.",
    tags: ["Roblox Studio", "Luau", "In development"],
    href: "",
    tone: "from-rose-700 to-fuchsia-900",
    image: "/projects/anime-pet-simulator.jpg",
    imageAlt: "Anime Pet Simulator key art: chibi anime characters and cats in front of a red torii gate under cherry blossoms.",
    imagePosition: "center",
  },
];

// Only technologies that are real for Kervin: stated by him, or used in this site, Mind Bridge or ACUA.
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
  { name: "GSAP", kind: "tools" },
  { name: "Framer", kind: "tools" },
  { name: "Framer Motion", kind: "tools" },
  { name: "Storybook", kind: "tools" },
  { name: "Vitest", kind: "tools" },
  { name: "Playwright", kind: "tools" },
  { name: "Recharts", kind: "tools" },
  { name: "Zod", kind: "tools" },
  { name: "Figma", kind: "game" },
  { name: "Canva", kind: "game" },
];

export const skillRowBelow: { name: string; kind: SkillKind }[] = [
  { name: "Node.js", kind: "backend" },
  { name: "Supabase", kind: "backend" },
  { name: "PostgreSQL", kind: "backend" },
  { name: "Firebase", kind: "backend" },
  { name: "Firestore", kind: "backend" },
  { name: "Cloud Functions", kind: "backend" },
  { name: "Nodemailer", kind: "backend" },
  { name: "Gemini API", kind: "game" },
  { name: "PayMongo", kind: "game" },
  { name: "GCash", kind: "game" },
  { name: "Roblox Studio", kind: "game" },
  { name: "Lua", kind: "game" },
  { name: "Luau", kind: "game" },
  { name: "SQL", kind: "backend" },
  { name: "Cisco", kind: "tools" },
  { name: "Networking basics", kind: "tools" },
  { name: "Vercel", kind: "tools" },
  { name: "Git", kind: "tools" },
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

export const explore = [
  { title: "Resume", text: "CV coming soon.", href: "", tone: "text-accent" },
  { title: "Links", text: "My GitHub profile.", href: "https://github.com/IkariShinjiii", tone: "text-accent2" },
  { title: "Contact", text: "Say hello.", href: "#contact", tone: "text-accent" },
];

export const contact = { email: "kervinsarmiento2.0@gmail.com", github: "https://github.com/IkariShinjiii" };
