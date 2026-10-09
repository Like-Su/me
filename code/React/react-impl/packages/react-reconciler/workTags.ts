export type WorkType = typeof FunctionComponent | typeof HostRoot | typeof HostCompnoent | typeof HostText;

// fiber node type
export const FunctionComponent = 0;
// root
export const HostRoot = 3;
// div
export const HostCompnoent = 5;
// innerText
export const HostText = 6;