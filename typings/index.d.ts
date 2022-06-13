import VDom from "../src";

export default VDom;
export interface VNode {
  tagName: string;
  attrs: { [string: string]: any };
  on: { [string: string]: (e: any) => any };
  children: any;
}
