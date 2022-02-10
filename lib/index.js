
let nextUnitOfWork = null
let wipRoot = null
const constant = {
  textElement: 'TEXT_ELEMENT'
}

// 创建普通 element
function createElement (type, props, ...children) {
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

// 创建没有 children 的 element
function createTextElement (text) {
  return {
    type: constant.textElement,
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

// 创建真实 dom
function createDom (fiber) {
  // 判断是否为文本节点( 文本节点没有 children )
  const node = fiber.type === constant.textElement ?
    document.createTextNode(''):
    document.createElement(fiber.type)
  // 追加属性 class id style ...
  const isProperty = key => key !== "children"
  Object.keys(fiber.props)
    .filter(isProperty)
    .forEach(name => {
      node[name] = fiber.props[name]
    })

  return node
}

// 渲染 dom
function render (element, container) {

  wipRoot = {
    dom: container,
    props: {
      children: [element]
    }
  }

  // 下一个时间切片需要渲染的 fiber
  nextUnitOfWork = wipRoot
}

// 在一个时间切片内持续构建 fiber
function workLoop(deadline) {

  // 当前时间是否用完 flag
  let shouldYield = false

  // 如果有下一个任务并且还有时间
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(
      nextUnitOfWork
    )

    // 判断时间片是否用完
    shouldYield = deadline.timeRemaining() < 1
  }

  // 如果渲染完 fiber
  if (!nextUnitOfWork && wipRoot) {
    // 合并 将内存中的真实 dom 与 页面上的 dom 合并
    return commitRoot()
  }

  // 等待浏览器下一个空闲时间
  requestIdleCallback(workLoop)
}

// 启动时开始等待空闲时间
requestIdleCallback(workLoop)

// 将 fiber 渲染成真实 dom
function performUnitOfWork(fiber) {

  // 如果 fiber.dom => null 那么创建当前 fiber 的真实 dom
  if (!fiber.dom) {
    fiber.dom = createDom(fiber)
  }

  const elements = fiber.props.children
  let index = 0
  let prevSibling = null

  // 深度优先 遍历 fiber 树
  while (index < elements.length) {
    const element = elements[index]

    // 构建 fiber 数据结构
    const newFiber = {
      type: element.type,
      props: element.props,
      parent: fiber,
      dom: null,
    }
    
    // 下一个要渲染的 fiber
    if (index === 0) {
      fiber.child = newFiber
    } else {
      prevSibling.sibling = newFiber
    }

    prevSibling = newFiber
    index++
  }

  // 有子树，先遍历子树
  if (fiber.child) {
    return fiber.child
  }
  let nextFiber = fiber
  while (nextFiber) {
    // 遍历兄弟树
    if (nextFiber.sibling) {
      return nextFiber.sibling
    }

    // 回到父节点
    nextFiber = nextFiber.parent
  }

}

function commitRoot() {
  commitWork(wipRoot.child)
  wipRoot = null
}

function commitWork(fiber) {
  if (!fiber) {
    return
  }

  // 将 子fiber 的 真实dom 添加到 父fiber 的 真实dom
  const domParent = fiber.parent.dom
  domParent.appendChild(fiber.dom)
  commitWork(fiber.child)
  commitWork(fiber.sibling)
}

const LReact = {
  render,
  createDom,
  createTextElement,
  createElement
}
