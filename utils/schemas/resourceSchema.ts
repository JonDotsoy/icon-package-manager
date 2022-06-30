import { z } from "../../deps.ts";

export type resourceSchema = z.TypeOf<typeof resourceSchema>
export const resourceSchema = z.object({
    name: z.string(),
    integrity: z.string(),
    createdAt: z.number(),
    payload: z.string(),
});
