var EditorState = require("prosemirror-state").EditorState
var MenuBarEditorView = require("prosemirror-menu").MenuBarEditorView
var DOMParser = require("prosemirror-model").DOMParser
var Schema = require("prosemirror-model").Schema

var addListNodes = require("prosemirror-schema-list").addListNodes
var exampleSetup = require("prosemirror-example-setup").exampleSetup
var baseSchema = require("prosemirror-schema-basic").schema

//require("prosemirror-markdown")


var schema = new Schema({
  nodes: addListNodes(baseSchema.spec.nodes, "paragraph block*", "block"),
  marks: baseSchema.spec.marks
})

var content = document.querySelector("#content")
content.style.display = "none"

var tip = document.querySelector(".demotip")

var doc = DOMParser.fromSchema(schema).parse(content);


var view = new MenuBarEditorView(document.querySelector("#editor"), {
  state: EditorState.create({
    doc: doc,
    plugins: exampleSetup({schema : schema})
  }),
  onFocus : function() {
    if (tip) {
      tip.innerHTML = "<a href='#demos' style='text-decoration: none; pointer-events: auto; color: inherit'>Find more demos below ↓</a>"
      tip = null
    }
  }
})

window.view = view.editor
