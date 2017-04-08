const {toggleMark, setBlockType} = require("prosemirror-commands")
const {Fragment} = require("prosemirror-model")
const {undo, redo} = require("prosemirror-history")
const {wrapInList} = require("prosemirror-schema-list")
var runners = {
  strong : (schema, editor) => toggleMark(schema.marks.strong)(editor.state, editor.dispatch),
  em : (schema, editor) => toggleMark(schema.marks.em)(editor.state, editor.dispatch),
  undo : (schema, editor) => undo(editor.state, editor.dispatch),
  redo : (schema, editor) => redo(editor.state, editor.dispatch),
  heading : function(schema, level){
    if(level === 'paragraph'){
      return setBlockType(schema.nodes.paragraph);
    }else{
      return setBlockType(schema.nodes.heading, {
        level : level
      })
    }
  },
  
  bullet_list : (schema, editor) => wrapInList(schema.nodes.bullet_list)(editor.state, editor.dispatch),
  ordered_list : (schema, editor) => wrapInList(schema.nodes.ordered_list)(editor.state, editor.dispatch),
  
  referenceSearch : function(schema, editor){
    return editor.dispatch(editor.state.tr.replaceSelectionWith(schema.nodes.referenceSearch.create({})))
  },
  reference : function(schema, editor, reference){
  
    editor.dispatch(editor.state.tr.replaceSelectionWith(schema.nodes.reference.create({ref: reference})))
    //editor.focus()
  },
  link : function(schema, editor){
    var markType = schema.marks.link,
      state = editor.state,
      dispatch = editor.dispatch;
  
    if (markActive(state, markType)) {
      toggleMark(markType)(state, dispatch)
    }else{
      var attrs = {
        href : 'http://www.google.com',
        title : ''
      }
      
      let {empty, from, to, $from, $to} = state.selection,
        content = Fragment.empty
        
      if (!empty && $from.sameParent($to) && $from.parent.inlineContent){
        content = $from.parent.content.cut($from.parentOffset, $to.parentOffset)
      }
      toggleMark(markType, attrs)(state, dispatch)
      editor.focus();      
    }
  }
}

function markActive(state, type) {
  var selection = state.selection;

  if (selection.empty) {
    return type.isInSet(state.storedMarks || selection.$from.marks())
  } else {
    return state.doc.rangeHasMark(selection.from, selection.to, type)
  }
}


function runCommand(schema, editor, command, option){
  /*
  var run = runners[command](schema, option);
  return run(editor.state, editor.dispatch, editor);
  */
  var run = runners[command];
  return run(schema, editor, option);
}


function getCommands(){
  return {
    paragraph : {active:false},
    h1 : {active:false},
    h2 : {active:false},
    h3 : {active:false},
    em : {active:false},
    strong : {active:false},
    link : {active: false},
    reference : {active:false},
    undo : {runnable:false},
    redo : {runnable:false},
    bullet_list : {active:false},
    ordered_list : {active:false}
  }
}


function getCommandState(schema, editor){
  var state = editor.state,
    selection = state.selection,
    $from = selection.$from,
    blockType = $from.parent.type.name,
    result = getCommands();



  if(blockType === 'paragraph'){
    result.paragraph.active = true;
  }else{
    result["h" + $from.parent.attrs.level].active = true ;
  }
  result.undo.runnable = undo(state)
  result.redo.runnable = redo(state)
  result.em.active = !!markActive(state, schema.marks.em)
  result.strong.active = !!markActive(state, schema.marks.strong)
  result.link.active = !!markActive(state, schema.marks.link)


  return result;
}



exports.getCommandState = getCommandState;
exports.runCommand = runCommand;
