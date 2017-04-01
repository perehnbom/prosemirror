const {toggleMark, setBlockType} = require("prosemirror-commands")
const {initRunFootnote} = require("./footnote")
const {initRunReference} = require("./reference")
exports.initCommands = function(commands, schema){
  commands.attr('strong', {
    run : toggleMark(schema.marks.strong),
    mark : schema.marks.strong
  })
  commands.attr('em', {
    run : toggleMark(schema.marks.em),
    mark : schema.marks.em
  })


  commands.attr('paragraph', {
    run : setBlockType(schema.nodes.paragraph),
    paragraph : true
  })
  commands.attr('h1', {
    run : setBlockType(schema.nodes.heading, {
      level : 1
    }),
    heading : 1
  })
  commands.attr('h2', {
    run : setBlockType(schema.nodes.heading, {
      level : 2
    }),
    heading : 2
  })
  commands.attr('h3', {
    run : setBlockType(schema.nodes.heading, {
      level : 3
    }),
    heading : 3
  }),
  commands.attr('footnote', {
    run : initRunFootnote(schema)
  }),
  commands.attr('reference', {
    run : initRunReference(schema)
  })
}


exports.markMenu = function(state, vm){
  var selection = state.selection;

  var $from = state.selection.$from;
  var blockType = $from.parent.type.name;

  var nodeJson = $from.parent.toJSON();

  vm.commands.each(function(command){
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

function markActive(state, type) {
  var selection = state.selection;

  if (selection.empty) {
    return type.isInSet(state.storedMarks || selection.$from.marks())
  } else {
    return state.doc.rangeHasMark(selection.from, selection.to, type)
  }
}
