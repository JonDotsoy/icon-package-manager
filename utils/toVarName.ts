export const toVarName = (text: string) => text.replace(/(?:\W+|^)(\w)/g, (_, e) => e.toUpperCase()).replace(/\W/g, '')
