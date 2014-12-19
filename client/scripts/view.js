'use strict';

/**
 * A view constructor function.
 * @param {HTMLElement|String} root The root element.
 *                                  Got as [data-view] if string.
 * @param {Object} options The options object.
 */
function View(root, options) {
  var elements,
      len, parent;

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

  // set view elements
  this.elements = {};
  elements = this.root.querySelectorAll('[data-element]');
  len = elements.length;
  for (var i = 0; i < len; i++) {
    var el = elements[i];
    this.elements[el.dataset.element] = el;
  }
  
}

/**
 * Selects view elements.
 * @param  {String|Array}  selection The view elements to be selected.
 * @return {ViewSelection}           New view selection.
 */
View.prototype.select = function (selection) {
  var set = new ViewSelection,
      len;

  if (typeof selection === 'string')
    selection = [selection];

  len = selection.length;

  for (var i = 0; i < len; i++) {
    set.push(this.root.querySelector('[data-element="' + selection[i] + '"]'));
  }

  return set;
};

/**
 * A view selection constructor.
 * @extends {Array}
 */
function ViewSelection() {}

ViewSelection.prototype = new Array();

ViewSelection.prototype.on = function (types, listener) {
  types = types.split(' ');

  for (var i = this.length - 1; i >= 0; i--) {
    for (var n = types.length - 1; n >= 0; n--) {
      this[i].addEventListener(types[n], listener);
    }
  }

};
