import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CUISINES, METHOD_LABEL, RECIPES, getRecipe, type Recipe } from "@/data/recipes";

export const Route = createFileRoute("/recipe/$id")({
  loader: ({ params }): { recipe: Recipe } => {
    const recipe = getRecipe(params.id);
    if (!recipe) throw notFound();
    return { recipe };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Recipe not found" }, { name: "robots", content: "noindex" }] };
    }
    const r = loaderData.recipe;
    return {
      meta: [
        { title: `${r.title} — The Experimental Kitchen` },
        { name: "description", content: r.tagline },
        { property: "og:title", content: r.title },
        { property: "og:description", content: r.tagline },
      ],
    };
  },
  component: RecipePage,
  notFoundComponent: () => (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <p className="font-display text-3xl">This recipe has gone missing.</p>
        <Link to="/" className="mt-4 inline-block text-primary underline">Back to the book</Link>
      </div>
    </div>
  ),
});

const FAV_KEY = "tek.favs.v1";

function RecipePage() {
  const { recipe } = Route.useLoaderData() as { recipe: Recipe };
  const cuisine = CUISINES.find((c) => c.id === recipe.cuisine);

  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [doneSteps, setDoneSteps] = useState<Set<number>>(new Set());
  const [saved, setSaved] = useState(false);

  // Prev / Next within the same cuisine
  const { prev, next } = useMemo(() => {
    const list = RECIPES.filter((r) => r.cuisine === recipe.cuisine);
    const i = list.findIndex((r) => r.id === recipe.id);
    return {
      prev: i > 0 ? list[i - 1] : null,
      next: i >= 0 && i < list.length - 1 ? list[i + 1] : null,
    };
  }, [recipe]);

  useEffect(() => {
    setChecked(new Set());
    setDoneSteps(new Set());
    try {
      const raw = localStorage.getItem(FAV_KEY);
      const list: string[] = raw ? JSON.parse(raw) : [];
      setSaved(list.includes(recipe.id));
    } catch {}
    window.scrollTo({ top: 0 });
  }, [recipe.id]);

  const toggleSave = () => {
    try {
      const raw = localStorage.getItem(FAV_KEY);
      const list: string[] = raw ? JSON.parse(raw) : [];
      const next = list.includes(recipe.id)
        ? list.filter((x) => x !== recipe.id)
        : [...list, recipe.id];
      localStorage.setItem(FAV_KEY, JSON.stringify(next));
      setSaved(next.includes(recipe.id));
    } catch {}
  };

  const toggleIngredient = (i: number) => {
    setChecked((prev) => {
      const n = new Set(prev);
      n.has(i) ? n.delete(i) : n.add(i);
      return n;
    });
  };
  const toggleStep = (i: number) => {
    setDoneSteps((prev) => {
      const n = new Set(prev);
      n.has(i) ? n.delete(i) : n.add(i);
      return n;
    });
  };
  const progress = Math.round((doneSteps.size / Math.max(recipe.steps.length, 1)) * 100);

  return (
    <div className="min-h-screen paper-grain">
      <div className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur print:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
          <Link to="/" className="text-xs uppercase tracking-[0.28em] text-muted-foreground hover:text-primary md:text-sm">
            ← The Experimental Kitchen
          </Link>
          <div className="flex items-center gap-2">
            <span className="hidden text-xs uppercase tracking-[0.28em] text-primary sm:inline">
              {cuisine?.label}
            </span>
            <button
              onClick={toggleSave}
              aria-label={saved ? "Remove from saved" : "Save recipe"}
              className={`grid h-9 w-9 place-items-center rounded-full border border-border bg-card transition hover:border-primary ${
                saved ? "text-primary" : "text-muted-foreground"
              }`}
            >
            <svg aria-hidden viewBox="0 0 24 24" className={`h-5 w-5 transition ${saved ? "fill-primary text-primary" : "fill-none text-current"}`} stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            </button>
            <button
              onClick={() => window.print()}
              aria-label="Print recipe"
              className="hidden h-9 rounded-full border border-border bg-card px-3 text-xs uppercase tracking-widest text-muted-foreground transition hover:border-primary hover:text-primary sm:inline-flex sm:items-center"
            >
              Print
            </button>
          </div>
        </div>
      </div>

      <article className="mx-auto max-w-6xl px-6 py-14">
        <header className="border-b border-border pb-10">
          <p className="text-xs uppercase tracking-[0.28em] text-primary">
            {recipe.time} · Serves {recipe.serves}
          </p>
          <h1 className="mt-4 text-5xl leading-[1.05] md:text-6xl">{recipe.title}</h1>
          <p className="mt-6 max-w-2xl font-display text-xl italic text-muted-foreground">{recipe.tagline}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {recipe.noOnionNoGarlic && (
              <span className="rounded-full bg-accent px-3 py-1 text-xs font-medium uppercase tracking-widest text-accent-foreground">
                No onion · No garlic
              </span>
            )}
            {recipe.methods.map((m) => (
              <span key={m} className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium uppercase tracking-widest">
                {METHOD_LABEL[m]}
              </span>
            ))}
          </div>
        </header>

        <div className="mt-12 grid gap-14 md:grid-cols-[2fr_3fr]">
          <aside className="md:sticky md:top-24 md:self-start">
            <div className="mb-4 flex items-baseline justify-between">
              <h2 className="text-2xl">Ingredients</h2>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                {checked.size}/{recipe.ingredients.length}
              </p>
            </div>
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {recipe.ingredients.map((ing, idx) => {
                const isChecked = checked.has(idx);
                return (
                  <li key={idx}>
                    <button
                      onClick={() => toggleIngredient(idx)}
                      className={`w-full rounded-lg border p-3 text-left transition ${
                        isChecked
                          ? "border-primary/30 bg-card/60 opacity-60"
                          : "border-border bg-card hover:border-primary/40"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span
                          className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded border transition ${
                            isChecked ? "border-primary bg-primary text-primary-foreground" : "border-border"
                          }`}
                        >
                          {isChecked && (
                            <svg aria-hidden viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3">
                              <path d="M20 6L9 17l-5-5" />
                            </svg>
                          )}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className={`text-sm font-medium leading-tight ${isChecked ? "line-through" : ""}`}>
                            {ing.name}
                          </p>
                          <p className="mt-1 text-[10px] uppercase tracking-widest text-primary/80">
                            {ing.quantity}
                          </p>
                          {ing.note && (
                            <p className="mt-1 text-[11px] italic leading-tight text-muted-foreground">{ing.note}</p>
                          )}
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>

          <div>
            <section className="mb-10">
              <h2 className="mb-4 text-2xl">The dish</h2>
              <p className="text-base leading-relaxed text-foreground/85">{recipe.description}</p>
            </section>

            <section>
              <div className="mb-6 flex items-baseline justify-between">
                <h2 className="text-2xl">Method</h2>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">{progress}% cooked</p>
              </div>
              <div className="mb-6 h-1 w-full overflow-hidden rounded-full bg-border/60">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <ol className="space-y-4">
                {recipe.steps.map((step, idx) => {
                  const done = doneSteps.has(idx);
                  return (
                    <li key={idx}>
                      <button
                        onClick={() => toggleStep(idx)}
                        className={`flex w-full gap-5 rounded-lg border p-4 text-left transition ${
                          done
                            ? "border-primary/30 bg-card/60"
                            : "border-transparent hover:border-border hover:bg-card"
                        }`}
                      >
                        <span
                          className={`font-display text-4xl italic transition ${
                            done ? "text-primary/30 line-through" : "text-primary/60"
                          }`}
                        >
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <p
                          className={`flex-1 pt-2 leading-relaxed transition ${
                            done ? "text-foreground/40 line-through" : "text-foreground/85"
                          }`}
                        >
                          {step}
                        </p>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </section>

            {recipe.experimentalNote && (
              <section className="mt-10 rounded-lg border-l-4 border-primary bg-card p-6">
                <p className="text-xs uppercase tracking-[0.28em] text-primary">Experimental note</p>
                <p className="mt-3 font-display text-lg italic leading-relaxed">{recipe.experimentalNote}</p>
              </section>
            )}
          </div>
        </div>

        {/* Prev / Next within cuisine */}
        {(prev || next) && (
          <nav className="mt-16 grid gap-4 border-t border-border pt-8 sm:grid-cols-2">
            {prev ? (
              <Link
                to="/recipe/$id"
                params={{ id: prev.id }}
                className="group rounded-lg border border-border bg-card p-5 transition hover:border-primary"
              >
                <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">← Previous</p>
                <p className="mt-2 text-lg leading-tight group-hover:text-primary">{prev.title}</p>
              </Link>
            ) : <div />}
            {next ? (
              <Link
                to="/recipe/$id"
                params={{ id: next.id }}
                className="group rounded-lg border border-border bg-card p-5 text-right transition hover:border-primary sm:text-right"
              >
                <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Next →</p>
                <p className="mt-2 text-lg leading-tight group-hover:text-primary">{next.title}</p>
              </Link>
            ) : <div />}
          </nav>
        )}
      </article>

      <footer className="border-t border-border py-10 text-center text-xs uppercase tracking-[0.28em] text-muted-foreground print:hidden">
        <Link to="/" className="hover:text-primary">Return to the book</Link>
      </footer>
    </div>
  );
}
