import { formatOutSchema } from "../utils/schemas/formatOutSchema.ts"
import { parseArgs } from "../utils/parseArgs.ts";
import { resolveConfigsPaths } from "../utils/resolveConfigsPaths.ts";
import { loadAgent } from "../utils/getAgents.ts";
import { createHash, dom, camelCase } from "../deps.ts";
import { IPMFile } from "../utils/ipm-file.ts";
import { IPMFileLock } from "../utils/ipm-file-lock.ts";
import { iconResourceSchema } from "../utils/schemas/iconResourceSchema.ts";


interface T {
    name?: string
    url: URL
    out: URL | undefined
    outDir: URL
    formatOut: formatOutSchema,
}


const isHTMLDocument = (elm: dom.Node): elm is dom.HTMLDocument => elm.nodeType === dom.NodeType.DOCUMENT_NODE
const isElement = (elm: dom.Node): elm is dom.Element => elm.nodeType === dom.NodeType.ELEMENT_NODE

class TSXAttr {
    constructor(
        public propName: string,
        public propLiteralValue: string,
    ) { }
}

const normalizeTsxTagNames = (tagName: string): string => {
    switch (tagName) {
        case 'viewbox': return 'viewBox'
    }
    return camelCase(tagName)
}

class TSXNode {
    constructor(
        public type: string,
        public props: TSXAttr[],
        public children: TSXNode[],
    ) { }

    static stringify(tsxNode: unknown, depth: number): string {
        if (tsxNode instanceof TSXAttr) {
            return `${tsxNode.propName}=${tsxNode.propLiteralValue}`
        }
        if (tsxNode instanceof TSXNode) {
            const tag = tsxNode.type.toLowerCase();
            const depthMargin = `  `.repeat(depth);
            const props = !tsxNode.props.length ? '' : ` ${tsxNode.props.map(t => TSXNode.stringify(t, depth + 1)).join(' ')}`
            const childs = !tsxNode.children.length ? '' : `${tsxNode.children.map(t => TSXNode.stringify(t, depth + 1)).join(' ')}`
            return `${depthMargin}<${tag}${props}>${childs ? `\n${childs}\n${depthMargin}</${tag}>` : `</${tag}>`}`
        }
        return ''
    }

    static fromNode(node: dom.Node): null | TSXNode {
        if (isHTMLDocument(node)) {
            const [body] = node.documentElement?.getElementsByTagName('svg') ?? [];
            if (body) {
                return TSXNode.fromNode(body)
            }
        }

        if (isElement(node)) {
            const children: TSXNode[] = []
            const tsxAttrs: TSXAttr[] = []
            for (const element of node.childNodes) {
                const tsxNode = TSXNode.fromNode(element)
                if (tsxNode) {
                    children.push(tsxNode)
                }
            }
            for (const attr of node.attributes) {
                tsxAttrs.push(new TSXAttr(normalizeTsxTagNames(attr.name), JSON.stringify(attr.value)))
            }

            return new TSXNode(node.tagName, tsxAttrs, children)
        }

        return null;
    }
}


const toExt = (formatOut: formatOutSchema) => formatOut === "svg-react" ? '.tsx' : '.svg'


// deno-lint-ignore require-await
async function transformResource(name: string, urL: URL, formatOut: formatOutSchema, svgText: string): Promise<string> {
    if (formatOut === 'svg') return svgText;

    const domParsed = new dom.DOMParser().parseFromString(svgText, 'text/html');

    if (!domParsed) throw new TypeError(`Cannot parse SVG text`)

    const tsxNode = TSXNode.fromNode(domParsed)

    if (tsxNode?.type !== "SVG") {
        throw new Error('CAnnot found element SVG')
    }

    tsxNode.props = tsxNode.props.filter(prop => !["width", "height", "class", "space", "xlink", "id"].includes(prop.propName))
    tsxNode.props.push(new TSXAttr("className", `{classNames("aspect-square", className)}`))
    tsxNode.props.push(new TSXAttr("style", `{style}`))

    return `import { FC, CSSProperties } from "react"\n`
        + `import classNames from "classnames";\n`
        + `\n\n`
        + `/** @external ${urL} */\n`
        + `export const ${name}: FC<{ className?: string, style?: CSSProperties }> = ({ className, style }) =>\n`
        + `${TSXNode.stringify(tsxNode, 1)}\n`
        + `\n\n`
        + `export default ${name};\n`
}

class PullResource {
    constructor(
        readonly ipmFile: IPMFile,
        readonly impFileLock: IPMFileLock = ipmFile.impFileLock,
    ) { }


    async pullTextResource(resource: URL) {
        const resourceContent = this.impFileLock.getResource(resource);
        if (resourceContent) return resourceContent;

        console.log(`Download ${resource}`)
        const agent = await loadAgent(resource, this.ipmFile.agents)

        if (!agent) throw new TypeError(`Cannot found agent to ${resource}`)

        const svgResult = await agent.getSvgIcon(resource);

        await this.impFileLock.setResource(resource, { integrity: createHash('sha256').update(svgResult.payload).toString('base64'), createdAt: Date.now(), ...svgResult })

        return svgResult;
    }

    async pullResource(resource: T) {
        const svgResult = await this.pullTextResource(resource.url)
        const name = camelCase(resource.name ?? svgResult.name);

        await Deno.mkdir(resource.outDir, { recursive: true })

        const out = resource.out ?? new URL(`${name}${toExt(resource.formatOut)}`, resource.outDir);

        await Deno.writeFile(out, new TextEncoder().encode(await transformResource(name, resource.url, resource.formatOut, svgResult.payload)))

        return resource
    }
}

class PullCollectionResource {
    constructor(
        readonly ipmFile: IPMFile,
        readonly pullResource: PullResource = new PullResource(ipmFile),
    ) { }

    async pullResources(resources: iconResourceSchema[], outDir: URL, formatOut: formatOutSchema, _exportIndex?: URL) {
        const results: T[] = []
        for (const resource of resources) {
            const res = await this.pullResource.pullResource({
                name: resource.name,
                url: resource.url,
                formatOut: resource.formatOut ?? formatOut,
                outDir: resource.outDir ?? outDir,
                out: resource.out,
            });

            results.push(res);
        }

        await this.ipmFile.impFileLock.saveChanges();
    }
}


async function bin(args: string[]) {
    const ipmFile = await IPMFile.eachIPMFileFactory(resolveConfigsPaths())
    const argsOptions = parseArgs(args);

    if (argsOptions.args[0] === "info") {
        console.log(ipmFile)
        return
    }

    if (argsOptions.args[0] === "pull") {
        await new PullCollectionResource(ipmFile).pullResources(ipmFile.icons, ipmFile.outDir, ipmFile.formatOut);
        return
    }
}

if (import.meta.main) {
    await bin([...Deno.args])
}
