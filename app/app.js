var can = require('can'),
$ = window.$ = require('jquery'),
_ = window._ = require('lodash');
require('./can-import');

require('./simple-text-editor/simple-text-editor');
//require('./editor/editor');
var appTemplate = can.stache(require('raw-loader!./app.html'))


can.Control.extend('AppControl', {
  init : function(){
    console.log('init');
    var t = appTemplate({});
    $('body').append(t);
  }
})



new AppControl(document, {});
