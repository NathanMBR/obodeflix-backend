export const removeProperty = <T extends Record<string, any>, K extends keyof T>(object: T, ...properties: Array<K>) => {
    for (const property of properties)
        delete object[property];

    return object;
};