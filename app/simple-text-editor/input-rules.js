const {blockQuoteRule, orderedListRule, bulletListRule, codeBlockRule, headingRule,
       inputRules, allInputRules, InputRule} = require("prosemirror-inputrules")

exports.buildInputRules = function(schema){

  var result = [], type
  if (type = schema.nodes.blockquote) { result.push(blockQuoteRule(type)) }
  if (type = schema.nodes.ordered_list) { result.push(orderedListRule(type)) }
  if (type = schema.nodes.bullet_list) { result.push(bulletListRule(type)) }
  if (type = schema.nodes.code_block) { result.push(codeBlockRule(type)) }
  if (type = schema.nodes.heading) { result.push(headingRule(type, 6)) }

  result.push(searchReferenceInputRule(schema));
  return inputRules({rules: allInputRules.concat(result)})
}



function searchReferenceInputRule(schema){
  var regexp = /(\s@|^@)$/
  return new InputRule(regexp, (state, match, start, end) => {
    return state.tr
      .delete(start, end)
      .replaceSelectionWith(schema.nodes.referenceSearch.create({}))
  })
}
