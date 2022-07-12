import { path, z } from "../../deps.ts";
import { formatOutSchema } from "./formatOutSchema.ts";

export type iconResourceSchema = z.TypeOf<ReturnType<typeof iconResourceSchema>>
export const iconResourceSchema = ({ config_dirname }: { config_dirname: URL }) => z.union([
    z.string().transform((e) => {
        const url = new URL(e, path.toFileUrl(`${Deno.cwd()}/`));
        return {
            url,
            name: undefined,
            out: undefined,
            outDir: undefined,
            formatOut: undefined,
        }
    }),
    z.object({
        url: z.string().transform(e => new URL(e, path.toFileUrl(`${Deno.cwd()}/`))),
        name: z.string(),
        out: z.optional(z.string().transform(e => new URL(`${e}`, config_dirname))),
        outDir: z.optional(z.string().transform(e => new URL(`${e}`, config_dirname))),
        formatOut: z.optional(formatOutSchema),
    }),
]);
