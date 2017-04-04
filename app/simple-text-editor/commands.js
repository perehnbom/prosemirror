const {toggleMark, setBlockType} = require("prosemirror-commands")
const {Fragment} = require("prosemirror-model")
var runners = {
  strong : schema => toggleMark(schema.marks.strong),
  em : schema => toggleMark(schema.marks.em),
  heading : function(schema, level){
    if(level === 'paragraph'){
      return setBlockType(schema.nodes.paragraph);
    }else{
      return setBlockType(schema.nodes.heading, {
        level : level
      })
    }
  },
  referenceSearch : function(schema){
    return function(state, dispatch) {
      dispatch(state.tr.replaceSelectionWith(schema.nodes.referenceSearch.create({})))
    }
  },
  reference : function(schema, reference){
    return function(state, dispatch) {
      let {empty, $from, $to} = state.selection,
        content = Fragment.empty
      if (!empty && $from.sameParent($to) && $from.parent.inlineContent){
        content = $from.parent.content.cut($from.parentOffset, $to.parentOffset)
      }
      dispatch(state.tr.replaceSelectionWith(schema.nodes.reference.create({ref: reference}, content)))
    }
  }
}

function runCommand(schema, editor, command, option){
  var run = runners[command](schema, option);
  return run(editor.state, editor.dispatch);
}


function getCommandState(schema, editor){
  var state = editor.state,
    selection = state.selection,
    $from = selection.$from,
    blockType = $from.parent.type.name,
    nodeJson = $from.parent.toJSON(),
    result = {
    };

  if(blockType === 'paragraph'){
    result.heading = 'paragraph'
  }else{
    result.heading = '' + nodeJson.attrs.level;
  }
  result.em = markActive(state, schema.marks.em)
  result.strong = markActive(state, schema.marks.strong)
  console.log(result)
  return result;
}

function markActive(state, type) {
  var selection = state.selection;

  if (selection.empty) {
    return type.isInSet(state.storedMarks || selection.$from.marks())
  } else {
    return state.doc.rangeHasMark(selection.from, selection.to, type)
  }
}

exports.getCommandState = getCommandState;
exports.runCommand = runCommand;
