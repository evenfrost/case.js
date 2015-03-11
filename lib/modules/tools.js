'use strict';

/**
 * Utilities.
 */
export default {

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
