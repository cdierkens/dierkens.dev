import htm from "htm";
import { Signal } from "./signal";

const vnodeSymbol = Symbol("vnode");

export interface VNode {
  type: string;
  props: Record<string, string | Signal | Function>;
  children: VNode[] | string;
  [vnodeSymbol]: true;
}

export function h(
  type: VNode["type"],
  props: VNode["props"],
  ...children: VNode[]
) {
  return { type, props, children, [vnodeSymbol]: true as const };
}

export function isVNode(value: unknown): value is VNode {
  return value !== null && typeof value === "object" && vnodeSymbol in value;
}

export const html = htm.bind(h);
