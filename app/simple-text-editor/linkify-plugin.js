const {Fragment} = require("prosemirror-model");
const {Plugin} = require("prosemirror-state");
const {Slice} = require("prosemirror-model");

const HTTP_LINK_REGEX = /((http|https|ftp):\/\/[\w?=&.\/-;#~%-]+(?![\w\s?&.\/;#~%"=-]*>))/g
var linkify = function(fragment){
  var linkified = []
  fragment.forEach(function(child){
    if (child.isText) {
      var text = child.text
      var pos = 0, match

      while (match = HTTP_LINK_REGEX.exec(text)) {
        var start = match.index
        var end = start + match[0].length
        var link = child.type.schema.marks['link']

        // simply copy across the text from before the match
        if (start > 0) {
          linkified.push(child.cut(pos, start))
        }

        var urlText = text.slice(start, end)
        linkified.push(
          child.cut(start, end).mark(link.create({href: urlText}).addToSet(child.marks))
        )
        pos = end
      }

      // copy over whatever is left
      if (pos < text.length) {
        linkified.push(child.cut(pos))
      }
    } else {
      linkified.push(child.copy(linkify(child.content)))
    }
  })

  return Fragment.fromArray(linkified)
}

exports.linkifyPlugin = function(){
  return new Plugin({
    props: {
      transformPasted: function(slice){
        console.log('transformPasted')

        return new Slice(linkify(slice.content), slice.openLeft, slice.openRight)

        return slice;
      }
    }
  })
}
