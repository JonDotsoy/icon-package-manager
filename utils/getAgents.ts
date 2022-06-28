import { z } from "../deps.ts";


const agentSchema = z.object({
    getAgent: z.function().returns(z.promise(z.object({
        getSvgIcon: z.function().args(z.instanceof(URL)).returns(z.promise(z.string())),
    }))),
})

const agents: Record<string, string> = {
    "iconmonstr.com": `../agents/iconmonstr.agent.ts`
}

// deno-lint-ignore require-await
export async function loadAgent(resourceUrl: URL) {
    for (const [endUrl, pathAgent] of Object.entries(agents)) {
        if (resourceUrl.hostname.endsWith(endUrl)) {
            const agentUrl = new URL(pathAgent, import.meta.url);

            const agentModule = agentSchema.parse(await import(agentUrl.toString()))

            return await agentModule.getAgent();
        }
    }
}