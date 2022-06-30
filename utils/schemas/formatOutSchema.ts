import { z } from "../../deps.ts";

export const formatOutSchema = z.union([
    z.literal('svg-react'),
    z.literal('svg'),
]);
