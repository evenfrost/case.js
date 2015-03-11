'use strict';

import Base from './base';

/**
 * A case node constructor function.
 * 
 * @param {HTMLElement} elements The set of HTML elements.
 * @param {Object}      options  The options object.
 */

export default class extends Base {
  constructor(elements, root) {
    this.root = root || null;

    // this.elements = typeof elements === 'string'
    //   ? Array.from(this.root.querySelectorAll('[data-node=' + elements + ']'))
    //   : elements;

    this.elements = new Set(Array.from(elements));

    if (!this.elements)
      throw new Error('An HTML elements are not found.');
  }
  
}
