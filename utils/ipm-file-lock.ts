import { YAML } from "../deps.ts";
import { ipmFileLockSchema } from "./schemas/ipmFileLockSchema.ts";
import { resourceSchema } from "./schemas/resourceSchema.ts";

export class IPMFileLock {
    constructor(
        readonly location: URL,
        readonly payload: ipmFileLockSchema,
    ) { }

    async saveChanges() {
        await Deno.writeTextFile(this.location, YAML.stringify(ipmFileLockSchema.parse(this.payload)));
    }

    getResource(resourceUrl: URL): resourceSchema | null {
        return this.payload.resources[`${resourceUrl}`] ?? null;
    }

    setResource(resourceUrl: URL, resource: resourceSchema) {
        this.payload.resources[`${resourceUrl}`] = resource;
    }

    static async load(location: URL) {
        let payloadText: string
        try {
            payloadText = await Deno.readTextFile(location)
        } catch (ex) {
            if (ex instanceof Deno.errors.NotFound) {
                payloadText = "{}"
            } else {
                throw ex;
            }
        }
        const payload = ipmFileLockSchema.parse(YAML.parse(payloadText));
        return new IPMFileLock(location, payload);
    }
}
