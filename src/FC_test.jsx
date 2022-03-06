function App(props = {}) {
  return <div>
    hi {props.name}
  </div>
}

LReact.render(<App name={'小红'} />, document.getElementById('root'))