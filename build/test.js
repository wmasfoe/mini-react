"use strict";

var flag = true;

/** @jsx LReact.createElement */

var dom1 = LReact.createElement(
  "div",
  null,
  LReact.createElement(
    "h1",
    null,
    "abc"
  )
);

var dom2 = LReact.createElement(
  "div",
  null,
  LReact.createElement(
    "h1",
    null,
    "ABC"
  )
);

var container = document.getElementById("root");
function rerender() {
  var element = LReact.createElement(
    "div",
    null,
    LReact.createElement(
      "h1",
      null,
      "Hi. I'm lijiaqi."
    ),
    LReact.createElement(
      "h2",
      null,
      "My GitHub address is ",
      LReact.createElement(
        "a",
        { href: "https://github.com/gaearon-byte" },
        "gaearon-byte"
      )
    ),
    LReact.createElement(
      "button",
      { onClick: handle },
      "change dom!"
    ),
    flag,
    flag ? dom1 : dom2,
    LReact.createElement(
      "div",
      null,
      "hi, this is div element."
    ),
    LReact.createElement(
      "p",
      null,
      "hi, this is p element"
    ),
    LReact.createElement(
      "span",
      null,
      "hi, this is span element."
    ),
    LReact.createElement("input", { type: "text" }),
    LReact.createElement(
      "select",
      { name: "", id: "" },
      LReact.createElement(
        "option",
        { value: "\u54C8\u54C8" },
        "\u54C8\u54C8"
      )
    ),
    LReact.createElement(
      "ul",
      null,
      LReact.createElement(
        "li",
        null,
        "this is first li"
      ),
      LReact.createElement(
        "li",
        null,
        "this is second li"
      )
    ),
    LReact.createElement(
      "ul",
      null,
      LReact.createElement(
        "ol",
        null,
        "this is first ol"
      ),
      LReact.createElement(
        "ol",
        null,
        "this is second ol"
      )
    ),
    LReact.createElement(
      "table",
      null,
      LReact.createElement(
        "tr",
        null,
        LReact.createElement(
          "td",
          null,
          "0-0"
        ),
        LReact.createElement(
          "td",
          null,
          "0-1"
        )
      ),
      LReact.createElement(
        "tr",
        null,
        LReact.createElement(
          "td",
          null,
          "1-0"
        ),
        LReact.createElement(
          "td",
          null,
          "1-1"
        )
      )
    )
  );
  LReact.render(element, container);
}

rerender();

function handle() {
  flag = !flag;
  rerender();
}