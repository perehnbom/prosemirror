var can = require('can'),
$ = window.$ = require('jquery');

var prosemirror = {
  model : require("prosemirror-model"),
  state : require("prosemirror-state"),
  view : require("prosemirror-view"),
}

const {ReferenceView, ReferenceSearchView, runReference} = require("./reference")
const {EditorView} = require("prosemirror-view")
const prosemirrorHandler = require('./prosemirror-handler');

const {runCommand, getCommandState} = require('./commands');

var schema = prosemirrorHandler.initSchema();

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

        initProsemirror(this.element, this.viewModel, "HEJ");

    },
    'removed' : function(){
      this.viewModel.editor.destroy();
    },
    '.toggle-mark click' : function(el,ev){
      ev.preventDefault();
      runCommand(schema, this.viewModel.editor, el.attr('command'));
    },
    '.set-heading click' : function(el,ev){
      ev.preventDefault();
      runCommand(schema, this.viewModel.editor, 'heading', el.attr('heading'));

    },
    '.run-command mousedown' : function(el,ev){
      runCommand(schema, this.viewModel.editor, el.attr('command'))
    },
    '.run-command click' : function(el,ev){
      ev.preventDefault();
    },
    '#save click' : function(el,ev){
      ev.preventDefault();

      console.log(prosemirrorHandler.toMarkdown(this.viewModel.editor));
    },
    '.insert-reference mousedown' : function(el,ev){
      ev.preventDefault();

      runCommand(schema, this.viewModel.editor, 'referenceSearch')
    },
    '.insert-reference click' : function(el,ev){
      ev.preventDefault();
      console.log('insert-reference click')
    },
    'search-box click' : function(el,ev){
      ev.stopPropagation();
      ev.preventDefault();
      runCommand(schema, this.viewModel.editor, 'reference', "2334")
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



  var editor = viewModel.editor = new EditorView(element[0].querySelector(".content"), {
    state : prosemirrorHandler.initialState(schema, markdown),
    
    dispatchTransaction : function(tr){
      
      var newState = editor.state.apply(tr);
      editor.updateState(newState)

      var commandState = getCommandState(schema, editor);
      viewModel.commands.attr(commandState);
      //menu.markMenu(newState, viewModel);
    },
    handleDOMEvents : {
      mousedown : function(view, event){
        
        if(element.is('on-edit')){
          return;
        }
        var el = event.srcElement;
        if(el.href){
          window.open(el.href,'_blank');
          event.preventDefault();
          return true;
        }
      }
    },
    editable : function(){
      return true;
    },
    
    onFocus : function(editor, event){
      element.addClass('on-edit')
    },
    onBlur : function(editor, event){
      console.log('onBlur')
      element.removeClass('on-edit')
    },
    nodeViews: {
      reference(node, view, getPos) {
        return new ReferenceView(node, view, getPos)
      },
      referenceSearch(node, view, getPos) {
        return new ReferenceSearchView(node, view, getPos)
      }
    }
  })
  editor.customEventHandler = function(event, node){
    console.log('handle custom event ' + event + ' for ' +node )
  }
  var commands = getCommandState(schema, editor);
  viewModel.commands.attr(commands);
  //menu.initCommands(viewModel.commands, schema);
}
