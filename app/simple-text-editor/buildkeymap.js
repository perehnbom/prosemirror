var ref = require("prosemirror-commands");
var wrapIn = ref.wrapIn;
var setBlockType = ref.setBlockType;
var chainCommands = ref.chainCommands;
var toggleMark = ref.toggleMark;
var exitCode = ref.exitCode;
var ref$1 = require("prosemirror-schema-table");
var selectNextCell = ref$1.selectNextCell;
var selectPreviousCell = ref$1.selectPreviousCell;
var ref$2 = require("prosemirror-schema-list");
var wrapInList = ref$2.wrapInList;
var splitListItem = ref$2.splitListItem;
var liftListItem = ref$2.liftListItem;
var sinkListItem = ref$2.sinkListItem;
var ref$3 = require("prosemirror-history");
var undo = ref$3.undo;
var redo = ref$3.redo;

var mac = typeof navigator != "undefined" ? /Mac/.test(navigator.platform) : false

module.exports = function buildKeymap(schema, mapKeys) {
  var keys = {}, type
  function bind(key, cmd) {
    if (mapKeys) {
      var mapped = mapKeys[key]
      if (mapped === false) { return }
      if (mapped) { key = mapped }
    }
    keys[key] = cmd
  }

  bind("Mod-z", undo)
  bind("Shift-Mod-z", redo)
  if (!mac) { bind("Mod-y", redo) }

  if (type = schema.marks.strong)
    { bind("Mod-b", toggleMark(type)) }
  if (type = schema.marks.em)
    { bind("Mod-i", toggleMark(type)) }
  if (type = schema.marks.code)
    { bind("Mod-`", toggleMark(type)) }

  if (type = schema.nodes.bullet_list)
    { bind("Shift-Ctrl-8", wrapInList(type)) }
  if (type = schema.nodes.ordered_list)
    { bind("Shift-Ctrl-9", wrapInList(type)) }
  if (type = schema.nodes.blockquote)
    { bind("Ctrl->", wrapIn(type)) }
  if (type = schema.nodes.hard_break) {
    var br = type, cmd = chainCommands(exitCode, function (state, dispatch) {
      dispatch(state.tr.replaceSelectionWith(br.create()).scrollIntoView())
      return true
    })
    bind("Mod-Enter", cmd)
    bind("Shift-Enter", cmd)
    if (mac) { bind("Ctrl-Enter", cmd) }
  }
  if (type = schema.nodes.list_item) {
    bind("Enter", splitListItem(type))
    bind("Mod-[", liftListItem(type))
    bind("Mod-]", sinkListItem(type))
  }
  if (type = schema.nodes.paragraph)
    { bind("Shift-Ctrl-0", setBlockType(type)) }
  if (type = schema.nodes.code_block)
    { bind("Shift-Ctrl-\\", setBlockType(type)) }
  if (type = schema.nodes.heading)
    { for (var i = 1; i <= 6; i++) { bind("Shift-Ctrl-" + i, setBlockType(type, {level: i})) } }
  if (type = schema.nodes.horizontal_rule) {
    var hr = type
    bind("Mod-_", function (state, dispatch) {
      dispatch(state.tr.replaceSelectionWith(hr.create()).scrollIntoView())
      return true
    })
  }

  if (schema.nodes.table_row) {
    bind("Tab", selectNextCell)
    bind("Shift-Tab", selectPreviousCell)
  }
  return keys
}
