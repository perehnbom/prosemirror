var can = require('can'),
$ = window.$ = require('jquery');

var prosemirror = {
  model : require("prosemirror-model"),
  state : require("prosemirror-state"),
  commands : require("prosemirror-commands"),
  inputrules : require("prosemirror-inputrules"),
  keymap : require("prosemirror-keymap"),
  history : require("prosemirror-history"),
  view : require("prosemirror-view"),
  markdown : require("prosemirror-markdown"),
  transform : require("prosemirror-transform")
}

const {linkifyPlugin} = require('./linkify-plugin')

var Schema = prosemirror.model.Schema,
  EditorState = prosemirror.state.EditorState,
  Plugin = prosemirror.state.Plugin,
  DOMParser = prosemirror.model.DOMParser,
  Slice = prosemirror.model.Slice,
  Fragment = prosemirror.model.Fragment,
  toggleMark = prosemirror.commands.toggleMark,
  keymap = prosemirror.keymap.keymap,
  history = prosemirror.history.history,
  baseKeymap = prosemirror.commands.baseKeymap,
  EditorView = prosemirror.view.EditorView,
  toggleMark = prosemirror.commands.toggleMark,
  insertPoint = prosemirror.transform.insertPoint,
  buildKeymap = require('./buildkeymap');

var schema;

class TestView{
  constructor(){
    
  }
  
  testRun() {
    return "HELLO"
  }
}



can.Component.extend({
  tag: "simple-text-editor",
  template: can.stache(require('raw-loader!./simple-text-editor.html')),
  viewModel: {
    markdownMode : false,
    commands : {

    },
    markMenu : markMenu
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

    '.insert-link click' : function(el,ev){
      ev.preventDefault();
      var editor = this.viewModel.editor;
      var state = editor.state;

      //var transaction = state.tr.insertText("testTEXT")
      //editor.dispatch(transaction);

      insertTestLink();
      //insertSeachTarget();



      function insertTestLink(){
        // see example setup to insert link
        var linkType = schema.nodes.itemlink;
        var node = linkType.create({
          href : 'http://www.google.com',
          text : 'google link'
        });
        //var node = ProseMirrorMarkdown.schema.nodes.paragraph;
        var transaction = state.tr.replaceSelectionWith(node, true);
        editor.dispatch(transaction)
      }

      function insertSeachTarget(){
        // Create searchtarget using decoration, see prosemirror-droptarget example
        var newNodeType = schema.nodes.search;
        var newNode = newNodeType.create({level : 1});
        //var node = ProseMirrorMarkdown.schema.nodes.paragraph;
        var transaction2 = state.tr.replaceSelectionWith(newNode, true);
        editor.dispatch(transaction2)
      }

      //insertPoint(state.doc, state.selection.from, newNode)
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


  var searchNode = {
    content: "inline<_>*",
    group: "block",
    parseDOM: [{ tag: 'search' }],
    toDOM : function(){
      return ['search']
    }
  };
  var linkNode = {
    content: "inline<_>*",
    group: "block",
    parseDOM: [{ tag: 'itemlink' }],
    toDOM : function(){
      return ['itemlink']
    }
  };
  var newSchema = new Schema({
    nodes: markdownSchema.spec.nodes.addToEnd('search', searchNode).addToEnd('itemlink', linkNode),
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


  viewModel.commands.attr('paragraph', {
    run : prosemirror.commands.setBlockType(schema.nodes.paragraph),
    paragraph : true
  })
  viewModel.commands.attr('h1', {
    run : prosemirror.commands.setBlockType(schema.nodes.heading, {
      level : 1
    }),
    heading : 1
  })
  viewModel.commands.attr('h2', {
    run : prosemirror.commands.setBlockType(schema.nodes.heading, {
      level : 2
    }),
    heading : 2
  })
  viewModel.commands.attr('h3', {
    run : prosemirror.commands.setBlockType(schema.nodes.heading, {
      level : 3
    }),
    heading : 3
  })


}

function markActive(state, type) {
  var selection = state.selection;

  if (selection.empty) {
    return type.isInSet(state.storedMarks || selection.$from.marks())
  } else {
    return state.doc.rangeHasMark(selection.from, selection.to, type)
  }
}

function initPlugins(schema){


  var plugins = [
    prosemirror.inputrules.inputRules({rules: prosemirror.inputrules.allInputRules.concat(buildInputRules(schema))}),
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


//const HTTP_LINK_REGEX = /\bhttps?:\/\/[\w_\/\.]+/g
var HTTP_LINK_REGEX = /((http|https|ftp):\/\/[\w?=&.\/-;#~%-]+(?![\w\s?&.\/;#~%"=-]*>))/g
var linkify = function(fragment){
  var linkified = []
  fragment.forEach(function(child){
    if (child.isText) {
      var text = child.text
      var pos = 0, match

      while (match = HTTP_LINK_REGEX.exec(text)) {
        var start = match.index
        var end = start + match[0].length
        var link = child.type.schema.marks['link']

        // simply copy across the text from before the match
        if (start > 0) {
          linkified.push(child.cut(pos, start))
        }

        var urlText = text.slice(start, end)
        linkified.push(
          child.cut(start, end).mark(link.create({href: urlText}).addToSet(child.marks))
        )
        pos = end
      }

      // copy over whatever is left
      if (pos < text.length) {
        linkified.push(child.cut(pos))
      }
    } else {
      linkified.push(child.copy(linkify(child.content)))
    }
  })

  return Fragment.fromArray(linkified)
}

function markMenu(state){
  var selection = state.selection;

  var $from = state.selection.$from;
  var blockType = $from.parent.type.name;


  var nodeJson = $from.parent.toJSON();


  this.commands.each(function(command){
    if(command.paragraph){
      command.attr('active', blockType === 'paragraph');
    }else if(command.heading){
      var active = false;
      if(blockType === 'heading'){


        var type = $from.parent.type;
        active = nodeJson.attrs.level == command.heading;
      }
      command.attr('active', active);

    }else if(command.mark){
      var active = markActive(state, command.mark);
      command.attr('active', !!active);
    }

  })

}

function buildInputRules(schema) {
  var result = [], type
  if (type = schema.nodes.blockquote) { result.push(prosemirror.inputrules.blockQuoteRule(type)) }
  if (type = schema.nodes.ordered_list) { result.push(prosemirror.inputrules.orderedListRule(type)) }
  if (type = schema.nodes.bullet_list) { result.push(prosemirror.inputrules.bulletListRule(type)) }
  if (type = schema.nodes.code_block) { result.push(prosemirror.inputrules.codeBlockRule(type)) }
  if (type = schema.nodes.heading) { result.push(prosemirror.inputrules.headingRule(type, 6)) }
  return result
}
