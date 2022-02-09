
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

// 创建 dom
function createDom (fiber) {
  const node = fiber.type === constant.textElement ?
    document.createTextNode(''):
    document.createElement(fiber.type)
  // 追加属性
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

  nextUnitOfWork = wipRoot
}

// 循环创建
function workLoop(deadline) {

  let shouldYield = false
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(
      nextUnitOfWork
    )
    shouldYield = deadline.timeRemaining() < 1
  }

  // 如果渲染完 fiber
  if (!nextUnitOfWork && wipRoot) {
    return commitRoot()
  }

  requestIdleCallback(workLoop)
}

requestIdleCallback(workLoop)

// 时间切片
function performUnitOfWork(fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber)
  }

  const elements = fiber.props.children
  let index = 0
  let prevSibling = null

  while (index < elements.length) {
    const element = elements[index]

    const newFiber = {
      type: element.type,
      props: element.props,
      parent: fiber,
      dom: null,
    }
    
    if (index === 0) {
      fiber.child = newFiber
    } else {
      prevSibling.sibling = newFiber
    }

    prevSibling = newFiber
    index++
  }

  if (fiber.child) {
    return fiber.child
  }
  let nextFiber = fiber
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling
    }
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
