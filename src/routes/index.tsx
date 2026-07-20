import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CUISINES, METHOD_LABEL, RECIPES, type Cuisine, type Method, type Recipe } from "@/data/recipes";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const [ngoFilter, setNgoFilter] = useState<"all" | "ngo">("all");
  const [methodFilter, setMethodFilter] = useState<"all" | Method>("all");
  const [cuisineFilter, setCuisineFilter] = useState<"all" | Cuisine>("all");

  const filtered = useMemo(() => {
    return RECIPES.filter((r) => {
      if (ngoFilter === "ngo" && !r.noOnionNoGarlic) return false;
      if (methodFilter !== "all" && !r.methods.includes(methodFilter)) return false;
      if (cuisineFilter !== "all" && r.cuisine !== cuisineFilter) return false;
      return true;
    });
  }, [ngoFilter, methodFilter, cuisineFilter]);

  const byCuisine = (c: Cuisine) => filtered.filter((r) => r.cuisine === c);

  return (
    <div className="min-h-screen paper-grain">
      <header className="relative overflow-hidden border-b border-border">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-2 md:py-24">
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
              <span className="rounded-full border border-border bg-card px-4 py-2">
                {RECIPES.length} recipes
              </span>
              <span className="rounded-full border border-border bg-card px-4 py-2">
                {RECIPES.filter((r) => r.noOnionNoGarlic).length} no onion · no garlic
              </span>
              <span className="rounded-full border border-border bg-card px-4 py-2">
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

      <section className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-6 py-4">
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
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-6 py-16">
        {CUISINES.filter((c) => cuisineFilter === "all" || cuisineFilter === c.id).map((c) => {
          const recipes = byCuisine(c.id);
          if (recipes.length === 0) return null;
          return (
            <section key={c.id} className="mb-20">
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
                {recipes.map((r) => <RecipeCard key={r.id} recipe={r} />)}
              </div>
            </section>
          );
        })}

        {filtered.length === 0 && (
          <div className="py-24 text-center">
            <p className="font-display text-2xl">Nothing here — yet.</p>
            <p className="mt-2 text-sm text-muted-foreground">Loosen a filter and the pages fill back up.</p>
          </div>
        )}
      </main>

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

function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <Link
      to="/recipe/$id"
      params={{ id: recipe.id }}
      className="group block overflow-hidden rounded-lg border border-border bg-card transition hover:shadow-xl"
    >
      <div className="border-b border-border px-5 pt-5 pb-4">
        <p className="font-display text-5xl italic text-primary/30">
          {String(recipe.title.charCodeAt(0) % 99).padStart(2, "0")}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {recipe.noOnionNoGarlic && (
            <span className="rounded-full bg-accent px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-widest text-accent-foreground">
              No onion · garlic
            </span>
          )}
          {recipe.methods.map((m) => (
            <span key={m} className="rounded-full border border-border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-widest">
              {METHOD_LABEL[m]}
            </span>
          ))}
        </div>
      </div>
      <div className="p-5">
        <p className="text-xs uppercase tracking-widest text-primary/70">
          {recipe.time} · Serves {recipe.serves}
        </p>
        <h3 className="mt-2 text-xl leading-tight group-hover:text-primary">{recipe.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{recipe.tagline}</p>
      </div>
    </Link>
  );
}
