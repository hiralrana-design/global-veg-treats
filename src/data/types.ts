export type Cuisine =
  | "north-indian"
  | "south-indian"
  | "mexican"
  | "japanese"
  | "chinese"
  | "european"
  | "american"
  | "thai"
  | "korean"
  | "greek"
  | "middle-east-african"
  | "vietnamese"
  | "mediterranean"
  | "dessert";

export type Method = "gas" | "oven" | "airfryer";

export type Ingredient = {
  name: string;
  quantity: string;
  keyword: string;
  note?: string;
};

export type Recipe = {
  id: string;
  title: string;
  cuisine: Cuisine;
  methods: Method[];
  noOnionNoGarlic: boolean;
  time: string;
  serves: string;
  heroKeyword: string;
  tagline: string;
  description: string;
  ingredients: Ingredient[];
  steps: string[];
  experimentalNote?: string;
};

export const CUISINES: { id: Cuisine; label: string; blurb: string }[] = [
  { id: "north-indian", label: "North Indian", blurb: "Buttery gravies, tandoor smoke, cardamom warmth." },
  { id: "south-indian", label: "South Indian", blurb: "Fermented batters, coconut, curry leaves crackling in oil." },
  { id: "mexican", label: "Mexican", blurb: "Charred chilies, lime, corn and beans reimagined." },
  { id: "japanese", label: "Japanese", blurb: "Umami, dashi-free broths, precise vegetable craft." },
  { id: "chinese", label: "Chinese", blurb: "Wok breath, black vinegar, silky tofu." },
  { id: "european", label: "European", blurb: "Slow braises, herbed butters, rustic bakes." },
  { id: "american", label: "American", blurb: "Comfort classics, smoke, melt and crunch." },
  { id: "thai", label: "Thai", blurb: "Coconut, lemongrass, bird's-eye chili balance." },
  { id: "korean", label: "Korean", blurb: "Gochujang glow, sesame, pickled crunch." },
  { id: "greek", label: "Greek", blurb: "Olive oil, oregano, sunbaked tomatoes." },
  { id: "middle-east-african", label: "Middle East & African", blurb: "Za'atar, berbere, tahini and preserved lemon." },
  { id: "vietnamese", label: "Vietnamese", blurb: "Herb bouquets, rice paper, bright broths." },
  { id: "mediterranean", label: "Mediterranean", blurb: "Sea air, capers, coastal simplicity." },
  { id: "dessert", label: "Desserts of the World", blurb: "Puddings, pastries and frozen things from every coast." },
];

export const METHOD_LABEL: Record<Method, string> = {
  gas: "Gas Stove",
  oven: "Oven",
  airfryer: "Air Fryer",
};

// ---------- helpers ----------
const slug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").split("-")[0];

/** Ingredient shorthand: i(name, quantity, keywordOverride?, note?) */
export const i = (
  name: string,
  quantity: string,
  keyword?: string,
  note?: string
): Ingredient => ({ name, quantity, keyword: keyword ?? slug(name), note });

/** Deterministic Flickr-sourced food photo for a keyword. */
export function photoFor(keyword: string, w = 400, h = 400, lock = 1): string {
  const kw = encodeURIComponent(keyword.trim().replace(/\s+/g, ","));
  return `https://loremflickr.com/${w}/${h}/${kw}?lock=${lock}`;
}
