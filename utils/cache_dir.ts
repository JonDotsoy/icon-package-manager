import * as path from "https://deno.land/std/path/mod.ts";

export const cacheDir = path.toFileUrl(`${Deno.env.get('IPM_CACHE') ?? `${Deno.env.get('IPM_CACHE')}/.ipm_cache`}/`);
Deno.mkdir(cacheDir, { recursive: true });
