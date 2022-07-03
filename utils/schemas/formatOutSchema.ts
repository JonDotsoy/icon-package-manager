import { z } from "../../deps.ts";

export type formatOutSchema = z.TypeOf<typeof formatOutSchema>
export const formatOutSchema = z.union([
    z.literal('svg-react'),
    z.literal('svg'),
]);
