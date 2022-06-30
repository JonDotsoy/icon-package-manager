import { z } from "../deps.ts";

export type Agent = z.TypeOf<typeof agentSchema>

const agentSchema = z.object({
    getAgent: z.function().returns(z.promise(z.object({
        getSvgIcon: z.function()
            .args(
                z.instanceof(URL),
            )
            .returns(
                z.promise(
                    z.object({
                        name: z.string(),
                        payload: z.string(),
                    }),
                ),
            ),
    }))),
})


export async function loadAgent(resourceUrl: URL, agents: { pattern: URLPattern, module: URL }[]) {
    for (const { pattern, module } of agents) {
        if (pattern.test(resourceUrl)) {
            const agentModule = agentSchema.describe(`Agent ${resourceUrl}`).parse(await import(module.toString()))
            return await agentModule.getAgent();
        }
    }
}