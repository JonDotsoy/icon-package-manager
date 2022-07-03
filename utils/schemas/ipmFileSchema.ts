import { z } from "../../deps.ts";
import { formatOutSchema } from "./formatOutSchema.ts";
import { iconResourceSchema } from "./iconResourceSchema.ts";


export type ipmFileSchema = z.TypeOf<ReturnType<typeof ipmFileSchema>>
export const ipmFileSchema = ({ config_dirname }: { config_dirname: URL }) => {
    const resolveRelativeUrl = (relativeUrlString: string) => new URL(relativeUrlString, config_dirname)
    const resolveRelativeDirectoryUrl = (relativeUrlString: string) => new URL(`${relativeUrlString}/`, config_dirname)

    return z.object({
        formatOut: z.optional(formatOutSchema).default('svg-react'),
        icons: z.array(iconResourceSchema({ config_dirname })).default([]),
        indexIcons: z.optional(z.string().transform(resolveRelativeUrl)),
        outDir: z.optional(z.string().transform(resolveRelativeDirectoryUrl)).transform((outDir) => outDir ?? new URL('icons/', config_dirname)),
        agents: z.record(z.string().transform(resolveRelativeUrl)).default({}).transform((agents): { pattern: URLPattern; module: URL; }[] => [
            ...Object.entries(agents).map(([k, s]) => ({
                pattern: k.includes(":") ? new URLPattern(k) : new URLPattern({ hostname: k }),
                module: s,
            })),
            { pattern: new URLPattern({ protocol: 'data:', pathname: `image/svg\\+xml\\,*` }), module: new URL(`../../agents/data-image-svg.agent.ts`, import.meta.url) },
            { pattern: new URLPattern({ hostname: 'iconmonstr.com' }), module: new URL(`../../agents/iconmonstr.com.agent.ts`, import.meta.url) },
            { pattern: new URLPattern({ hostname: 'heroicons.com' }), module: new URL(`../../agents/heroicons.com.agent.ts`, import.meta.url) },
            { pattern: new URLPattern("https://(www.)?svgrepo.com/svg/*"), module: new URL(`../../agents/svgrepo.com.svg.agent.ts`, import.meta.url) },
        ]),
    });
};
