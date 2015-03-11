'use strict';

import tools from './modules/tools';
import Base from './modules/base';
import CaseNode from './modules/node';

/**
 * A case constructor function.
 * 
 * @param {HTMLElement|String} element The HTML element or [data-case] string.
 * @param {Object}             options The options object.
 */
export default class extends Base {
  constructor(element, options) {
    // select HTML element in case the name is provided
    this.element = typeof element === 'string'
      ? document.querySelector('[data-case=' + element + ']')
      : element;

    if (!this.element)
      throw new Error('A case element is not found.');

    this.options = options || {};
    this.nodes = new Map();

    this.build();
    this.observe();
  }

  /**
   * Builds a map of case nodes.
   */
  build() {

    // 1) add nodes from dom by defined data attributes
    // group node elements by data-node attribute 
    let groups = tools.group(Array.from(this.element.querySelectorAll('[data-node]')), (el) => { return el.dataset.node; });

    for (let group of groups) {
      let key = group[0].dataset.node;
      this.nodes.set(key, new CaseNode(group, this));
    }

    // 2) add nodes from case options if provided
    if (this.options.nodes) {
      let nodes = this.options.nodes;
      for (let node of Object.keys(nodes)) {
        this.nodes.set(node, new CaseNode(nodes[node], this));
      }
    }

  }

  /**
   * Sets case observer to observe adding/removing nodes.
   */
  observe() {
    let observer = new MutationObserver((mutations) => {

      for (let mutation of mutations) {
        let added = mutation.addedNodes,
            removed = mutation.removedNodes;

        // add nodes to the case on node insert 
        for (let addedElement of added) {
          let addedDataset = addedElement.dataset,
              addedKey;

          if (!addedDataset || !addedDataset.node)
            continue;

          addedKey = addedDataset.node;

          this.nodes.has(addedKey)
            ? this.nodes.get(addedKey).elements.add(addedElement)
            : this.nodes.set(addedKey, new CaseNode(addedElement, this));
        }
        
        // remove nodes from the case on node removal 
        for (let removedElement of removed) {
          for (let node of this.nodes.entries()) {
            for (let el of node[1].elements.values()) {
              if (removedElement === el)
                node[1].elements.delete(el);
            }

            if (!node[1].elements.size)
              this.nodes.delete(node[0]);
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
