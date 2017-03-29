var prosemirror = {
  commands : require("prosemirror-commands")
}


function initCommands(schema){
  var commands = {
    strong : {
      run : prosemirror.commands.toggleMark(schema.marks.strong),
      mark : schema.marks.strong
    },
    em : {
      run : prosemirror.commands.toggleMark(schema.marks.em),
      mark : schema.marks.em
    },
    paragraph : {
      run : prosemirror.commands.setBlockType(schema.nodes.paragraph),
      paragraph : true
    },
    h1 : {
      run : prosemirror.commands.setBlockType(schema.nodes.heading, {
        level : 1
      }),
      heading : 1
    },
    h2 : {
      run : prosemirror.commands.setBlockType(schema.nodes.heading, {
        level : 2
      }),
      heading : 2
    },
    h3 : {
      run : prosemirror.commands.setBlockType(schema.nodes.heading, {
        level : 3
      }),
      heading : 3
    }
  }
  return commands;
}


exports.initCommands = initCommands;
