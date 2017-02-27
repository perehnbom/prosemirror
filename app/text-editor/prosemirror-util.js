var EditorState = require("prosemirror-state").EditorState
var MenuBarEditorView = require("prosemirror-menu").MenuBarEditorView
var DOMParser = require("prosemirror-model").DOMParser
var Schema = require("prosemirror-model").Schema

var addListNodes = require("prosemirror-schema-list").addListNodes
var exampleSetup = require("prosemirror-example-setup").exampleSetup
var baseSchema = require("prosemirror-schema-basic").schema

//require("prosemirror-markdown")



module.exports.init = function(element){
  var schema = new Schema({
    nodes: addListNodes(baseSchema.spec.nodes, "paragraph block*", "block"),
    marks: baseSchema.spec.marks
  })

  var content = document.querySelector("#content")
  content.style.display = "none"
  //var content = "text to be displayed";
  


  var doc = DOMParser.fromSchema(schema).parse(content);


  var view = new MenuBarEditorView(element, {
    state: EditorState.create({
      doc: doc,
      plugins: exampleSetup({schema : schema})
    }),
    onFocus : function() {
      
    }
  })
}
