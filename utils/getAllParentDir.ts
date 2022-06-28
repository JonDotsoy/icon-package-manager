export function* getAllParentDir(from: URL) {
    let currentDir = from
    for (let n = 0; n < 10; n++) {
        const nextCurrentDir = new URL('..', currentDir);
        if (currentDir.pathname === nextCurrentDir.pathname) break
        yield nextCurrentDir;
        currentDir = nextCurrentDir;
    }
}