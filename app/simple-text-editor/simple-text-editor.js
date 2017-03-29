var can = require('can'),
$ = window.$ = require('jquery');

var prosemirror = {
  model : require("prosemirror-model"),
  state : require("prosemirror-state"),
  view : require("prosemirror-view"),
}
const {FootnoteView} = require("./footnote")
const {EditorView} = require("prosemirror-view")
const prosemirrorHandler = require('./prosemirror-handler');
const menu = require('./menu');


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
  
      console.log(prosemirrorHandler.toMarkdown(this.viewModel.editor));
    },
    '.insert-footnote click' : function(el,ev){
      ev.preventDefault();
      var command = this.viewModel.commands.attr(el.attr('command'));
      var editor = this.viewModel.editor;
      command.run(editor.state, editor.dispatch);
    },


    '#toggle-view click' : function(el,ev){
      ev.preventDefault();
      var showMarkdown = true;
      var vm = this.viewModel;
      if(!vm.markdownMode){

        var content = prosemirrorHandler.toMarkdown(this.viewModel.editor);

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

  var schema = prosemirrorHandler.initSchema();

  var editor = viewModel.editor = new EditorView(element[0].querySelector(".content"), {
    state : prosemirrorHandler.initialState(schema, markdown),
    dispatchTransaction : function(tr){
      var newState = editor.state.apply(tr);
      editor.updateState(newState)
      menu.markMenu(newState, viewModel);
    },
    nodeViews: {
      footnote(node, view, getPos) { 
        return new FootnoteView(node, view, getPos) 
      }
    }
  })
  menu.initCommands(viewModel.commands, schema);
}
