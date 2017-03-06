var can = require('can'),
$ = window.$ = require('jquery');

var EditorState = require("prosemirror-state").EditorState
var MenuBarEditorView = require("./prosemirror-menu/index").MenuBarEditorView
var DOMParser = require("prosemirror-model").DOMParser
var Schema = require("prosemirror-model").Schema

var addListNodes = require("prosemirror-schema-list").addListNodes
var exampleSetup = require("./prosemirror-example-setup/index").exampleSetup
var baseSchema = require("prosemirror-schema-basic").schema

var toggleMark = require("prosemirror-commands").toggleMark;

var PM = window.PM = {

}

can.Component.extend({
  tag: "text-editor",
  template: can.stache(require('raw-loader!./text-editor.html')),
  viewModel: {

  },
  events: {
    inserted: function(){
        console.log('inserted')

        initProsemirror(this.element[0].querySelector(".body"))


    },
    '#toggle-strong click' : function(el,ev){
      ev.preventDefault();
      PM.toggleStrong(PM.editor.state, PM.editor.dispatch);

    }
  }
});

function initProsemirror(element){
  var schema = new Schema({
    nodes: addListNodes(baseSchema.spec.nodes, "paragraph block*", "block"),
    marks: baseSchema.spec.marks
  })

  var content = document.querySelector("#content")
  content.style.display = "none"
  //var content = "text to be displayed";
  PM.toggleStrong = toggleMark(schema.marks.strong);

  var doc = DOMParser.fromSchema(schema).parse(content);

  var examplePlugins = exampleSetup({schema : schema});

  PM.view = new MenuBarEditorView(element, {
    state: EditorState.create({
      doc: doc,
      plugins: examplePlugins
    }),
    onFocus : function() {

    }
  })
}
