;var assign;
((assign = require("./menu"), exports.MenuItem = assign.MenuItem, exports.Dropdown = assign.Dropdown, exports.DropdownSubmenu = assign.DropdownSubmenu, exports.renderGrouped = assign.renderGrouped, exports.icons = assign.icons, exports.joinUpItem = assign.joinUpItem, exports.liftItem = assign.liftItem, exports.selectParentNodeItem = assign.selectParentNodeItem, exports.undoItem = assign.undoItem, exports.redoItem = assign.redoItem, exports.wrapItem = assign.wrapItem, exports.blockTypeItem = assign.blockTypeItem))
exports.MenuBarEditorView = require("./menubar").MenuBarEditorView

// !! This module defines a number of building blocks for ProseMirror
// menus, along with a [menu bar](#menu.MenuBarEditorView) implementation.

// MenuElement:: interface
// The types defined in this module aren't the only thing you can
// display in your menu. Anything that conforms to this interface can
// be put into a menu structure.
//
//   render:: (pm: ProseMirror) → ?dom.Node
//   Render the element for display in the menu. Returning `null` can be
//   used to signal that this element shouldn't be displayed for the
//   given editor state.
