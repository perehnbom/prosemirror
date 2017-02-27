var can = require('can'),
$ = window.$ = require('jquery');

var prosemirrorUtil = require('./prosemirror-util');

can.Component.extend({
  tag: "text-editor",
  template: can.stache(require('raw-loader!./text-editor.html')),
  viewModel: {
    
  },
  events: {
    inserted: function(){
        console.log('inserted')
        prosemirrorUtil.init(this.element[0].querySelector(".body"));
    }
  }
});
