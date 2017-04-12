var can = require('can'),
$ = window.$ = require('jquery');

var prosemirror = {
  model : require("prosemirror-model"),
  state : require("prosemirror-state"),
  view : require("prosemirror-view"),
}

const {ReferenceView, ReferenceSearchView, runReference} = require("./reference")
const {EditorView} = require("prosemirror-view")
const {editorHandler} = require('./prosemirror-handler');





can.Component.extend({
  tag: "simple-text-editor",
  template: can.stache(require('raw-loader!./simple-text-editor.html')),
  viewModel: {
    markdownMode : false,
    haltClose : false,
    setHaltClose : function(){
      console.log('setHaltClose')
      this.haltClose = true;
    },
    resetHaltClose : function(){
      console.log('resetHaltClose')
      this.haltClose = false;
    },
    commands : {

    }
  },

  events: {
    inserted: function(){
        console.log('inserted')

      this.editorHandler = editorHandler(this);
    },
    '.simple-text-editor-menu blur' : function(){
      console.log('simple-text-editor-menu blur')
    },
    'removed' : function(){
      this.editorHandler.destroy();
    },

    '.run-command mousedown' : function(el,ev){
      var vm = this.viewModel;
      this.editorHandler.handleMenuClick();
      this.editorHandler.runCommand(el.attr('command'), el.attr('option'));
    },
    '.simple-text-editor-menu a click' : function(el,ev){

      ev.preventDefault();
    },
    '#save click' : function(el,ev){
      ev.preventDefault();

      console.log(this.editorHandler.toMarkdown());
    },
    '.insert-reference mousedown' : function(el,ev){
      ev.preventDefault();
      this.editorHandler.runCommand('referenceSearch');

    },
    'textarea focus' : function(){
      this.editorHandler.handleOnFocus()
    },
    'textarea blur' : function(){
      this.editorHandler.handleOnBlur()
    },
    '.insert-reference click' : function(el,ev){
      ev.preventDefault();
      console.log('insert-reference click')
    },
    'search-box click' : function(el,ev){
      ev.stopPropagation();
      ev.preventDefault();

      this.editorHandler.runCommand('reference', '2334');
    },

    '#toggle-view click' : function(el,ev){
      ev.preventDefault();

      this.editorHandler.toggleView();

    }
  }
});
