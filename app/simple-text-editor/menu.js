const {toggleMark, setBlockType} = require("prosemirror-commands")
const {initRunFootnote} = require("./footnote")
const {initRunSearchReference, initRunReference} = require("./reference")
exports.initCommands = function(commands, schema){
  commands.attr('strong', {

    mark : schema.marks.strong
  })
  commands.attr('em', {

    mark : schema.marks.em
  })


  commands.attr('paragraph', {

    paragraph : true
  })
  commands.attr('h1', {

    heading : 1
  })
  commands.attr('h2', {

    heading : 2
  })
  commands.attr('h3', {

    heading : 3
  }),
  commands.attr('footnote', {
    run : initRunFootnote(schema)
  }),
  commands.attr('referenceSearch', {

  })

}


exports.markMenu = function(state, vm){
  var selection = state.selection;

  var $from = state.selection.$from;
  var blockType = $from.parent.type.name;

  var nodeJson = $from.parent.toJSON();

  vm.commands.each(function(command, commandName){
    
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
