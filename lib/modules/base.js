'use strict';

/**
 * A base class providing common methods.
 */
export default class {
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
