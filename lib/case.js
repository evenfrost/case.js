(function (root, factory) {
  
  typeof define === 'function' && define.amd
    ? define(['Case', factory])
    : root.Case = factory();

})(window, function () {
  
  /**
   * Util functions.
   */
  function _toCamelCase(string) { 
    return string.toLowerCase().replace(/-(.)/g, function (match, group) {
        return group.toUpperCase();
    });
  }



  /**
   * A view node constructor function.
   * @param {HTMLElement|String} element The HTML element or [data-node] string.
   * @param {Object}             options The options object.
   */
  function CaseNode(element, root) {
    'use strict';

    this.element = element;
    this.root = root || null;

    if (typeof this.element === 'string')
      this.element = document.querySelector('[data-case-node=' + element + ']');

    if (!this.element)
      throw new Error('An HTMLElement is not found.');

  }

  /**
   * Adds listener for multiple event types on HTMLElement.
   * @param {String}   types    The event types string
   *                            in the form of 'type1 type1'.
   * @param {Function} listener The listener function.
   */
  CaseNode.prototype.on = function (types, listener) {
    types = types.split(' ');

    for (var i = 0, len = types.length; i < len; i++) {
      this.element.addEventListener(types[i], listener);
    }

  };

  /**
   * Fetches a HTML string from server
   * and updates DOM accordingly. 
   * @param  {String}   url      [description]
   * @param  {[type]}   options  [description]
   * @param  {Function} callback [description]
   * @return {[type]}            [description]
   */
  CaseNode.prototype.fetch = function (url) {
    var xhr = new XMLHttpRequest(),
        el = this.element,
        secondArgument = arguments[1],
        thirdArgument = arguments[2],
        options, callback, partial;

    url = url || location.href;

    // dynamic function param
    if (typeof secondArgument === 'function') {
      callback = secondArgument;
    } else {
      options = secondArgument;
      callback = thirdArgument;
    }

    options = options || {};
    callback = callback || null;

    xhr.onload = function () {
      if (xhr.status < 400) {
        partial = xhr.responseText;

        if (!partial)
          return;

        // if callback is provided, return content instead of direct DOM update
        if (typeof callback === 'function') {
          return callback(partial);
        } else {
          // if append or prepend options are specified,
          // add parital content to the node
          options.append || options.prepend
            ? el.insertAdjacentHTML(options.append ? 'beforeend' : 'afterbegin', partial)
            // otherwise rewrite node inner HTML with the partial
            : el.innerHTML = partial;
        }

      }
    };

    xhr.onerror = function () {
      console.log(xhr);
    };

    xhr.open('GET', url);
    xhr.send();


  };



  /**
   * A view constructor function.
   * @param {HTMLElement|String} element The HTML element or [data-case] string.
   * @param {Object}             options The options object.
   */
  function Case(element, options) {
    'use strict';
    
    var that = this,
        nodes, observer;

    that.element = element;
    that.options = options;

    // get root element in case the name is provided
    if (typeof that.element === 'string')
      that.element = document.querySelector('[data-case=' + element + ']');

    // root element must be defined
    if (!that.element)
      throw new Error('A view HTMLElement is not found.');

    if (!that.options)
      that.options = {};

    // set view nodes
    that.nodes = {};

    // 1) add dom nodes to view nodes property
    nodes = Array.prototype.slice.call(that.element.querySelectorAll('[data-case-node]'));
    for (var i = 0, len = nodes.length; i < len; i++) {
      var el = nodes[i];
      that.nodes[_toCamelCase(el.dataset.caseNode)] = new CaseNode(el, this);
    }

    // 2) add nodes from options to view nodes property
    nodes = that.options.nodes || {};
    for (var key in nodes) {
      if (nodes.hasOwnProperty(key))
        that.nodes[key] = new CaseNode(nodes[key], this);
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

          that.nodes[addedDataset.element] = new CaseNode(addedElement);
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

  Case.prototype.on = CaseNode.prototype.on;
  Case.prototype.fetch = CaseNode.prototype.fetch;

  return Case;

});
