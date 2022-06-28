
const homeDir = Deno.env.get('HOME');
export const cacheDir = `${Deno.env.get('IPM_CACHE') ?? `${homeDir}/.ipm_cache`}/`;
Deno.mkdir(cacheDir, { recursive: true });

