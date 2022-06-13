import { VNode } from "typings";

const renderElem = (vNode: VNode) => {
  const $el = document.createElement(vNode.tagName);

  for (const [k, v] of Object.entries(vNode.attrs)) {
    if (
      k === "model" &&
      ["input", "select", "textarea"].includes(vNode.tagName)
    ) {
      $el.setAttribute("value", v);
    } else $el.setAttribute(k, v);
  }

  for (const [k, v] of Object.entries(vNode.on)) {
    $el.addEventListener(k, v);
  }

  for (const child of vNode.children) $el.appendChild(render(child));

  return $el;
};

const render = function (vNode: VNode) {
  if (!vNode) return document.createComment(" ");
  if (typeof vNode === "string") return document.createTextNode(vNode);
  return renderElem(vNode);
};

export default render;
