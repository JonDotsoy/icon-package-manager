import { z } from "../../deps.ts";
import { resourceSchema } from "./resourceSchema.ts";

export type ipmFileLockSchema = z.TypeOf<typeof ipmFileLockSchema>
export const ipmFileLockSchema = z.object({
    resources: z.record(resourceSchema).default({}),
});
