export default function (
  this: any,
  $node: HTMLElement | Text | Comment,
  $target: Node
) {
  console.log(this);

  ($target as any).replaceWith($node);
  return $node;
}
