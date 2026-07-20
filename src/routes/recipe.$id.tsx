import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { CUISINES, METHOD_LABEL, getRecipe, type Recipe } from "@/data/recipes";

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

function RecipePage() {
  const { recipe } = Route.useLoaderData() as { recipe: Recipe };
  const cuisine = CUISINES.find((c) => c.id === recipe.cuisine);

  return (
    <div className="min-h-screen paper-grain">
      <div className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="text-sm uppercase tracking-[0.28em] text-muted-foreground hover:text-primary">
            ← The Experimental Kitchen
          </Link>
          <p className="text-xs uppercase tracking-[0.28em] text-primary">{cuisine?.label}</p>
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
          <aside>
            <h2 className="mb-6 text-2xl">Ingredients</h2>
            <ul className="grid grid-cols-2 gap-3">
              {recipe.ingredients.map((ing, idx) => (
                <li key={idx} className="rounded-lg border border-border bg-card p-3">
                  <p className="text-sm font-medium leading-tight">{ing.name}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-widest text-primary/80">
                    {ing.quantity}
                  </p>
                    {ing.note && (
                      <p className="mt-1 text-[11px] italic leading-tight text-muted-foreground">{ing.note}</p>
                    )}
                </li>
              ))}
            </ul>
          </aside>

          <div>
            <section className="mb-10">
              <h2 className="mb-4 text-2xl">The dish</h2>
              <p className="text-base leading-relaxed text-foreground/85">{recipe.description}</p>
            </section>

            <section>
              <h2 className="mb-6 text-2xl">Method</h2>
              <ol className="space-y-6">
                {recipe.steps.map((step, idx) => (
                  <li key={idx} className="flex gap-5">
                    <span className="font-display text-4xl italic text-primary/60">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <p className="flex-1 pt-2 leading-relaxed text-foreground/85">{step}</p>
                  </li>
                ))}
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
      </article>

      <footer className="border-t border-border py-10 text-center text-xs uppercase tracking-[0.28em] text-muted-foreground">
        <Link to="/" className="hover:text-primary">Return to the book</Link>
      </footer>
    </div>
  );
}
