import { camelCase, z } from "../../deps.ts";
import { formatOutSchema } from "./formatOutSchema.ts";

export type iconResourceSchema = z.TypeOf<ReturnType<typeof iconResourceSchema>>
export const iconResourceSchema = ({ config_dirname }: { config_dirname: URL }) => z.union([
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
        formatOut: z.optional(formatOutSchema).default('svg'),
    }),
]);
