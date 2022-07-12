import { path, YAML } from "../deps.ts";
import { ipmFileLockSchema } from "./schemas/ipmFileLockSchema.ts";
import { resourceSchema } from "./schemas/resourceSchema.ts";

const urlSafe = (location: URL, from: URL) => {
    const u = new URL(`${location}`)

    u.password = u.password ? '***' : '';

    u.searchParams.forEach((value, key, searchParams) => {
        if ([
            "access_token"
        ].includes(key)) {
            searchParams.set(key, '***');
        }
    })

    if (u.protocol === "file:") {
        u.pathname = `/$CWD/${path.relative(path.dirname(from.pathname), u.pathname)}`
    }

    return u;
}

export class IPMFileLock {
    constructor(
        readonly location: URL,
        readonly payload: ipmFileLockSchema,
    ) { }

    async saveChanges() {
        await Deno.writeTextFile(this.location, YAML.stringify(ipmFileLockSchema.parse(this.payload)));
    }

    getResource(resourceUrl: URL): resourceSchema | null {
        return this.payload.resources[`${urlSafe(resourceUrl, this.location)}`] ?? null;
    }

    setResource(resourceUrl: URL, resource: resourceSchema) {
        this.payload.resources[`${urlSafe(resourceUrl, this.location)}`] = resource;
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
