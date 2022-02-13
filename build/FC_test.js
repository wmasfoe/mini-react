'use strict';

function App() {
  var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  return React.createElement(
    'div',
    null,
    'hi ',
    props.name
  );
}

LReact.render(React.createElement(App, { name: '小红' }), document.getElementById('root'));