const {blockQuoteRule, orderedListRule, bulletListRule, codeBlockRule, headingRule,
       inputRules, allInputRules, InputRule} = require("prosemirror-inputrules")

exports.buildInputRules = function(schema){

  var result = [], type
  if (type = schema.nodes.blockquote) { result.push(blockQuoteRule(type)) }
  if (type = schema.nodes.ordered_list) { result.push(orderedListRule(type)) }
  if (type = schema.nodes.bullet_list) { result.push(bulletListRule(type)) }
  if (type = schema.nodes.code_block) { result.push(codeBlockRule(type)) }
  if (type = schema.nodes.heading) { result.push(headingRule(type, 6)) }

  //result.push(linkInputRule(schema));
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

function linkInputRule(schema){
  var regexp = /((http|https|ftp):\/\/[\w?=&.\/-;#~%-]+(?![\w\s?&.\/;#~%"=-]*>))/
  return new InputRule(regexp, (state, match, start, end) => {
    console.log('use linkInputRule')
    return state.tr
      addMark(start, end, schema.marks.link.create({
        href : match
      }))
  })
}
/*
function linkInputRule(schema){
  var regexp = /((http|https|ftp):\/\/[\w?=&.\/-;#~%-]+(?![\w\s?&.\/;#~%"=-]*>))/
  return new InputRule(regexp, (state, match, start, end) => {
    console.log('found link')
    return state.tr.addMark(start, end, schema.marks.link.create({
      href : match
    }))

  }
}
*/
/*

function toggleMark(markType, attrs) {
  return function(state, dispatch) {
    let {empty, from, to, $from} = state.selection
    if (!markApplies(state.doc, from, to, markType)) return false
    if (dispatch) {
      if (empty) {
        if (markType.isInSet(state.storedMarks || $from.marks()))
          dispatch(state.tr.removeStoredMark(markType))
        else
          dispatch(state.tr.addStoredMark(markType.create(attrs)))
      } else {
        if (state.doc.rangeHasMark(from, to, markType))
          dispatch(state.tr.removeMark(from, to, markType).scrollIntoView())
        else
          dispatch(state.tr.addMark(from, to, markType.create(attrs)).scrollIntoView())
      }
    }
    return true
  }
}



*/
