const {schema, MarkdownParser, defaultMarkdownParser, defaultMarkdownSerializer} = require("./markdown/index")
const {Schema} = require("prosemirror-model")
const {EditorState} = require("prosemirror-state")
const {baseKeymap} = require('prosemirror-commands')
const {history} = require("prosemirror-history")
const {keymap} = require("prosemirror-keymap")

const {linkifyPlugin} = require('./linkify-plugin')
const {buildInputRules} = require('./input-rules')
const buildKeymap = require('./buildkeymap');
const {runners, getCommandState} = require('./commands');

const {ReferenceView, ReferenceSearchView, runReference} = require("./reference")
const {EditorView} = require("prosemirror-view")

exports.editorHandler = function(component){
  var schema = initSchema(),
    editor = initEditor(schema, component, "HEJ"),
    viewModel = component.viewModel,
    element = component.element;

  viewModel.commands.attr(getCommandState(schema, editor));

  var actions = {
    runCommand : function(command, option){
      
      var run = runners[command];
      return run(schema, editor, option);
    },
    editor : editor,
    toMarkdown : function(){
      return defaultMarkdownSerializer.serialize(editor.state.doc);
    },
    handleOnFocus : function(){
      handleOnFocus(component)
    },
    handleOnBlur : function(){
      handleOnBlur(component)
    },
    handleMenuClick : function(){
      handleMenuClick(component, editor);
    },


    destroy : function(){
      editor.destroy();
    },
    toggleView : function(){
      var showMarkdown = true;
      var vm = this.viewModel;

      if(!viewModel.markdownMode){

        var content = actions.toMarkdown();

        element.find(".content").html("");
        var te = element.find(".content")[0].appendChild(document.createElement("textarea"))

        te.value = content
        viewModel.attr('markdownMode', true);
        editor.destroy();
      }else{
        var markdown = element.find(".content textarea").val();
        viewModel.attr('markdownMode', false);

        element.find(".content").html("");
        editor = initEditor(schema, component, markdown);
      }
    }
  }
  return actions;
}


function initEditor(schema, component, markdown){
  var element = component.element,
    viewModel = component.viewModel;


  var editor = new EditorView(element[0].querySelector(".content"), {
    state : initialState(schema, markdown),

    dispatchTransaction : function(tr){

      var newState = editor.state.apply(tr);
      editor.updateState(newState)

      var commandState = getCommandState(schema, editor);
      viewModel.commands.attr(commandState);
      //menu.markMenu(newState, viewModel);
    },
    handleDOMEvents : {
      mousedown : function(view, event){

        if(element.is('.on-edit')){
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
      handleOnFocus(component);
    },
    onBlur : function(editor, event){
      handleOnBlur(component);
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

  return editor;
}


function initSchema(){
  var newSchema = new Schema({
    //nodes: schema.spec.nodes.addBefore("image", "footnote", footnote),
    nodes: schema.spec.nodes,
    marks: schema.spec.marks
  })
  return newSchema;
}

function initialState(schema, markdown){
  return EditorState.create({
    doc: initDoc(schema, markdown),

    plugins: initPlugins(schema)
  });
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

function initDoc(schema, markdown){
  markdown = markdown || "";

  var parser = new MarkdownParser(schema, defaultMarkdownParser.tokenizer, defaultMarkdownParser.tokens)
  var doc = parser.parse(markdown);
  return doc;
}

function handleMenuClick(component, editor){
  var vm = component.viewModel,
    el = component.element;

  vm.setHaltClose();
  setTimeout(function(){
    if(vm.markdownMode){
      el.find('textarea').focus();
    }else{
      editor.focus();
    }
  }, 100);
}

function handleOnFocus(component){
  component.element.addClass('on-edit');
}

function handleOnBlur(component){
  setTimeout(function(){
    if(!component.viewModel.haltClose){
      component.element.removeClass('on-edit')
    }
    component.viewModel.resetHaltClose();
  }, 100)
}
