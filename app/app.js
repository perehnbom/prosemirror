


const EditorState = require("prosemirror-state").EditorState
const MenuBarEditorView = require("prosemirror-menu").MenuBarEditorView
const DOMParser = require("prosemirror-model").DOMParser
const Schema = require("prosemirror-model").Schema

const addListNodes = require("prosemirror-schema-list").addListNodes
const exampleSetup = require("prosemirror-example-setup").exampleSetup
const baseSchema = require("prosemirror-schema-basic").schema

//require("prosemirror-markdown")


const schema = new Schema({
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
