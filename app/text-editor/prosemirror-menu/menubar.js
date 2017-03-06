var crel = require("crel")
var ref = require("prosemirror-view");
var EditorView = ref.EditorView;

var ref$1 = require("./menu");
var renderGrouped = ref$1.renderGrouped;

var prefix = "ProseMirror-menubar"

// ::- A wrapper around
// [`EditorView`](http://prosemirror.net/ref.html#view.EditorView)
// that adds a menubar above the editor.
//
// Supports the following additional props:
//
// - **`floatingMenu`**`: ?bool` determines whether the menu floats,
//   i.e. whether it sticks to the top of the viewport when the editor
//   is partially scrolled out of view.
//
// - **`menuContent`**`: [[MenuElement]]` provides the content of the
//   menu, as a nested array to be passed to `renderGrouped`.
var MenuBarEditorView = function MenuBarEditorView(place, props) {
  var this$1 = this;

  // :: dom.Node The wrapping DOM element around the editor and the
  // menu. Will get the CSS class `ProseMirror-menubar-wrapper`.
  this.wrapper = crel("div", {class: prefix + "-wrapper"})
  if (place && place.appendChild) { place.appendChild(this.wrapper) }
  else if (place) { place(this.wrapper) }
  if (!props.dispatchTransaction)
    { props.dispatchTransaction = function (tr) { return this$1.updateState(this$1.editor.state.apply(tr)); } }
  // :: EditorView The wrapped editor view. _Don't_ directly call
  // `update` or `updateState` on this, always go through the
  // wrapping view.
  this.editor = new EditorView(this.wrapper, props)
  PM.editor = this.editor;
  
  this.menu = crel("div", {class: prefix})
  this.menu.className = prefix
  this.spacer = null

  this.wrapper.insertBefore(this.menu, this.wrapper.firstChild)

  this.maxHeight = 0
  this.widthForMaxHeight = 0
  this.floating = false

  // :: EditorProps The current props of this view.
  this.props = props
  this.updateMenu()

  if (this.editor.someProp("floatingMenu")) {
    this.updateFloat()
    this.scrollFunc = function () {
      var root = this$1.editor.root
      if (!(root.body || root).contains(this$1.wrapper))
        { window.removeEventListener("scroll", this$1.scrollFunc) }
      else
        { this$1.updateFloat() }
    }
    window.addEventListener("scroll", this.scrollFunc)
  }
};

// :: (EditorProps) Update the view's props.
MenuBarEditorView.prototype.update = function update (props) {
  this.props = props
  this.editor.update(props)
  this.updateMenu()
};

// :: (EditorState) Update only the state of the editor.
MenuBarEditorView.prototype.updateState = function updateState (state) {
  console.log('updateState')
  this.editor.updateState(state)
  this.updateMenu()
};

MenuBarEditorView.prototype.updateMenu = function updateMenu () {
  console.log('updateMenu')
  this.menu.textContent = ""
  this.menu.appendChild(renderGrouped(this.editor, this.editor.someProp("menuContent")))

  if (this.floating) {
    this.updateScrollCursor()
  } else {
    if (this.menu.offsetWidth != this.widthForMaxHeight) {
      this.widthForMaxHeight = this.menu.offsetWidth
      this.maxHeight = 0
    }
    if (this.menu.offsetHeight > this.maxHeight) {
      this.maxHeight = this.menu.offsetHeight
      this.menu.style.minHeight = this.maxHeight + "px"
    }
  }
};


MenuBarEditorView.prototype.updateScrollCursor = function updateScrollCursor () {
  var selection = this.editor.root.getSelection()
  if (!selection.focusNode) { return }
  var rects = selection.getRangeAt(0).getClientRects()
  var selRect = rects[selectionIsInverted(selection) ? 0 : rects.length - 1]
  if (!selRect) { return }
  var menuRect = this.menu.getBoundingClientRect()
  if (selRect.top < menuRect.bottom && selRect.bottom > menuRect.top) {
    var scrollable = findWrappingScrollable(this.wrapper)
    if (scrollable) { scrollable.scrollTop -= (menuRect.bottom - selRect.top) }
  }
};

MenuBarEditorView.prototype.updateFloat = function updateFloat () {
  var parent = this.wrapper, editorRect = parent.getBoundingClientRect()
  if (this.floating) {
    if (editorRect.top >= 0 || editorRect.bottom < this.menu.offsetHeight + 10) {
      this.floating = false
      this.menu.style.position = this.menu.style.left = this.menu.style.width = ""
      this.menu.style.display = ""
      this.spacer.parentNode.removeChild(this.spacer)
      this.spacer = null
    } else {
      var border = (parent.offsetWidth - parent.clientWidth) / 2
      this.menu.style.left = (editorRect.left + border) + "px"
      this.menu.style.display = (editorRect.top > window.innerHeight ? "none" : "")
    }
  } else {
    if (editorRect.top < 0 && editorRect.bottom >= this.menu.offsetHeight + 10) {
      this.floating = true
      var menuRect = this.menu.getBoundingClientRect()
      this.menu.style.left = menuRect.left + "px"
      this.menu.style.width = menuRect.width + "px"
      this.menu.style.position = "fixed"
      this.spacer = crel("div", {class: prefix + "-spacer", style: ("height: " + (menuRect.height) + "px")})
      parent.insertBefore(this.spacer, this.menu)
    }
  }
};

// :: ()
// Destroy the editor instance.
MenuBarEditorView.prototype.destroy = function destroy () {
  this.editor.destroy()
};
exports.MenuBarEditorView = MenuBarEditorView

// Not precise, but close enough
function selectionIsInverted(selection) {
  if (selection.anchorNode == selection.focusNode) { return selection.anchorOffset > selection.focusOffset }
  return selection.anchorNode.compareDocumentPosition(selection.focusNode) == Node.DOCUMENT_POSITION_FOLLOWING
}

function findWrappingScrollable(node) {
  for (var cur = node.parentNode; cur; cur = cur.parentNode)
    { if (cur.scrollHeight > cur.clientHeight) { return cur } }
}
