
const {EditorState} = require("prosemirror-state")
const {insertPoint} = require("prosemirror-transform")
const {MenuItem} = require("prosemirror-menu")
const {Schema, DOMParser, Fragment} = require("prosemirror-model")
const {EditorView} = require("prosemirror-view")
const {schema} = require("prosemirror-schema-basic")
const {exampleSetup, buildMenuItems} = require("prosemirror-example-setup")



const link = {
  inline: true,
  attrs: {
    href: {},
    type: {default: "link"},
    title: {default: " "}
  },
  group: "inline",
  draggable: true,
  atom: true,
  parseDOM: [{tag: "a[href]", getAttrs(dom) {
    return {
      href: dom.getAttribute("href"),
      type: dom.getAttribute("type"),
      title: dom.getAttribute("title")
    }
  }}],
  toDOM(node) { return ["a", node.attrs] }
}



function initRun(schema){
  return function(state, dispatch) {
    
    let {empty, $from, $to} = state.selection, 
      content = Fragment.empty
    if (!empty && $from.sameParent($to) && $from.parent.inlineContent){
      content = $from.parent.content.cut($from.parentOffset, $to.parentOffset)
    }
      
      
    console.log('create link')
    dispatch(state.tr.replaceSelectionWith(schema.nodes.link.create({href : 'www.google.com', type : "link", title : "My link"}, content)))
  }
}

class LinkView {
  constructor(node, view, getPos) {
    this.node = node
    this.outerView = view
    this.getPos = getPos

    this.dom = document.createElement("a")
    this.dom.setAttribute('type', 'link')
    this.dom.setAttribute('title', 'link title')
    this.open = false
    this.innerView = null
    this.tooltip = null
  }

  selectNode() {
    if (!this.open) {
      console.log('render selected node')
      this.open = true
      this.dom.classList.add("ProseMirror-selectednode")
      this.tooltip = this.dom.appendChild(document.createElement("div"))
      this.tooltip.className = "footnote-tooltip"
      
    }
  }

  dispatchInner(tr) {
    let {state, transactions} = this.innerView.state.applyTransaction(tr)
    this.innerView.updateState(state)

    if (!tr.getMeta("fromOutside")) {
      let outerTr = this.outerView.state.tr, offset = this.getPos() + 1
      for (let i = 0; i < transactions.length; i++) {
        let steps = transactions[i].steps
        for (let j = 0; j < steps.length; j++)
          outerTr.step(steps[j].offset(offset))
      }
      if (outerTr.docChanged) this.outerView.dispatch(outerTr)
    }
  }

  update(node) {
    if (!node.sameMarkup(this.node)) return false
    this.node = node
    if (this.innerView) {
      let state = this.innerView.state
      let start = node.content.findDiffStart(state.doc.content)
      if (start != null) {
        let {a: endA, b: endB} = node.content.findDiffEnd(state.doc.content)
        let overlap = start - Math.min(endA, endB)
        if (overlap > 0) { endA += overlap; endB += overlap }
        this.innerView.dispatch(
          state.tr.replace(start, endB, node.slice(start, endA)).setMeta("fromOutside", true))
      }
    }
    return true
  }

  deselectNode() {
    if (this.open) {
      this.open = false
      this.dom.classList.remove("ProseMirror-selectednode")
      //this.innerView.destroy()
      this.dom.removeChild(this.tooltip)
      this.tooltip = this.innerView = null
    }
  }

  destroy() {
    this.deselectNode()
  }

  stopEvent(event) {
    return this.innerView && this.innerView.dom.contains(event.target)
  }

  ignoreMutation() { return true }
}
/*
window.view = new EditorView(document.querySelector("#editor"), {
  state: EditorState.create({
    doc: DOMParser.fromSchema(footnoteSchema).parse(document.querySelector("#content")),
    plugins: exampleSetup({schema: footnoteSchema, menuContent: menu.fullMenu})
  }),
  nodeViews: {
    footnote(node, view, getPos) { return new FootnoteView(node, view, getPos) }
  }
})
*/

exports.initRunLink = initRun;
exports.link = link;
exports.LinkView = LinkView;
