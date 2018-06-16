Autocomplete.static = function staticAC(set, _limit) {
  const limit = typeof _limit !== "number" ? 20 : _limit;

  function weightedFuzzymatch(needle, haystack) {
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

  return function insertSortByWeight(query, cb) {
    let start = set
      .slice(0, limit)
      .map(x => [x, weightedFuzzymatch(query, x)])
      .sort((a, b) => b[1] - a[1]);
    let ret = start.map(x => x[0]);
    let weights = start.map(x => x[1]);
    for (let i = limit; i < set.length; i++) {
      let weight = weightedFuzzymatch(query, set[i]);
      if (weight < weights[weights.length - 1]) {
        continue;
      }
      for (let j = 0; j < set.length; j++) {
        if (weight >= weights[j]) {
          ret.splice(j, 0, set[i]);
          weights.splice(j, 0, weight);
          break;
        }
      }
      ret = ret.slice(0, limit);
      weights = weights.slice(0, limit);
    }
    console.log(ret);
    cb(ret);
  };
};
