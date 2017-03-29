var can = require('can'),
$ = window.$ = require('jquery');

var prosemirror = {
  model : require("prosemirror-model"),
  state : require("prosemirror-state"),

  
  keymap : require("prosemirror-keymap"),
  history : require("prosemirror-history"),
  view : require("prosemirror-view"),
  markdown : require("prosemirror-markdown"),
  transform : require("prosemirror-transform")
}

const {linkifyPlugin} = require('./linkify-plugin')
const {buildInputRules} = require('./input-rules')
const {baseKeymap} = require('prosemirror-commands')
const menu = require('./menu')
var Schema = prosemirror.model.Schema,
  EditorState = prosemirror.state.EditorState,
  Plugin = prosemirror.state.Plugin,
  DOMParser = prosemirror.model.DOMParser,
  Slice = prosemirror.model.Slice,
  Fragment = prosemirror.model.Fragment,
  
  keymap = prosemirror.keymap.keymap,
  history = prosemirror.history.history,

  EditorView = prosemirror.view.EditorView,

  insertPoint = prosemirror.transform.insertPoint,
  buildKeymap = require('./buildkeymap');

var schema;


can.Component.extend({
  tag: "simple-text-editor",
  template: can.stache(require('raw-loader!./simple-text-editor.html')),
  viewModel: {
    markdownMode : false,
    commands : {

    }
  },

  events: {
    inserted: function(){
        console.log('inserted')
        initProsemirror(this.element, this.viewModel, "test text");
        
    },
    'removed' : function(){
      this.viewModel.editor.destroy();
    },
    '.toggle-mark click' : function(el,ev){
      ev.preventDefault();
      var command = this.viewModel.commands.attr(el.attr('command'));
      var editor = this.viewModel.editor;
      
      command.run(editor.state, editor.dispatch);
    },
    '.set-heading click' : function(el,ev){
      ev.preventDefault();
      var command = this.viewModel.commands.attr(el.attr('command'));
      var editor = this.viewModel.editor;
      command.run(editor.state, editor.dispatch);
    },
    '#save click' : function(el,ev){
      ev.preventDefault();
      var editor = this.viewModel.editor;
      var content = prosemirror.markdown.defaultMarkdownSerializer.serialize(editor.state.doc);
      console.log(content);
    },



    '#toggle-view click' : function(el,ev){
      ev.preventDefault();
      var showMarkdown = true;
      var vm = this.viewModel;
      if(!vm.markdownMode){

        var content = prosemirror.markdown.defaultMarkdownSerializer.serialize(vm.editor.state.doc);

        this.element.find(".content").html("");
        var te = this.element.find(".content")[0].appendChild(document.createElement("textarea"))

        te.value = content
        vm.attr('markdownMode', true);
        vm.editor.destroy();
      }else{
        console.log('switch from markdown')
        vm.attr('markdownMode', false);
        var markdown = this.element.find(".content textarea").val();
        console.log(markdown);
        this.element.find(".content").html("");
        initProsemirror(this.element, this.viewModel, markdown);
      }

    }
  }
});

function initProsemirror(element, viewModel, markdown){


  var markdownSchema = prosemirror.markdown.schema;



  var newSchema = new Schema({
    nodes: markdownSchema.spec.nodes,
    marks: markdownSchema.spec.marks
  })

  schema = newSchema;



  var initialState = EditorState.create({
    doc: initDoc(markdown),
    plugins: initPlugins(schema)
  });

  var editor = viewModel.editor = new EditorView(element[0].querySelector(".content"), {
    state : initialState,
    dispatchTransaction : function(tr){
      console.log('dispatchTransaction');
      var newState = editor.state.apply(tr);
      editor.updateState(newState)
      console.log('should update menu')

      menu.markMenu(newState, viewModel);
    }
  })
  
  menu.initCommands(viewModel.commands, schema);
}



function initPlugins(schema){

  var plugins = [
    buildInputRules(schema),
    keymap(buildKeymap(schema)),
    keymap(baseKeymap),
    history(),
    linkifyPlugin()
  ]
  return plugins;
}

function initDoc(markdown){
  markdown = markdown || "";

  var parser = new prosemirror.markdown.MarkdownParser(schema,
                                  prosemirror.markdown.defaultMarkdownParser.tokenizer,
                                  prosemirror.markdown.defaultMarkdownParser.tokens)


  //var doc = ProseMirrorMarkdown.defaultMarkdownParser.parse(markdown);
  var doc = parser.parse(markdown);
  return doc;
}
