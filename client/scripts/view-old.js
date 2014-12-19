'use strict';

/**
 * A view constructor function.
 * @param {HTMLElement|String} root The root element.
 *                                  Got as [data-view] if string.
 * @param {Object} options The options object.
 */
function View(root, options) {
  var parent, elements, len;

  this.root = root;
  this.options = options;

  // get root element in case the name is provided
  if (typeof this.root === 'string')
    this.root = document.querySelector('[data-view=' + root + ']');

  // root element must be defined
  if (!this.root)
    throw new Error('A view root is not found.');

  if (!this.options)
    this.options = {};

  // set parent view if defined
  // or use body otherwise
  parent = this.options.parent;
  this.parent = parent ? parent : document.body;

  // set object of view elements if defined
  // for the purpose of easier selections 
  this.elements = {};
  elements = this.root.querySelectorAll('[data-element]');
  for (var i = elements.length - 1; i >= 0; i--) {
    var el = elements[i];

    this.elements[el.dataset.element] = new ViewElement(el);
  };

}

/**
 * A view element constructor.
 * Defines elements inside a view.
 * @param {HTMLElement|String} root The root element.
 *                                  Got as [data-element] if string.
 */
// function ViewElement(element) {

//   this.element = element;

//   // get root element in case the name is provided
//   if (typeof this.element === 'string')
//     this.element = document.querySelector('[data-element=' + element + ']');

//   // root element must be defined
//   if (!this.element)
//     throw new Error('An element root is not found.');

// }

// ViewElementSet.prototype = new Array();

// function ViewElementSet(elements) {
//   this.elements = elements;
// }

/**
 * Selects a view element(s).
 * @param  {String|Array} elements   The view elements.
 * @return {ViewElement}    The ViewElement (single or elements set).
 */
View.prototype.select = function (elements) {
  // var selection = this.elements[element] || this.root.querySelectorAll(element);
  var selection = query.split()
      selection = this.root.querySelectorAll('[data-element]'),
      len = selection.length,
      set = [];

  if (!len)
    return null;

  for (var i = 0; i < len; i++) {
    var el = selection[i];

    set.push(new ViewElement(el));
  };

  return set.length === 1 ? set[0] : set;
};

/**
 * Binds listeners to particular events.
 * @param {String}   types    The space-separated string of event types to listen to.
 * @param {Function} listener The listener function.
 * 
 * @todo Make possible to attach multiple listeners.
 */
View.prototype.on = function (types, listener) {
  types = types.split(' ');

  var set = this.elements || this.element || this.root;

  for (var i = 0; i < types.length; i++) {
    var type = types[i];
    this.root.addEventListener(type, listener);
  };

};
