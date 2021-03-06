
const {EditorState} = require("prosemirror-state")
const {insertPoint} = require("prosemirror-transform")
const {MenuItem} = require("prosemirror-menu")
const {Schema, DOMParser, Fragment} = require("prosemirror-model")
const {EditorView} = require("prosemirror-view")
const {schema} = require("prosemirror-schema-basic")
const {exampleSetup, buildMenuItems} = require("prosemirror-example-setup")

class ReferenceSearchView {
  constructor(node, view, getPos){
    this.node = node;
    var dom = this.dom = document.createElement("reference-search");
    var searchBox = document.createElement("search-box");

    dom.appendChild(searchBox)
    document.querySelector('#outer-search').focus();
  }


  stopEvent(event) {
    return this.innerView && this.innerView.dom.contains(event.target)
  }
}

class ReferenceView {
  constructor(node, view, getPos) {
    this.node = node
    this.outerView = view
    this.getPos = getPos

    var dom = this.dom = document.createElement("reference");
    this.dom.setAttribute('ref', node.attrs.ref)
    //setTimeout(function(){

    var title = 'reference ' + node.attrs.ref;
      dom.setAttribute('title', 'reference ' + node.attrs.ref)
    //}, 0)
    this.dom.appendChild(document.createTextNode(title))

  }

  selectNode() {
    console.log(this.dom.offsetTop + ' ' + this.dom.offsetLeft)
    this.outerView.customEventHandler('selectNode', this);
    /*
    if (!this.open) {
      console.log('render selected node')
      this.open = true
      this.dom.classList.add("ProseMirror-selectednode")
      this.tooltip = this.dom.appendChild(document.createElement("div"))
      this.tooltip.className = "footnote-tooltip"

    }
    */
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
    console.log('run update')
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
    this.outerView.customEventHandler('deselectNode', this);
/*
    if (this.open) {
      this.open = false
      this.dom.classList.remove("ProseMirror-selectednode")
      //this.innerView.destroy()
      this.dom.removeChild(this.tooltip)
      this.tooltip = this.innerView = null
    }
    */
  }

  destroy() {
    this.deselectNode()
  }

  stopEvent(event) {
    return this.innerView && this.innerView.dom.contains(event.target)
  }

  ignoreMutation() { return true }
}



exports.ReferenceView = ReferenceView;


exports.ReferenceSearchView = ReferenceSearchView;
