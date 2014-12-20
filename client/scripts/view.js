'use strict';


/**
 * A view element constructor function.
 * @param {HTMLElement|String} element The HTML element or [data-element] string.
 * @param {Object}             options The options object.
 */
function ViewElement(element, root) {
  this.element = element;
  this.root = root || null;

  if (typeof this.element === 'string')
    this.element = document.querySelector('[data-element=' + element + ']');

  if (!this.element)
    throw new Error('An HTMLElement is not found.');

}

ViewElement.prototype.on = function (types, listener) {
  types = types.split(' ');

  for (var n = types.length - 1; n >= 0; n--) {
    this.element.addEventListener(types[n], listener);
  }

};

/**
 * A view constructor function.
 * @param {HTMLElement|String} element The View HTML element or [data-view] string.
 * @param {Object}             options The options object.
 */
function View(element, options) {
  var that = this,
      elements, observer,
      _len;

  that.element = element;
  that.options = options;

  // get root element in case the name is provided
  if (typeof that.element === 'string')
    that.element = document.querySelector('[data-view=' + element + ']');

  // root element must be defined
  if (!that.element)
    throw new Error('A view HTMLElement is not found.');

  if (!that.options)
    that.options = {};

  // set view elements
  that.elements = {};

  // 1) add dom elements to view elements property 
  elements = Array.prototype.slice.call(that.element.querySelectorAll('[data-element]'));
  _len = elements.length;
  for (var i = 0; i < _len; i++) {
    var el = elements[i];
    that.elements[el.dataset.element] = new ViewElement(el, this);
  }

  // 2) add elements from options to view elements property 
  elements = that.options.elements || {};
  for (var key in elements) {
    if (elements.hasOwnProperty(key))
      that.elements[key] = new ViewElement(elements[key], this);
  }

  // set nodes observer
  observer = new MutationObserver(function (mutations) {

    for (var i = 0; i < mutations.length; i++) {

      var mutation = mutations[i],
          added = mutation.addedNodes,
          removed = mutation.removedNodes;

      // add elements to the view on node insert 
      for (var n = added.length - 1; n >= 0; n--) {

        var addedElement = added[n],
            addedDataset = addedElement.dataset;

        if (!addedDataset || !addedDataset.element)
          continue;

        that.elements[addedDataset.element] = new ViewElement(addedElement);

      }

      // remove elements from the view on node removal 
      for (var n = removed.length - 1; n >= 0; n--) {
        for (var key in that.elements) {

          if (that.elements.hasOwnProperty(key)
           && that.elements[key].element === removed[n]) {

            delete that.elements[key];

          }

        }
      }

    }

  });

  observer.observe(that.element, {
    childList: true,
    subtree: true
  });
  
}

View.prototype.on = ViewElement.prototype.on;