import * as path from "https://deno.land/std/path/mod.ts";

export const cacheDir = path.toFileUrl(`${Deno.env.get('IPM_CACHE') ?? `${Deno.env.get('HOME')}/.ipm_cache`}/`);
Deno.mkdir(cacheDir, { recursive: true });
