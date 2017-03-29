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
