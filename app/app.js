console.log('test 2');

var EditorState = require("prosemirror-state").EditorState
var EditorView = require("prosemirror-view").EditorView
var schema = require("prosemirror-schema-basic").schema

var view = new EditorView(document.body, {
  state: EditorState.create({schema: schema}),
})

console.log("finished")
