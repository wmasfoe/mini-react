
let nextUnitOfWork = null, // 下一个工作单元 一个单元就是 一个 fiber
    wipRoot = null, // 整颗 fiber 树
    currentRoot = null, // 上一次 commit 时的 fiber
    deletions = null; // 需要移去的 dom

const constant = Object.freeze({
  textElement: 'TEXT_ELEMENT',
  updateTag: 'UPDATE',
  placementTag: 'PLACEMENT',
  deleteTag: 'DELETION'
})

/** utils start */
const isNew = (prev, next) => key =>
  prev[key] !== next[key]
const isGone = (prev, next) => key => !(key in next)
// 属性是否为事件 (on 开头)
const isEvent = key => key.startsWith("on")
// 忽略的属性，这些属性不追加到 dom 上
const isProperty = key =>
  key !== "children" && !isEvent(key)
/** utils end */

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

// 创建没有 children 的 element (textElement)
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
  Object.keys(fiber.props)
    .filter((key) => key !== 'children')
    .forEach(name => {
      // 普通属性
      if(!isEvent(name)) {
        node[name] = fiber.props[name]
      } else { // 事件监听
        const eventType = name.toLowerCase().substring(2)
        node.addEventListener(
          eventType,
          fiber.props[name]
        )
      }
    })
  
  return node
}

// 更新 dom
function updateDom (dom, oldProps, newProps) {

  // 对事件的特殊处理 - 移除旧的监听事件
  Object.keys(oldProps)
    .filter(isEvent)
    .filter(
      key =>
        !(key in newProps) ||
        isNew(oldProps, newProps)(key)
    )
    .forEach(name => {
      const eventType = name
        .toLowerCase()
        .substring(2)
      dom.removeEventListener(
        eventType,
        oldProps[name]
      )
    })

  // 删除旧的属性
  Object.keys(oldProps)
    .filter(isProperty)
    .filter(isGone(oldProps, newProps))
    .forEach(name => {
      dom[name] = ""
    })

  // 设置新的属性
  Object.keys(newProps)
    .filter(isProperty)
    .filter(isNew(oldProps, newProps))
    .forEach(name => {
      dom[name] = newProps[name]
    })

  // 添加新的监听事件
  Object.keys(newProps)
    .filter(isEvent)
    .filter(isNew(oldProps, newProps))
    .forEach(name => {
      const eventType = name
        .toLowerCase()
        .substring(2)
      dom.addEventListener(
        eventType,
        newProps[name]
      )
    })
}

// 渲染 dom
function render (element, container) {

  wipRoot = {
    // 当前 fiber 节点对应的真是 dom
    dom: container,
    // dom 上的属性
    props: {
      children: [element]
    },
    // 旧 fiber
    alternate: currentRoot
  }

  deletions = [] // 需要移去的 dom 节点

  // 下一个时间切片需要渲染的 fiber
  nextUnitOfWork = wipRoot
}

// 在一个时间切片内持续构建 fiber
function workLoop(deadline) {
  console.log('work loop deadline time is: ', deadline.timeRemaining());
  // deadline => 浏览器空闲时间
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

// 启动时开始等待空闲时间，浏览器有空闲时，就会执行回调函数
requestIdleCallback(workLoop)
// requestIdleCallback 存在浏览器兼容问题 requestAnimationFrame 不满足场景，React 手写了调度器：https://github.com/facebook/react/tree/main/packages/scheduler

// 将 fiber 渲染成真实 dom
function performUnitOfWork(fiber) {

  // 如果 fiber.dom => null 那么创建当前 fiber 的真实 dom
  if (!fiber.dom) {
    fiber.dom = createDom(fiber)
  }

  const elements = fiber.props.children

  reconcileChildren(fiber, elements)

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

// reconcile 旧 fiber 和 react elements
function reconcileChildren(wipFiber, elements) {
  let index = 0,
      prevSibling = null,
      oldFiber = wipFiber.alternate && wipFiber.alternate.child

  // 深度优先 遍历 fiber 树
  while (
    index < elements.length ||
    oldFiber != null
  ) {
    const element = elements[index]
    let newFiber = null;


    /*
    diff 逻辑
      标签是否相同
        相同:
          复用旧 dom，只用修改属性
        不同:
          存在旧节点 -> 删除, 创建新的 dom 节点
    */
    const sameType =
      oldFiber &&
      element &&
      element.type == oldFiber.type;
    
    if(sameType) {
      // update attr
      newFiber = {
        type: oldFiber.type, // 复用
        props: element.props, // 仅修改属性
        dom: oldFiber.dom, // 复用
        parent: wipFiber, // 复用
        alternate: oldFiber, // 复用
        effectTag: constant.updateTag // 所做的操作标识
      }
    }
    if(element && !sameType) {
      // add new
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null, // 重新生成 dom
        parent: wipFiber,
        alternate: null, // 重新生成 旧 fiber
        effectTag: constant.placementTag
      }
    }
    if(oldFiber && !sameType) {
      // del old
      oldFiber.effectTag = constant.deleteTag
      deletions.push(oldFiber)
    }

    // 下一个要渲染的 fiber
    if (index === 0) {
      wipFiber.child = newFiber
    } else {
      prevSibling.sibling = newFiber
    }

    prevSibling = newFiber
    index++
  }
}

function commitRoot() {
  // 移除 dom commitWork 中对 effectTag 进行了鉴别，可以判断当前 fiber 需要 更新/新建/删除
  deletions.forEach(commitWork)
  commitWork(wipRoot.child)
  currentRoot = wipRoot
  wipRoot = null
}

function commitWork(fiber) {
  if (!fiber) {
    return
  }

  // 将 子fiber 的 真实dom 添加到 父fiber 的 真实dom
  const domParent = fiber.parent.dom
  
  // 之前代码只有新增逻辑 (不管是什么直接 appendChild)，现在根据 effectTag 进行相应的处理
  // 之前代码：domParent.appendChild(fiber.dom)
  if(
    fiber.effectTag === constant.placementTag &&
    fiber.dom != null
  ) { // 标签/属性 都被修改过，所以直接在当前 fiber 的父节点进行 appendChild
    domParent.appendChild(fiber.dom)
  } else if (fiber.effectTag === constant.deleteTag) {
    // 删除
    domParent.removeChild(fiber.dom)
  } else if (
    fiber.effectTag === constant.updateTag &&
    fiber.dom != null
  ) {
    // 仅更新属性，传入之前的attr 和新的 attr 进行后者对前者进行覆盖
    updateDom(fiber.dom, fiber.alternate.props, fiber.props)
  }
  commitWork(fiber.child)
  commitWork(fiber.sibling)
}

const LReact = {
  render,
  createDom,
  createTextElement,
  createElement
}
