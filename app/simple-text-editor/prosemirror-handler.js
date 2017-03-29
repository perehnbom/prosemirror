const {schema, MarkdownParser, defaultMarkdownParser, defaultMarkdownSerializer} = require("prosemirror-markdown")
const {Schema} = require("prosemirror-model")
const {EditorState} = require("prosemirror-state")
const {baseKeymap} = require('prosemirror-commands')
const {history} = require("prosemirror-history")
const {keymap} = require("prosemirror-keymap")

const {linkifyPlugin} = require('./linkify-plugin')
const {buildInputRules} = require('./input-rules')
const buildKeymap = require('./buildkeymap');

const {footnote} = require("./footnote")
const {link} = require("./link")

defaultMarkdownSerializer.nodes.footnote = function(state, node){
  state.write("[" + "footnote" + "](#itemid)");          
}
defaultMarkdownSerializer.nodes.link = function(state, node){
  state.write("[" + "itemlink" + "](#itemid)");          
}

delete defaultMarkdownParser.schema.marks.link

defaultMarkdownParser.tokens.link = {
  node: "link", 
  attrs: tok => ({
    href: tok.attrGet("href"),
    type: 'link',
    title: tok.attrGet("title") || null
  })
}

exports.initSchema = function(){
  
  
  var newSchema = new Schema({
    nodes: schema.spec.nodes.addBefore("image", "footnote", footnote).addBefore("image", "link", link),
    marks: schema.spec.marks.remove('link')
  })
  
  return newSchema;
}

exports.initialState = function(schema, markdown){
  return EditorState.create({
    doc: initDoc(schema, markdown),
    plugins: initPlugins(schema)
  });
}

exports.toMarkdown = function(editor){
  return defaultMarkdownSerializer.serialize(editor.state.doc);
}


function initPlugins(schema){
  var plugins = [
    buildInputRules(schema),
    keymap(buildKeymap(schema)),
    keymap(baseKeymap),
    history(),
    linkifyPlugin()
  ]
  return plugins;
}

function initDoc(schema, markdown){
  markdown = markdown || "";
  
  var parser = new MarkdownParser(schema, defaultMarkdownParser.tokenizer, defaultMarkdownParser.tokens)
  
  
  var doc = parser.parse(markdown);
  
  
  
  return doc;
}
