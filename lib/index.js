
const constant = {
  textElement: 'TEXT_ELEMENT'
}

class LReact {

  // 创建普通节点
  static createElement = function (type, props, ...children) {
    return {
      type,
      props: {
        ...props,
        children: children.map((item) => {
          return typeof item === "object" ?
            item :
            this.createTextElement(item);
        }),
      },
    };
  };

  // 创建文本节点
  static createTextElement = function (text) {
    return {
      type: constant.textElement,
      props: {
        nodeValue: text,
        children: [],
      },
    };
  }

  // 将 jsx 渲染为 dom
  static render (element, container) {
    console.log(element);
    const { type, props = {} } = element || {};
    const node = type === constant.textElement ?
      document.createTextNode(''):
      document.createElement(type)

    props.children && props.children.forEach(child => {
      return this.render(child, node)
    })

    const isProperty = key => key !== "children"
    Object.keys(element.props)
      .filter(isProperty)
      .forEach(name => {
        node[name] = element.props[name]
      })

    container.appendChild(node)
  }
}
