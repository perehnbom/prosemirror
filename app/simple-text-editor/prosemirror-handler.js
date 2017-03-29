const {schema} = require("prosemirror-markdown")
const {Schema} = require("prosemirror-model")
exports.initSchema = function(){
  
  var newSchema = new Schema({
    nodes: schema.spec.nodes,
    marks: schema.spec.marks
  })
  
  return newSchema;
}
