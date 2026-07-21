import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CUISINES, METHOD_LABEL, RECIPES, type Cuisine, type Method, type Recipe } from "@/data/recipes";

export const Route = createFileRoute("/")({
  component: Home,
});

const FAV_KEY = "tek.favs.v1";

function useFavorites() {
  const [favs, setFavs] = useState<Set<string>>(new Set());
  useEffect(() => {
    try {
      const raw = localStorage.getItem(FAV_KEY);
      if (raw) setFavs(new Set(JSON.parse(raw)));
    } catch {}
  }, []);
  const toggle = (id: string) => {
    setFavs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        localStorage.setItem(FAV_KEY, JSON.stringify([...next]));
      } catch {}
      return next;
    });
  };
  return { favs, toggle };
}

function Home() {
  const [query, setQuery] = useState("");
  const [ngoFilter, setNgoFilter] = useState<"all" | "ngo">("all");
  const [methodFilter, setMethodFilter] = useState<"all" | Method>("all");
  const [cuisineFilter, setCuisineFilter] = useState<"all" | Cuisine>("all");
  const [onlyFavs, setOnlyFavs] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const { favs, toggle } = useFavorites();

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const q = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    return RECIPES.filter((r) => {
      if (ngoFilter === "ngo" && !r.noOnionNoGarlic) return false;
      if (methodFilter !== "all" && !r.methods.includes(methodFilter)) return false;
      if (cuisineFilter !== "all" && r.cuisine !== cuisineFilter) return false;
      if (onlyFavs && !favs.has(r.id)) return false;
      if (q) {
        const hay = (
          r.title +
          " " +
          r.tagline +
          " " +
          r.ingredients.map((i) => i.name).join(" ")
        ).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [ngoFilter, methodFilter, cuisineFilter, onlyFavs, favs, q]);

  const byCuisine = (c: Cuisine) => filtered.filter((r) => r.cuisine === c);
  const activeChapters = CUISINES.filter(
    (c) => (cuisineFilter === "all" || cuisineFilter === c.id) && byCuisine(c.id).length > 0
  );

  const clearFilters = () => {
    setQuery("");
    setNgoFilter("all");
    setMethodFilter("all");
    setCuisineFilter("all");
    setOnlyFavs(false);
  };
  const anyActive =
    query !== "" || ngoFilter !== "all" || methodFilter !== "all" || cuisineFilter !== "all" || onlyFavs;

  return (
    <div className="min-h-screen paper-grain">
      <header className="relative overflow-hidden border-b border-border">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 pt-16 pb-6 md:grid-cols-2 md:pt-24 md:pb-8">
          <div className="flex flex-col justify-center">
            <p className="mb-4 text-xs uppercase tracking-[0.28em] text-primary">
              Volume 01 · The Experimental Kitchen
            </p>
            <h1 className="text-5xl leading-[1.02] md:text-7xl">
              A world cookbook,
              <br />
              <span className="italic text-primary">eggless</span> and pure vegetarian.
            </h1>
            <p className="mt-6 max-w-lg text-base text-muted-foreground md:text-lg">
              Thirteen cuisines and a globe of desserts, all cooked without egg or meat.
              Filter for no-onion / no-garlic, or by whether you're at a gas flame,
              inside an oven or in an air fryer.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 text-sm">
              <span className="rounded-full border border-primary bg-primary px-4 py-2 text-primary-foreground">
                {RECIPES.length} recipes
              </span>
              <span className="rounded-full border border-primary bg-primary px-4 py-2 text-primary-foreground">
                {RECIPES.filter((r) => r.noOnionNoGarlic).length} no onion · no garlic
              </span>
              <span className="rounded-full border border-primary bg-primary px-4 py-2 text-primary-foreground">
                {RECIPES.filter((r) => r.cuisine === "dessert").length} desserts
              </span>
            </div>
          </div>
          <div className="relative hidden md:block">
            <div className="flex aspect-[4/3] w-full items-center justify-center rounded-lg border border-border bg-card p-10 text-center shadow-2xl">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-primary">Chapter open</p>
                <p className="mt-3 font-display text-3xl italic leading-snug">On smoke, salt & silence</p>
                <p className="mt-4 text-sm text-muted-foreground">Notes from a kitchen where nothing runs from an egg or an animal.</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Sticky control bar */}
      <section className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 py-3">
          <div className="flex flex-wrap items-center gap-3">
            <label className="relative flex min-w-[220px] flex-1 items-center">
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" strokeLinecap="round" />
              </svg>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search recipes, ingredients, moods…"
                className="w-full rounded-full border border-border bg-card py-2 pl-9 pr-9 text-sm outline-none placeholder:text-muted-foreground/70 focus:border-primary"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="absolute right-3 text-muted-foreground hover:text-primary"
                >
                  ×
                </button>
              )}
            </label>

            <Chip active={onlyFavs} onClick={() => setOnlyFavs((v) => !v)}>
              ♥ Saved {favs.size > 0 && <span className="opacity-70">({favs.size})</span>}
            </Chip>

            {anyActive && (
              <button
                onClick={clearFilters}
                className="text-xs uppercase tracking-widest text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
              >
                Reset
              </button>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-4">
            <FilterGroup label="Dietary">
              <Chip active={ngoFilter === "all"} onClick={() => setNgoFilter("all")}>All vegetarian</Chip>
              <Chip active={ngoFilter === "ngo"} onClick={() => setNgoFilter("ngo")}>No onion · No garlic</Chip>
            </FilterGroup>
            <FilterGroup label="Cooked on">
              <Chip active={methodFilter === "all"} onClick={() => setMethodFilter("all")}>Any</Chip>
              {(["gas", "oven", "airfryer"] as Method[]).map((m) => (
                <Chip key={m} active={methodFilter === m} onClick={() => setMethodFilter(m)}>
                  {METHOD_LABEL[m]}
                </Chip>
              ))}
            </FilterGroup>
            <FilterGroup label="Cuisine">
              <select
                value={cuisineFilter}
                onChange={(e) => setCuisineFilter(e.target.value as Cuisine | "all")}
                className="rounded-full border border-border bg-card px-4 py-1.5 text-sm"
              >
                <option value="all">Every kitchen</option>
                {CUISINES.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </FilterGroup>
            <p className="ml-auto text-xs uppercase tracking-widest text-muted-foreground">
              {filtered.length} of {RECIPES.length}
            </p>
          </div>

          {/* Chapter quick nav */}
          {activeChapters.length > 1 && (
            <nav className="mt-3 -mx-6 overflow-x-auto border-t border-border/60 px-6 py-2">
              <ul className="flex min-w-max gap-1 text-xs uppercase tracking-widest">
                {activeChapters.map((c) => (
                  <li key={c.id}>
                    <a
                      href={`#chapter-${c.id}`}
                      className="inline-block whitespace-nowrap rounded-full px-3 py-1 text-muted-foreground transition hover:bg-card hover:text-primary"
                    >
                      {c.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-6 pt-16 pb-6">
        {activeChapters.map((c) => {
          const recipes = byCuisine(c.id);
          return (
            <section key={c.id} id={`chapter-${c.id}`} className="mb-16 scroll-mt-40 last:mb-0">
              <div className="mb-8 flex items-end justify-between gap-6 border-b border-border pb-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-primary">Chapter</p>
                  <h2 className="mt-2 text-3xl md:text-4xl">{c.label}</h2>
                  <p className="mt-2 max-w-xl text-sm text-muted-foreground">{c.blurb}</p>
                  <p className="mt-1 text-xs text-muted-foreground/70">{recipes.length} recipes</p>
                </div>
                <p className="hidden font-display text-4xl italic text-muted-foreground/40 md:block">
                  {String(CUISINES.indexOf(c) + 1).padStart(2, "0")}
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {recipes.map((r) => (
                  <RecipeCard
                    key={r.id}
                    recipe={r}
                    saved={favs.has(r.id)}
                    onToggleSave={() => toggle(r.id)}
                  />
                ))}
              </div>
            </section>
          );
        })}

        {filtered.length === 0 && (
          <div className="py-24 text-center">
            <p className="font-display text-2xl">Nothing here — yet.</p>
            <p className="mt-2 text-sm text-muted-foreground">Loosen a filter and the pages fill back up.</p>
            {anyActive && (
              <button
                onClick={clearFilters}
                className="mt-6 rounded-full border border-primary px-5 py-2 text-sm text-primary hover:bg-primary hover:text-primary-foreground"
              >
                Reset filters
              </button>
            )}
          </div>
        )}
      </main>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-primary">Published by</p>
              <p className="mt-3 font-display text-3xl italic">Hiral Rana</p>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                A private volume from an experimental home kitchen — eggless, vegetarian, curious.
              </p>
            </div>
            <div className="md:text-right">
              <p className="text-xs uppercase tracking-[0.28em] text-primary">Contact</p>
              <ul className="mt-3 space-y-1.5 text-sm">
                <li>
                  <a href="tel:+919978345660" className="hover:text-primary">+91 99783 45660</a>
                </li>
                <li>
                  <a href="mailto:ranahiral410@gmail.com" className="hover:text-primary">ranahiral410@gmail.com</a>
                </li>
                <li className="text-muted-foreground">Bhavnagar, Gujarat, India</li>
              </ul>
            </div>
          </div>
          <p className="mt-10 border-t border-border pt-6 text-center text-xs uppercase tracking-widest text-muted-foreground">
            © {new Date().getFullYear()} Hiral Rana · The Experimental Kitchen
          </p>
        </div>
      </footer>

      {/* Scroll-to-top */}
      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
          className="fixed bottom-6 right-6 z-30 grid h-11 w-11 place-items-center rounded-full border border-border bg-card text-primary shadow-lg transition hover:bg-primary hover:text-primary-foreground"
        >
          ↑
        </button>
      )}
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs uppercase tracking-widest text-muted-foreground">{label}</span>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3.5 py-1.5 text-sm transition ${
        active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary/50"
      }`}
    >
      {children}
    </button>
  );
}

function RecipeCard({
  recipe,
  saved,
  onToggleSave,
}: {
  recipe: Recipe;
  saved: boolean;
  onToggleSave: () => void;
}) {
  return (
    <div className="group relative overflow-hidden rounded-lg border border-border bg-card transition hover:shadow-xl">
      <button
        onClick={onToggleSave}
        aria-label={saved ? "Remove from saved" : "Save recipe"}
        className={`absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full border border-border bg-background/80 backdrop-blur transition ${
          saved ? "text-primary" : "text-muted-foreground hover:text-primary"
        }`}
      >
        <span className="text-lg leading-none">{saved ? "♥" : "♡"}</span>
      </button>
      <Link
        to="/recipe/$id"
        params={{ id: recipe.id }}
        className="block"
      >
        <div className="flex flex-wrap gap-1.5 border-b border-border px-5 pt-5">
          {recipe.noOnionNoGarlic && (
            <span className="rounded-full bg-accent px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-widest text-accent-foreground">
              No onion · garlic
            </span>
          )}
          {recipe.methods.map((m) => (
            <span key={m} className="rounded-full border border-border bg-background/90 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-widest">
              {METHOD_LABEL[m]}
            </span>
          ))}
        </div>

        <div className="p-5">
          <p className="text-xs uppercase tracking-widest text-primary/70">
            {recipe.time} · Serves {recipe.serves}
          </p>
          <h3 className="mt-2 text-xl leading-tight group-hover:text-primary">{recipe.title}</h3>
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{recipe.tagline}</p>
          <p className="mt-4 inline-flex items-center gap-1 text-xs uppercase tracking-widest text-primary opacity-0 transition group-hover:opacity-100">
            Read recipe <span aria-hidden>→</span>
          </p>
        </div>
      </Link>
    </div>
  );
}
