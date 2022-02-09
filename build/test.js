"use strict";

/** @jsx LReact.createElement */
var element = LReact.createElement(
  "div",
  null,
  LReact.createElement(
    "h1",
    { className: "foo", id: "hasd" },
    "first"
  ),
  LReact.createElement(
    "h2",
    { className: "bar" },
    "second"
  ),
  LReact.createElement(
    "h3",
    null,
    "third"
  ),
  LReact.createElement("input", { type: "text" })
);