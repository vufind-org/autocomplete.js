function Autocomplete(_settings) {
  const _DEFAULTS = {
    delay: 250,
    limit: 20,
    loadingString: "Loading...",
    minInputLength: 3,
    rtl: false
  };

  if (typeof _settings === "undefined") {
    _settings = {};
  }
  const settings = Object.assign(_DEFAULTS, _settings);
  let list;
  let _currentItems;
  let _currentListEls;
  let _currentIndex = -1;

  function _debounce(func, delay, passFirst) {
    let timeout = null;

    if (typeof passFirst === "undefined") {
      passFirst = [];
    }

    return function debounced() {
      const context = this;
      const args = passFirst.concat([].slice.call(arguments));

      clearTimeout(timeout);
      timeout = setTimeout(function() {
        timeout = null;
        func.apply(context, args);
      }, delay);
    };
  }

  function _align(input) {
    list.style.minWidth = input.offsetWidth + "px";
    list.style.top = input.offsetTop + input.offsetHeight + "px";
    const inputLeft = input.offsetLeft;
    const inputRight = input.offsetLeft + input.offsetWidth;
    let anchorRight = settings.rtl;
    if (anchorRight) {
      if (inputRight - list.offsetWidth <= 0) {
        anchorRight = false;
      }
    } else if (
      inputLeft + list.offsetWidth >=
      document.documentElement.offsetWidth
    ) {
      anchorRight = true;
    }
    if (anchorRight) {
      const posFromRight = document.documentElement.offsetWidth - inputRight;
      list.style.left = "auto";
      list.style.right = posFromRight + "px";
    } else {
      list.style.right = "auto";
      list.style.left = input.offsetLeft + "px";
    }
  }

  let lastInput = false;
  function _show(input) {
    lastInput = input;
    list.style.left = "-100%"; // hide offscreen
    list.classList.add("open");
  }

  function _hide(e) {
    if (
      typeof e !== "undefined" &&
      !!e.relatedTarget &&
      e.relatedTarget.hasAttribute("href")
    ) {
      return;
    }
    list.classList.remove("open");
    _currentIndex = -1;
    lastInput = false;
  }

  function _selectItem(item, input) {
    if (typeof item === "string") {
      input.value = item;
    } else if (typeof item.href !== "undefined") {
      window.location.assign(item.href);
    } else {
      input.value = item.text;
    }
    _hide();
  }

  function _renderItem(item, input) {
    let el = document.createElement("div");
    el.classList.add("ac-item");
    if (typeof item === "string") {
      el.innerHTML = item;
    } else if (typeof item.header !== "undefined") {
      el.innerHTML = item.header;
      el.classList.add("ac-header");
      return el;
    } else {
      el.innerHTML = item.text;
      if (typeof item.sub !== "undefined") {
        let sub = document.createElement("small");
        sub.classList.add("ac-sub");
        sub.innerHTML = item.sub;
        el.appendChild(sub);
      }
      if (typeof item.header !== "undefined") {
      }
    }
    el.addEventListener("mousedown", e => _selectItem(item, input), false);
    return el;
  }

  function _searchCallback(items, input) {
    if (items.length === 0) {
      _hide();
      return;
    }
    if (items.length > settings.limit) {
      items = items.slice(0, settings.limit);
    }
    _currentItems = items.slice();
    _currentListEls = items.map(item => _renderItem(item, input));
    list.innerHTML = "";
    _currentListEls.map(el => list.appendChild(el));
    _currentIndex = -1;
  }

  function _search(handler, input) {
    if (input.value.length < settings.minInputLength) {
      _hide();
      return;
    }
    let loadingEl = _renderItem({ header: settings.loadingString });
    list.innerHTML = loadingEl.outerHTML;
    _show(input);
    _align(input);
    handler(input.value, function callback(items) {
      _searchCallback(items, input);
      _align(input);
    });
  }

  function _keyup(handler, input, event) {
    // Ignore navigation keys
    // - Ignore control functions
    if (event.ctrlKey || event.which === 17) {
      return;
    }
    // - Function keys (F1 - F15)
    if (112 <= event.which && event.which <= 126) {
      return;
    }
    switch (event.which) {
      case 9: // tab
      case 13: // enter
      case 16: // shift
      case 20: // caps lock
      case 27: // esc
      case 33: // page up
      case 34: // page down
      case 35: // end
      case 36: // home
      case 37: // arrows
      case 38:
      case 39:
      case 40:
      case 45: // insert
      case 144: // num lock
      case 145: // scroll lock
      case 19: // pause/break
        return;
      default:
        _search(handler, input);
    }
  }

  function _keydown(handler, input, event) {
    // - Ignore control functions
    if (event.ctrlKey || event.which === 17) {
      return;
    }
    switch (event.which) {
      // arrow keys through items
      case 38: // up key
        event.preventDefault();
        if (_currentIndex === -1) {
          return;
        }
        _currentListEls[_currentIndex].classList.remove("selected");
        _currentIndex -= 1;
        if (_currentIndex === -1) {
          return;
        }
        _currentListEls[_currentIndex].classList.add("selected");
        break;
      case 40: // down key
        event.preventDefault();
        if (lastInput === false) {
          _search(handler, input);
          return;
        }
        if (_currentIndex === _currentItems.length - 1) {
          return;
        }
        if (_currentIndex > -1) {
          _currentListEls[_currentIndex].classList.remove("selected");
        }
        _currentIndex += 1;
        _currentListEls[_currentIndex].classList.add("selected");
        break;
      // enter to nav or populate
      case 9:
      case 13:
        if (_currentIndex === -1) {
          return;
        }
        _selectItem(_currentItems[_currentIndex], input);
        break;
      // hide on escape
      case 27:
        _hide();
        break;
    }
  }

  return function Factory(input, handler) {
    if (!input) {
      return false;
    }
    if (typeof handler === "undefined") {
      throw new Error(
        "Autocomplete needs handler to return items based on a query: function(query, callback) {}"
      );
    }

    // Create list element
    if (typeof list === "undefined") {
      list = document.querySelector(".autocomplete-results");
      if (!list) {
        list = document.createElement("div");
        list.classList.add("autocomplete-results");
        document.body.appendChild(list);
        window.addEventListener(
          "resize",
          function acresize() {
            if (lastInput === false) {
              return;
            }
            _align(lastInput);
          },
          false
        );
      }
    }

    // Activation / De-activation
    input.addEventListener("focus", () => _search(handler, input), false);
    input.addEventListener("blur", _hide, false);

    // Input typing
    input.addEventListener(
      "keyup",
      _debounce(_keyup, settings.delay, [handler, input]),
      false
    );

    // Checking control characters
    input.addEventListener(
      "keydown",
      event => _keydown(handler, input, event),
      false
    );

    return input;
  };
}

if (typeof module !== "undefined") {
  module.exports = Autocomplete;
}
