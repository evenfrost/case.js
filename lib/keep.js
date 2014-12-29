/**
 * A view node constructor function.
 * @param {HTMLElement|String} element The HTML element or [data-node] string.
 * @param {Object}             options The options object.
 */
function ViewNode(element, root) {
  'use strict';

  this.element = element;
  this.root = root || null;

  if (typeof this.element === 'string')
    this.element = document.querySelector('[data-view-node=' + element + ']');

  if (!this.element)
    throw new Error('An HTMLElement is not found.');

}

ViewNode.prototype.on = function (types, listener) {
  types = types.split(' ');

  for (var n = types.length, len = types.length; n < len; n++) {
    this.element.addEventListener(types[n], listener);
  }

};

/**
 * A view constructor function.
 * @param {HTMLElement|String} element The View HTML element or [data-view] string.
 * @param {Object}             options The options object.
 */
function View(element, options) {
  'use strict';
  
  var that = this,
      nodes, observer;

  function _toCamelCase(string) { 
    return string.toLowerCase().replace(/-(.)/g, function (match, group) {
        return group.toUpperCase();
    });
  }

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

  // set view nodes
  that.nodes = {};

  // 1) add dom nodes to view nodes property
  nodes = Array.prototype.slice.call(that.element.querySelectorAll('[data-view-node]'));
  for (var i = 0, len = nodes.length; i < len; i++) {
    var el = nodes[i];
    console.log(_toCamelCase(el.dataset.viewNode));
    that.nodes[_toCamelCase(el.dataset.viewNode)] = new ViewNode(el, this);
  }

  // 2) add nodes from options to view nodes property
  nodes = that.options.nodes || {};
  for (var key in nodes) {
    if (nodes.hasOwnProperty(key))
      that.nodes[key] = new ViewNode(nodes[key], this);
  }

  // set nodes observer
  observer = new MutationObserver(function (mutations) {

    for (var i = 0; i < mutations.length; i++) {

      var mutation = mutations[i],
          added = mutation.addedNodes,
          removed = mutation.removedNodes;

      // add nodes to the view on node insert 
      for (var n = 0, len = added.length; n < len; n++) {
        var addedElement = added[n],
            addedDataset = addedElement.dataset;

        if (!addedDataset || !addedDataset.element)
          continue;

        that.nodes[addedDataset.element] = new ViewNode(addedElement);
      }

      // remove nodes from the view on node removal 
      for (var n = 0, len = removed.length; n < len; n++) {
        for (var key in that.nodes) {

          if (that.nodes.hasOwnProperty(key)
           && that.nodes[key].element === removed[n]) {

            delete that.nodes[key];

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

View.prototype.on = ViewNode.prototype.on;
