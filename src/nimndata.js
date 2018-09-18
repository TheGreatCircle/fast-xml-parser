"use strict"

var char = function char(a) {
  return String.fromCharCode(a)
}

var chars = {
  nilChar: char(176),
  missingChar: char(201),
  nilPremitive: char(175),
  missingPremitive: char(200),

  emptyChar: char(178),
  emptyValue: char(177), //empty Premitive

  boundryChar: char(179),

  objStart: char(198),
  arrStart: char(204),
  arrayEnd: char(185)
}

var charsArr = [
  chars.nilChar,
  chars.nilPremitive,
  chars.missingChar,
  chars.missingPremitive,
  chars.boundryChar,
  chars.emptyChar,
  chars.emptyValue,
  chars.arrayEnd,
  chars.objStart,
  chars.arrStart
]

var _e = function _e(node, e_schema, options) {
  if (typeof e_schema === "string") {
    //premitive
    if (node && node[0] && node[0].val !== undefined) {
      return getValue(node[0].val, e_schema)
    } else {
      return getValue(node, e_schema)
    }
  } else {
    var hasValidData = hasData(node)
    if (hasValidData === true) {
      var str = ""
      if (Array.isArray(e_schema)) {
        //attributes can't be repeated. hence check in children tags only
        str += chars.arrStart
        var itemSchema = e_schema[0]
        //var itemSchemaType = itemSchema;
        var arr_len = node.length

        if (typeof itemSchema === "string") {
          for (var arr_i = 0; arr_i < arr_len; arr_i++) {
            var r = getValue(node[arr_i].val, itemSchema)
            str = processValue(str, r)
          }
        } else {
          for (var _arr_i = 0; _arr_i < arr_len; _arr_i++) {
            var _r = _e(node[_arr_i], itemSchema, options)
            str = processValue(str, _r)
          }
        }
        str += chars.arrayEnd //indicates that next item is not array item
      } else {
        //object
        str += chars.objStart
        var keys = Object.keys(e_schema)
        if (Array.isArray(node)) {
          node = node[0]
        }
        for (var i in keys) {
          var key = keys[i]
          //a property defined in schema can be present either in attrsMap or children tags
          //options.textNodeName will not present in both maps, take it's value from val
          //options.attrNodeName will be present in attrsMap
          var _r2 = void 0
          if (
            !options.ignoreAttributes &&
            node.attrsMap &&
            node.attrsMap[key]
          ) {
            _r2 = _e(node.attrsMap[key], e_schema[key], options)
          } else if (key === options.textNodeName) {
            _r2 = _e(node.val, e_schema[key], options)
          } else {
            _r2 = _e(node.child[key], e_schema[key], options)
          }
          str = processValue(str, _r2)
        }
      }
      return str
    } else {
      return hasValidData
    }
  }
}

var getValue = function getValue(a /*, type*/) {
  switch (a) {
    case undefined:
      return chars.missingPremitive
    case null:
      return chars.nilPremitive
    case "":
      return chars.emptyValue
    default:
      return a
  }
}

var processValue = function processValue(str, r) {
  if (!isAppChar(r[0]) && !isAppChar(str[str.length - 1])) {
    str += chars.boundryChar
  }
  return str + r
}

var isAppChar = function isAppChar(ch) {
  return charsArr.indexOf(ch) !== -1
}

function hasData(jObj) {
  if (jObj === undefined) {
    return chars.missingChar
  } else if (jObj === null) {
    return chars.nilChar
  } else if (
    jObj.child &&
    Object.keys(jObj.child).length === 0 &&
    (!jObj.attrsMap || Object.keys(jObj.attrsMap).length === 0)
  ) {
    return chars.emptyChar
  } else {
    return true
  }
}

var x2j = require("./xmlstr2xmlnode")
var buildOptions = require("./util").buildOptions

var convert2nimn = function convert2nimn(node, e_schema, options) {
  options = buildOptions(options, x2j.defaultOptions, x2j.props)
  return _e(node, e_schema, options)
}

exports.convert2nimn = convert2nimn
