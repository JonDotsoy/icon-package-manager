import { formatOut, iconResource, loadPackageConfig } from "../utils/configSchema.ts";
import { parseArgs } from "../utils/parseArgs.ts";
import { resolveConfigsPaths } from "../utils/resolveConfigsPaths.ts";
import { loadAgent } from "../utils/getAgents.ts";
import { createHash, path, dom, camelCase } from "../deps.ts";
import { cacheDir } from "../utils/cache_dir.ts";


interface T {
    name: string
    url: URL
    out: URL
    formatOut: formatOut,
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


const toExt = (formatOut: formatOut) => formatOut === "svg-react" ? '.tsx' : '.svg'


async function pullTextResource(resource: URL) {
    const hash_cache = createHash('md5').update(resource.toString()).toString('hex');
    const filePathCache = new URL(hash_cache, path.toFileUrl(cacheDir));
    try {
        return await Deno.readTextFile(filePathCache)
    } catch (ex) {
        if (ex instanceof Deno.errors.NotFound) {
            console.log(`Download ${resource}`)
            const agent = await loadAgent(resource)

            if (!agent) throw new TypeError(`Cannot found agent to ${resource}`)

            const svgText = await agent.getSvgIcon(resource);

            console.log(`Write resource cache ${filePathCache}`)
            await Deno.writeFile(filePathCache, new TextEncoder().encode(svgText))

            return svgText;
        }

        throw ex;
    }
}

// deno-lint-ignore require-await
async function transformResource(name: string, urL: URL, formatOut: formatOut, svgText: string): Promise<string> {
    if (formatOut === 'svg') return svgText;

    const domParsed = new dom.DOMParser().parseFromString(svgText, 'text/html');

    if (!domParsed) throw new TypeError(`Cannot parse SVG text`)

    const tsxNode = TSXNode.fromNode(domParsed)

    if (tsxNode?.type !== "SVG") {
        throw new Error('CAnnot found element SVG')
    }

    tsxNode.props = tsxNode.props.filter(prop => !["width", "height"].includes(prop.propName))
    tsxNode.props.push(new TSXAttr("className", `{classNames("aspect-square", className)}`))
    tsxNode.props.push(new TSXAttr("style", `{style}`))

    return `import { FC, CSSProperties } from "react"\n`
        + `import classNames from "classnames";\n`
        + `\n\n`
        + `/** @external ${urL} */\n`
        + `export const ${name}: FC<{className?: string, style?: CSSProperties }> = ({ className, style }) =>\n`
        + `${TSXNode.stringify(tsxNode, 1)}\n`
        + `\n\n`
        + `export default ${name};\n`
}

async function pullResource(resource: T) {
    const text = await pullTextResource(resource.url)

    await Deno.mkdir(new URL('.', resource.out), { recursive: true })

    await Deno.writeFile(resource.out, new TextEncoder().encode(await transformResource(resource.name, resource.url, resource.formatOut, text)))

    return resource
}


async function pullResources(resources: iconResource[], outDir: URL, formatOut: formatOut, exportIndex?: URL) {
    const results: T[] = []
    for (const resource of resources) {
        const res = await pullResource({
            name: resource.name,
            url: resource.url,
            formatOut,
            out: new URL(`${resource.name}${toExt(formatOut)}`, outDir),
        });

        results.push(res);
    }

    if (exportIndex) {
        
    }
}


async function bin(args: string[]) {
    const config = await loadPackageConfig(Array.from(resolveConfigsPaths()))
    const argsOptions = parseArgs(args);

    if (argsOptions.args[0] === "info") {
        console.log(config)
        return
    }

    if (argsOptions.args[0] === "pull") {
        await pullResources(config.icons, config.outDir, config.formatOut, config.indexIcons);
        return
    }
}

if (import.meta.main) {
    await bin([...Deno.args])
}
