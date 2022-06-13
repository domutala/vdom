import { VNode } from "typings";
import render from "./render";

const zip = (xs: any, ys: any) => {
  const zipped = [];
  for (let i = 0; i < Math.max(xs.length, ys.length); i++) {
    zipped.push([xs[i], ys[i]]);
  }
  return zipped;
};

const diffAttrs = (
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

const diffChildren = (oldVChildren: VNode[], newVChildren: VNode[]) => {
  const childPatches: any[] = [];
  oldVChildren.forEach((oldVChild, i) => {
    childPatches.push(diff(oldVChild, newVChildren[i]));
  });

  const additionalPatches: any[] = [];
  for (const additionalVChild of newVChildren.slice(oldVChildren.length)) {
    additionalPatches.push(($node: HTMLElement) => {
      $node.appendChild(render(additionalVChild));
      return $node;
    });
  }

  return ($parent: HTMLElement) => {
    for (const [patch, child] of zip(childPatches, $parent.childNodes)) {
      patch(child);
    }

    for (const patch of additionalPatches) {
      patch($parent);
    }

    return $parent;
  };
};

const diff = (vOldNode: VNode, vNewNode: VNode) => {
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
        const $newNode = render(vNewNode);
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
      const $newNode = render(vNewNode);
      $node.replaceWith($newNode);
      return $newNode;
    };
  }

  const patchAttrs = diffAttrs(vOldNode.attrs, vNewNode.attrs);
  const patchChildren = diffChildren(vOldNode.children, vNewNode.children);

  return ($node: HTMLElement) => {
    patchAttrs($node);
    patchChildren($node);
    return $node;
  };
};

export default diff;
