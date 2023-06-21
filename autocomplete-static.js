/* https://github.com/vufind-org/autocomplete.js (v2.1.7) (2023-06-21) */
Autocomplete.static = function staticAC(set, _limit, key) {
  const limit = typeof _limit !== "number" ? 20 : _limit;

  function _weightedFuzzymatch(needle, _haystack) {
    const haystack = typeof key !== "undefined" ? _haystack[key] : _haystack;
    // terms may be switched
    if (needle.length > haystack.length) {
      // return weightedFuzzymatch(haystack, needle);
      return 0;
    }
    const needle_l = needle.toLowerCase();
    const haystack_l = haystack.toLowerCase();
    if (needle_l === haystack_l) {
      return 1 * needle_l.length;
    }
    let weight = 0;
    let straw = 0;
    let len = needle.length;
    for (let i = 0; i < len; i++) {
      while (true) {
        if (needle_l[i] === haystack_l[straw]) {
          weight += 1 - (straw - i) * 0.1;
          break;
        }
        straw += 1;
        if (straw === haystack.length) {
          return weight;
        }
      }
    }
    return weight;
  }

  // For a reverse sorted array
  function _binaryInsertIndex(arr, op) {
    // Edge cases
    if (op > arr[0]) {
      return 0;
    }
    // Binary search
    let low = 0;
    let high = arr.length;
    while (low < high) {
      let mid = (low + high) >>> 1;
      if (op === arr[mid]) {
        return mid;
      }
      if (op > arr[mid]) {
        high = mid;
      } else {
        low = mid + 1;
      }
    }
    return Math.min(high, arr.length - 1);
  }

  return function insertSortByWeight(query, cb) {
    let start = set
      .slice(0, limit)
      .map((x) => [x, _weightedFuzzymatch(query, x)])
      .sort((a, b) => b[1] - a[1]);
    let ret = start.map((x) => x[0]);
    let weights = start.map((x) => x[1]);
    for (let i = limit; i < set.length; i++) {
      let weight = _weightedFuzzymatch(query, set[i]);
      if (weight < weights[weights.length - 1]) {
        continue;
      }
      const index = _binaryInsertIndex(weights, weight);
      ret.splice(index, 0, set[i]);
      weights.splice(index, 0, weight);
    }
    ret = ret.slice(0, limit);
    cb(ret);
  };
};
