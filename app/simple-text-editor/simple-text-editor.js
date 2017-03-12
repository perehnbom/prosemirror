var can = require('can'),
$ = window.$ = require('jquery');

var EditorState = require("prosemirror-state").EditorState
var DOMParser = require("prosemirror-model").DOMParser

var ProseMirrorCommands = require("prosemirror-commands");
var toggleMark = ProseMirrorCommands.toggleMark;

var ProseMirrorInputRules = require("prosemirror-inputrules");

var ProseMirrorKeymap = require("prosemirror-keymap");
var keymap = ProseMirrorKeymap.keymap;
var buildKeymap = require('./buildkeymap');

var baseKeymap = require("prosemirror-commands").baseKeymap;

var history = require("prosemirror-history").history;
var EditorView = require("prosemirror-view").EditorView;

var toggleMark = require("prosemirror-commands").toggleMark;

var ProseMirrorMarkdown = require("prosemirror-markdown");

can.Component.extend({
  tag: "simple-text-editor",
  template: can.stache(require('raw-loader!./simple-text-editor.html')),
  viewModel: {
    markdownMode : false,
    commands : {

    },
    markMenu : function(state){


      var $from = state.selection.$from;
      console.log($from.parent.type);
      
      this.commands.each(function(command){
        if(!command.mark){
          return;
        }
        var active = markActive(state, command.mark);
        command.attr('active', !!active);
      })
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
      var content = ProseMirrorMarkdown.defaultMarkdownSerializer.serialize(editor.state.doc);
      console.log(content);
    },
    '#toggle-view click' : function(el,ev){
      ev.preventDefault();
      var showMarkdown = true;
      var vm = this.viewModel;
      if(!vm.markdownMode){

        var content = ProseMirrorMarkdown.defaultMarkdownSerializer.serialize(vm.editor.state.doc);

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
  var schema = ProseMirrorMarkdown.schema;
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

      viewModel.markMenu(newState);
    }
  })

  viewModel.commands.attr('strong', {
    run : toggleMark(schema.marks.strong),
    mark : schema.marks.strong
  })
  viewModel.commands.attr('em', {
    run : toggleMark(schema.marks.em),
    mark : schema.marks.em
  })

  viewModel.commands.attr('h2', {
    run : ProseMirrorCommands.setBlockType(schema.nodes.heading, {
      level : 2
    })
  })
  viewModel.commands.attr('h3', {
    run : ProseMirrorCommands.setBlockType(schema.nodes.heading, {
      level : 3
    })
  })


}

function markActive(state, type) {
  var selection = state.selection;
  console.log(selection);
  var doc = state.doc;

  var from = selection.from;
  var $from = selection.$from;
  var to = selection.to;
  var empty = selection.empty;



  if (empty) {
    return type.isInSet(state.storedMarks || $from.marks())
  }
  else {
    return state.doc.rangeHasMark(from, to, type)
  }
}

function initPlugins(schema){
  var plugins = [
    ProseMirrorInputRules.inputRules({rules: ProseMirrorInputRules.allInputRules.concat(buildInputRules(schema))}),
    keymap(buildKeymap(schema)),
    keymap(baseKeymap),
    history()
  ]
  return plugins;

/*
  var menuPlugin = new Plugin({
    props: {
      attributes: {class: "ProseMirror-example-setup-style"},
      menuContent: buildMenuItems(options.schema).fullMenu,
      floatingMenu: true
    }
  });
  return plugins.concat(menuPlugin);
  */
}

function initDoc(markdown){
  markdown = markdown || "";
  var doc = ProseMirrorMarkdown.defaultMarkdownParser.parse(markdown);
  return doc;

  //return DOMParser.fromSchema(schema).parse(content);
}


function buildInputRules(schema) {
  var result = [], type
  if (type = schema.nodes.blockquote) { result.push(ProseMirrorInputRules.blockQuoteRule(type)) }
  if (type = schema.nodes.ordered_list) { result.push(ProseMirrorInputRules.orderedListRule(type)) }
  if (type = schema.nodes.bullet_list) { result.push(ProseMirrorInputRules.bulletListRule(type)) }
  if (type = schema.nodes.code_block) { result.push(ProseMirrorInputRules.codeBlockRule(type)) }
  if (type = schema.nodes.heading) { result.push(ProseMirrorInputRules.headingRule(type, 6)) }
  return result
}
