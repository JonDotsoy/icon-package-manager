import { camelCase, YAML, z } from "../deps.ts";

let config_dirname: URL;

export type formatOut = z.TypeOf<typeof formatOut>
export const formatOut = z.union([z.literal('svg-react'), z.literal('svg')])

export type iconResource = z.TypeOf<typeof iconResource>
export const iconResource = z.union([
  z.string().transform((e) => {
    const url = new URL(e);
    return {
      url,
      name: camelCase(url.pathname),
    }
  }),
  z.object({
    url: z.string().transform(e => new URL(e)),
    name: z.string(),
    out: z.optional(z.string().transform(e => new URL(`${e}`, config_dirname))),
    formatOut: z.optional(formatOut).default('svg'),
  }),
])

export const configSchema = z.object({
  formatOut: z.optional(formatOut).default('svg'),
  icons: z.array(iconResource).default([]),
  indexIcons: z.optional(z.string().transform(e => new URL(e, config_dirname))),
  outDir: z.optional(z.string().transform(e => new URL(`${e}/`, config_dirname))).transform((outDir) => outDir ?? new URL('icons/', config_dirname)),
});

export async function loadPackageConfig(paths: URL[]): Promise<z.TypeOf<typeof configSchema>> {
  for (const path of paths) {
    config_dirname = new URL('.', path);
    try {
      const payload = await Deno.readTextFile(path);
      return configSchema.parse(YAML.parse(payload));
    } catch (ex) {
      if (ex instanceof Deno.errors.NotFound) continue;
      throw ex;
    }
  }

  return configSchema.parse({});
}
