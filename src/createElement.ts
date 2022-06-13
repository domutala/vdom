const fn = (
  tagName: string,
  options: {
    attrs?: { [string: string]: any };
    on?: { [string: string]: (e: any) => any };
  } = {},
  children: any = []
) => {
  if (
    options instanceof Node ||
    typeof options == "string" ||
    Array.isArray(options)
  ) {
    children = options;
    options = {};
  }

  const attrs = options.attrs || {};
  const on = options.on || {};

  return {
    tagName,
    attrs,
    on,
    children,
  };
};

export default fn;
