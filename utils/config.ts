import { camelCase, YAML, z } from "../deps.ts";


export type Config = z.TypeOf<typeof configSchema>
let config_dirname: URL;
const resolveRelativeUrl = (relativeUrlString: string) => new URL(relativeUrlString, config_dirname)
const resolveRelativeDirectoryUrl = (relativeUrlString: string) => new URL(`${relativeUrlString}/`, config_dirname)

export type formatOut = z.TypeOf<typeof formatOut>
export const formatOut = z.union([z.literal('svg-react'), z.literal('svg')])

export type iconResource = z.TypeOf<typeof iconResource>
export const iconResource = z.union([
  z.string().transform((e) => {
    const url = new URL(e);
    return {
      url,
      name: undefined,
      outDir: undefined,
      formatOut: undefined
    }
  }),
  z.object({
    url: z.string().transform(e => new URL(e)),
    name: z.optional(z.string()),
    outDir: z.optional(z.string().transform(e => new URL(`${e}`, config_dirname))),
    formatOut: z.optional(formatOut).default('svg'),
  }),
])

export const configSchema = z.object({
  formatOut: z.optional(formatOut).default('svg'),
  icons: z.array(iconResource).default([]),
  indexIcons: z.optional(z.string().transform(resolveRelativeUrl)),
  outDir: z.optional(z.string().transform(resolveRelativeDirectoryUrl)).transform((outDir) => outDir ?? new URL('icons/', config_dirname)),
  agents: z.record(z.string().transform(resolveRelativeUrl)).default({}).transform((agents): { pattern: URLPattern, module: URL }[] => [
    { pattern: new URLPattern({ hostname: 'iconmonstr.com' }), module: new URL(`../agents/iconmonstr.agent.ts`, import.meta.url) },
    ...Object.entries(agents).map(([k, s]) => ({
      pattern: k.includes(":") ? new URLPattern(k) : new URLPattern({ hostname: k }),
      module: s,
    })),
  ]),
});

export async function loadPackageConfig(paths: URL[]): Promise<Config> {
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

export class ConfigService {
  constructor() { }

  static async loadConfigFactory(paths: URL[]) {
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
}
