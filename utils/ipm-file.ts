import { YAML } from "../deps.ts";
import { ipmFileSchema } from "./schemas/ipmFileSchema.ts";
import { IPMFileLock } from "./ipm-file-lock.ts";


export class IPMFile {
    constructor(
        readonly location: URL,
        readonly payload: ipmFileSchema,
        readonly impFileLock: IPMFileLock,
    ) { }

    get icons() { return this.payload.icons }
    get agents() { return this.payload.agents }
    get formatOut() { return this.payload.formatOut }
    get outDir() { return this.payload.outDir }


    static async eachIPMFileFactory(pathsToFind: Generator<{ ipmFile: URL, ipmFileLock: URL }>) {
        for (const { ipmFile, ipmFileLock } of pathsToFind) {
            const config_dirname = new URL('.', ipmFile);
            try {
                const payload = await Deno.readTextFile(ipmFile);
                return new IPMFile(
                    ipmFile,
                    ipmFileSchema({ config_dirname }).parse(YAML.parse(payload)),
                    await IPMFileLock.load(ipmFileLock),
                );
            } catch (ex) {
                if (ex instanceof Deno.errors.NotFound) continue;
                throw ex;
            }
        }

        throw new Error("Cannot found imp file");
    }
}
