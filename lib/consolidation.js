'use strict'

const isPlainObject = require('is-plain-obj')

function mapValues(obj, iteratee) {
  if (!isPlainObject(obj)) {
    throw new Error('mapValues must be called with an plain object')
  }
  const result = {}
  Object.keys(obj).forEach(key => {
    result[key] = iteratee(obj[key], key, obj)
  })
  return result
}

function isString(candidate) {
  return typeof candidate === 'string'
}

function isArray(candidate) {
  return Array.isArray(candidate)
}

function consolidateProperty(prop) {
  if (prop.accept && !isArray(prop.accept)) {
    prop.accept = [prop.accept]
  }
  if (!prop.from && prop.accept) {
    prop.from = 'children'
  }
  if (!prop.from) {
    prop.from = 'text'
  }

  return prop
}

function extendDefinitionFrom(baseElement, el) {
  if (!('properties' in el)) {
    el.properties = {}
  }
  Object.assign(el.properties, baseElement.properties || {})
  delete el.extends
}

function consolidateElement(el, definition) {
  if (el.extends) {
    if (!(el.extends in definition)) {
      throw new Error('Unable to extend. Type not found: ' + el.extends)
    }
    extendDefinitionFrom(definition[el.extends], el)
  }

  if (!el.type && (el.properties || el.children || el.attributes)) {
    el.type = 'object'
  }
  if (!el.type) {
    throw new Error('Unable to compute type')
  }
  if (isString(el.type) && el.type !== 'object' && !el.from) {
    el.from = 'text'
  }
  if (el.type === 'object' && el.properties) {
    el.properties = mapValues(el.properties, prop => consolidateProperty(prop))
  }

  return el
}

function consolidateDefinition(definition) {
  return mapValues(definition, el => consolidateElement(el, definition))
}

exports.consolidateDefinition = consolidateDefinition
exports.consolidateElement = consolidateElement
exports.consolidateProperty = consolidateProperty
