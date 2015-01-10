(function (root, factory) {
  
  typeof define === 'function' && define.amd
    ? define(['Case', factory])
    : root.Case = factory();

})(window, function () {
  'use strict';
  
  /**
   * Utilities functions.
   */
  function _toCamelCase(string) { 
    return string.toLowerCase().replace(/-(.)/g, function (match, group) {
      return group.toUpperCase();
    });
  }



  /**
   * A base constuctor that provides common methods.
   */
  function CaseBase() {}

  /**
   * Adds listener for multiple event types on HTMLElement.
   * 
   * @param {String}   types    The event types string
   *                            in the form of 'type1 type1'.
   * @param {Function} listener The listener function.
   */
  CaseBase.prototype.on = function (types, listener) {
    // attach listeners to multiple nodes at once in case of NodeList
    var nodes = this.length ? this : [this];

    types = types.split(' ');

    for (var i = 0, len = types.length; i < len; i++) {
      for (var n = 0, nodelen = nodes.length; n < nodelen; n++) {
        nodes[n].element.addEventListener(types[i], listener);
      }
    }

  };

  /**
   * Fetches a HTML string from server and updates DOM accordingly.
   * 
   * @param {String}   url        The GET url of route that generates
   *                              an HTML string.
   * @param {Object}   [options]  The options object. Options to be dedeloped.
   * @param {Function} [callback] The callback function.
   *                              If provided, the method returns fetched HTML
   *                              as the only parameter.
   */
  CaseBase.prototype.fetch = function () {
    var xhr = new XMLHttpRequest(),
        el = this.element,
        url = arguments[0],
        options = arguments[1] || {},
        callback = arguments[2] || null,
        len = arguments.length,
        partial;

    if (!len)
      throw new Error('You must provide a url parameter.');

    // dynamic arguments
    if (len === 2 && typeof options === 'function')
      callback = options;  
    
    xhr.onload = function () {
      if (xhr.status < 400) {
        partial = xhr.responseText;

        if (!partial)
          return;

        // if callback is provided, return content instead of direct DOM update
        if (callback) {
          return callback(partial);
        } else {
          // if append or prepend param is specified,
          // add parital content to the node
          options.append
            ? el.insertAdjacentHTML(options.append, partial)
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
   * A case node constructor function.
   * 
   * @param {HTMLElement|String} element The HTML element or [data-node] string.
   * @param {Object}             options The options object.
   */
  function CaseNode(element, root) {
    this.element = element;
    this.root = root || null;

    if (typeof this.element === 'string')
      this.element = document.querySelector('[data-case-node=' + element + ']');

    if (!this.element)
      throw new Error('An HTMLElement is not found.');

  }

  CaseNode.prototype = new CaseBase();



  /**
   * A case list constructor.
   * Case list is an array-like object that consists of multiple case nodes.
   */
  function CaseList() {}

  // rough multiple inheritance
  CaseList.prototype = [];
  for (var prop in CaseBase.prototype) {
    if (CaseBase.prototype.hasOwnProperty(prop))
      CaseList.prototype[prop] = CaseBase.prototype[prop];
  }



  /**
   * A case constructor function.
   * 
   * @param {HTMLElement|String} element The HTML element or [data-case] string.
   * @param {Object}             options The options object.
   */
  function Case(element, options) {
    var that = this,
        nodes, observer;

    that.element = element;
    that.options = options;

    // get root element in case the name is provided
    if (typeof that.element === 'string')
      that.element = document.querySelector('[data-case=' + element + ']');

    // root element must be defined
    if (!that.element)
      throw new Error('A Case HTMLElement is not found.');

    if (!that.options)
      that.options = {};

    // set case nodes
    that.nodes = {};

    // 1) add dom nodes to case nodes property
    nodes = Array.prototype.slice.call(that.element.querySelectorAll('[data-case-node]'));
    for (var i = 0, len = nodes.length; i < len; i++) {
      var el = nodes[i];
      that.nodes[_toCamelCase(el.dataset.caseNode)] = new CaseNode(el, this);
    }

    // 2) add nodes from options to case nodes property
    nodes = that.options.nodes || {};
    for (var key in nodes) {
      if (!nodes.hasOwnProperty(key))
        continue;

      // may be NodeList or HTMLElement
      var node = nodes[key],
          len = node.length;

      if (len > 1) {
        that.nodes[key] = new CaseList();
        for (var i = 0; i < len; i++) {
          that.nodes[key].push(new CaseNode(node[i], this));
        }
      } else {
        that.nodes[key] = new CaseNode(node, this);
      }

    }

    // set nodes observer
    observer = new MutationObserver(function (mutations) {

      for (var i = 0; i < mutations.length; i++) {

        var mutation = mutations[i],
            added = mutation.addedNodes,
            removed = mutation.removedNodes;

        // add nodes to the case on node insert 
        for (var n = 0, len = added.length; n < len; n++) {
          var addedElement = added[n],
              addedDataset = addedElement.dataset;

          if (!addedDataset || !addedDataset.element)
            continue;

          that.nodes[addedDataset.element] = new CaseNode(addedElement);
        }

        // remove nodes from the case on node removal 
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

  Case.prototype = new CaseBase();

  return Case;

});
