import { VNode } from "../typings";
import createElement from "./createElement";

export default class App {
  el!: Comment | Text | HTMLElement;
  vnode!: VNode;

  data: { [key: string]: any } = {};

  readonly $createElement = createElement;
  readonly $h = createElement;

  render(): VNode {
    return this.$h("span");
  }

  private readonly create = () => {
    return this.render();
  };

  public readonly mount = (parent: HTMLElement) => {
    this.data = new Proxy(this.data, {
      get(cible: any, prop: string) {
        return Reflect.get(cible, prop);
      },
      set: (obj: any, prop: string, value: any) => {
        obj[prop] = value;
        this.rebuild();
        return true;
      },
    });

    this.vnode = this.create();
    const $el = this.$render(this.vnode);
    this.el = this.$mount($el, parent);

    return this.el;
  };

  private readonly rebuild = () => {
    const vNewApp = this.create();
    const patch = this.$diff(this.vnode, vNewApp);
    this.el = patch(this.el as HTMLElement) as HTMLElement;
    this.vnode = vNewApp;
  };

  setClass = (v: any) => {
    const _class: string[] = [];

    if (typeof v === "object") {
      for (const key of Object.keys(v)) {
        if (v[key]) _class.push(key);
      }
    } else _class.push(v);

    return _class.join(" ");
  };

  // render
  protected readonly $renderElem = (vNode: VNode) => {
    const $el = document.createElement(vNode.tagName);

    for (const [k, v] of Object.entries(vNode.attrs)) {
      if (
        k === "model" &&
        ["input", "select", "textarea"].includes(vNode.tagName)
      ) {
        $el.addEventListener("input", (e: any) => {
          const target = e.srcElement || e.target;
          let value = target.value;

          if ($el.getAttribute("type") == "number") value = Number(value);
          this.data[v] = value;
        });

        $el.setAttribute("value", this.data[v]);
      } else $el.setAttribute(k, v);
    }

    for (const [k, v] of Object.entries(vNode.on)) {
      $el.addEventListener(k, v);
    }

    for (const child of vNode.children) $el.appendChild(this.$render(child));

    return $el;
  };

  protected readonly $render = (vNode: VNode) => {
    if (!vNode) return document.createComment(" ");
    if (typeof vNode === "string") return document.createTextNode(vNode);
    return this.$renderElem(vNode);
  };

  // mount
  protected readonly $mount = (
    $node: HTMLElement | Text | Comment,
    $target: Node
  ) => {
    ($target as any).replaceWith($node);
    return $node;
  };

  // diff
  protected readonly $diffZip = (xs: any, ys: any) => {
    const zipped = [];
    for (let i = 0; i < Math.max(xs.length, ys.length); i++) {
      zipped.push([xs[i], ys[i]]);
    }
    return zipped;
  };

  protected readonly $diffAttrs = (
    oldAttrs: { [key: string]: any },
    newAttrs: { [key: string]: any }
  ) => {
    const patches: any[] = [];

    // set new attributes
    for (const [k, v] of Object.entries(newAttrs)) {
      patches.push(($node: HTMLElement) => {
        $node.setAttribute(k, v);
        return $node;
      });
    }

    // remove old attributes
    for (const k in oldAttrs) {
      if (!(k in newAttrs)) {
        patches.push(($node: HTMLElement) => {
          $node.removeAttribute(k);
          return $node;
        });
      }
    }

    return ($node: HTMLElement) => {
      for (const patch of patches) {
        patch($node);
      }
    };
  };

  protected readonly $diffChildren = (
    oldVChildren: VNode[],
    newVChildren: VNode[]
  ) => {
    const childPatches: any[] = [];
    oldVChildren.forEach((oldVChild, i) => {
      childPatches.push(this.$diff(oldVChild, newVChildren[i]));
    });

    const additionalPatches: any[] = [];
    for (const additionalVChild of newVChildren.slice(oldVChildren.length)) {
      additionalPatches.push(($node: HTMLElement) => {
        $node.appendChild(this.$render(additionalVChild));
        return $node;
      });
    }

    return ($parent: HTMLElement) => {
      for (const [patch, child] of this.$diffZip(
        childPatches,
        $parent.childNodes
      )) {
        patch(child);
      }

      for (const patch of additionalPatches) {
        patch($parent);
      }

      return $parent;
    };
  };

  protected readonly $diff = (vOldNode: VNode, vNewNode: VNode) => {
    if (vNewNode === undefined) {
      return ($node: Text | HTMLElement) => {
        const $newNode = document.createComment(" ");
        $node.replaceWith($newNode);
        return $newNode;
      };
    }

    if (typeof vOldNode === "string" || typeof vNewNode === "string") {
      if (vOldNode !== vNewNode) {
        return ($node: Text | HTMLElement) => {
          const $newNode = this.$render(vNewNode);
          $node.replaceWith($newNode);
          return $newNode;
        };
      } else {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        return ($node: Text | HTMLElement) => undefined;
      }
    }

    if (vOldNode.tagName !== vNewNode.tagName) {
      return ($node: Text | HTMLElement) => {
        const $newNode = this.$render(vNewNode);
        $node.replaceWith($newNode);
        return $newNode;
      };
    }

    const patchAttrs = this.$diffAttrs(vOldNode.attrs, vNewNode.attrs);
    const patchChildren = this.$diffChildren(
      vOldNode.children,
      vNewNode.children
    );

    return ($node: HTMLElement) => {
      patchAttrs($node);
      patchChildren($node);
      return $node;
    };
  };
  // end diff
}
