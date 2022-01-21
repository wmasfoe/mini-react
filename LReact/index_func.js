function LReact() {}
LReact.createElement = function (type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((item) => {
        return typeof item === "object" ? item : this.createTextElement(item);
      }),
    },
  };
};
LReact.createTextElement = function (text) {
  return {
    type: constant.textElement,
    props: {
      nodeValue: text,
      children: [],
    },
  };
};
