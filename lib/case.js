'use strict';

/**
 * Utilities.
 */
let tools = {

  camelize: (string) => {
    return string.toLowerCase().replace(/-(.)/g, (match, group) => {
      return group.toUpperCase();
    });
  },

  group: (array, fun) => {
    let groups = {};

    array.forEach((o) => {
      let group = JSON.stringify(fun(o));

      groups[group] = groups[group] || [];
      groups[group].push(o);  
    });

    return Object.keys(groups).map((group) => {
      return groups[group];
    });
  }

};

/**
 * A base class providing common methods.
 */
class Base {
  constuctor() {}

  /**
   * Adds listener for multiple event types on HTMLElement.
   * 
   * @param {String}   types    The event types string
   *                            in the form of 'type1 type2'.
   * @param {Function} listener The listener function.
   */
  on(types, listener) {
    let els = this.elements || [this.element] || [];

    types = types.split(' ');

    for (let type of types) {
      for (let el of els) {
        el.addEventListener(type, listener);
      }
    }

    return this;

  }

  /**
   * Fetches a HTML string from server and updates DOM accordingly.
   * 
   * @param {String}   url        The GET url of route that generates
   *                              an HTML string.
   * @param {Object}   [options]  The options object. Options to be dedeloped.
   * @param {Function} [callback] The callback function.
   *                              If provided, the method returns fetched HTML
   *                              as the only parameter.
   * 
   * @todo Rewrite as promise (window.fetch).
   */
  fetch() {
    let xhr = new XMLHttpRequest(),
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
    
    xhr.onload = () => {
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

    xhr.onerror = () => {
      console.log(xhr);
    };

    xhr.open('GET', url);
    xhr.send();

  }

}

/**
 * A case cell constructor function.
 * 
 * @param {HTMLElement} elements The set of HTML elements.
 * @param {Object}      options  The options object.
 */
class Cell extends Base {
  constructor(elements, root) {
    this.root = root || null;

    // this.elements = typeof elements === 'string'
    //   ? Array.from(this.root.querySelectorAll('[data-cell=' + elements + ']'))
    //   : elements;

    this.elements = new Set(Array.from(elements));

    if (!this.elements)
      throw new Error('An HTML elements are not found.');
  }
  
}

class Case extends Base {
  constructor(element, options) {
    // select HTML element in case the name is provided
    this.element = typeof element === 'string'
      ? document.querySelector('[data-case=' + element + ']')
      : element;

    if (!this.element)
      throw new Error('A case element is not found.');

    this.options = options || {};
    this.cells = new Map();

    this.build();
    this.observe();
  }

  /**
   * Builds a map of case cells.
   */
  build() {

    // 1) add cells from dom by defined data attributes
    // group cell elements by data-cell attribute 
    let groups = tools.group(Array.from(this.element.querySelectorAll('[data-cell]')), (el) => { return el.dataset.cell; });

    for (let group of groups) {
      let key = group[0].dataset.cell;
      this.cells.set(key, new Cell(group, this));
    }

    // 2) add cells from case options if provided
    if (this.options.cells) {
      let cells = this.options.cells;
      for (let cell of Object.keys(cells)) {
        this.cells.set(cell, new Cell(cells[cell], this));
      }
    }

  }

  /**
   * Sets case observer to observe adding/removing cells.
   */
  observe() {
    let observer = new MutationObserver((mutations) => {

      for (let mutation of mutations) {
        let added = mutation.addedNodes,
            removed = mutation.removedNodes;

        // add cells to the case on node insert 
        for (let addedElement of added) {
          let addedDataset = addedElement.dataset,
              addedKey;

          if (!addedDataset || !addedDataset.cell)
            continue;

          addedKey = addedDataset.cell;

          this.cells.has(addedKey)
            ? this.cells.get(addedKey).elements.add(addedElement)
            : this.cells.set(addedKey, new Cell(addedElement, this));
        }
        
        // remove cells from the case on node removal 
        for (let removedElement of removed) {
          for (let cell of this.cells.entries()) {
            for (let el of cell[1].elements.values()) {
              if (removedElement === el)
                cell[1].elements.delete(el);
            }

            if (!cell[1].elements.size)
              this.cells.delete(cell[0]);
          }
        }

      }

    });

    observer.observe(this.element, {
      childList: true,
      subtree: true
    });

  }

}


/**
 * A case constructor function.
 * 
 * @param {HTMLElement|String} element The HTML element or [data-case] string.
 * @param {Object}             options The options object.
 */


// Case.prototype = new Base();

export default Case;
