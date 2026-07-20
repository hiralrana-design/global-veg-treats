import { northIndian } from "./north-indian";
import { southIndian } from "./south-indian";
import { mexican } from "./mexican";
import { japanese } from "./japanese";
import { chinese } from "./chinese";
import { european } from "./european";
import { american } from "./american";
import { thai } from "./thai";
import { korean } from "./korean";
import { greek } from "./greek";
import { middleEastAfrican } from "./middle-east-african";
import { vietnamese } from "./vietnamese";
import { mediterranean } from "./mediterranean";
import { desserts } from "./desserts";

export * from "./types";
export type { Recipe } from "./types";

import type { Recipe } from "./types";

export const RECIPES: Recipe[] = [
  ...northIndian,
  ...southIndian,
  ...mexican,
  ...japanese,
  ...chinese,
  ...european,
  ...american,
  ...thai,
  ...korean,
  ...greek,
  ...middleEastAfrican,
  ...vietnamese,
  ...mediterranean,
  ...desserts,
];

export function getRecipe(id: string): Recipe | undefined {
  return RECIPES.find((r) => r.id === id);
}
