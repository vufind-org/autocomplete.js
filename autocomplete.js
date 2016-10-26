/* https://github.com/crhallberg/autocomplete.js 1.0b */
(function autocomplete( $ ) {
  var element = false,
      xhr = false;

  function Factory(input, settings) {
    return (function acClosure() {
      var cache = {},
          options;

      var _align = function(input) {
        var position = input.offset();
        element.css({
          top: position.top + input.outerHeight(),
          left: position.left,
          minWidth: input.width()
        });
      }

      var show = function() {
        element.removeClass(options.hidingClass);
      }
      var hide = function() {
        element.addClass(options.hidingClass);
      }

      var _populate = function(item, input, eventType) {
        if (options.callback) {
          if (options.callback(item, input, eventType) === true && typeof item.href !== 'undefined') {
            return window.location.assign(item.href);
          }
        } else if (typeof item.href !== 'undefined') {
          return window.location.assign(item.href);
        }
        input.val(item.value);
        hide();
      }

      var _listToHTML = function(list, regex) {
        var shell = $('<div/>');
        for (var i = 0; i < list.length; i++) {
          if (typeof list[i] === 'string') {
            list[i] = {value: list[i]};
          }
          var content = list[i].label || list[i].value;
          if (options.highlight) {
            content = content.replace(regex, '<b>$1</b>');
          }
          var item = typeof list[i].href === 'undefined'
            ? $('<div/>')
            : $('<a/>').attr('href', list[i].href);
          // list
          item.data(list[i])
              .addClass('ac-item')
              .html(content);
          if (typeof list[i].description !== 'undefined') {
            item.append($('<small/>').html(
              options.highlight
                ? list[i].description.replace(regex, '<b>$1</b>')
                : list[i].description
            ));
          }
          shell.append(item);
        }
        return shell;
      }
      var _createList = function(data, input) {
        // highlighting setup
        // escape term for regex - https://github.com/sindresorhus/escape-string-regexp/blob/master/index.js
        var escapedTerm = input.val().replace(/[|\\{}()\[\]\^$+*?.]/g, '\\$&');
        var regex = new RegExp('(' + escapedTerm + ')', 'ig');
        var shell;
        if (typeof data.sections === 'undefined') {
          shell = _listToHTML(data, regex);
        } else {
          shell = $('<div/>');
          for (var i = 0; i < data.sections.length; i++) {
            if (typeof data.sections[i].label !== 'undefined' && data.sections[i].items.length > 0) {
              if (i > 0) {
                shell.append($('<hr/>', { class: 'ac-section-divider' }));
              }
              shell.append($('<header>', {
                class: 'ac-section-header',
                html: data.sections[i].label
              }));
              shell.append(_listToHTML(data.sections[i].items, regex));
            } else if (data.sections[i].length > 0) {
              if (i > 0) {
                shell.append($('<hr/>', { class: 'ac-section-divider' }));
              }
              shell.append(_listToHTML(data.sections[i], regex));
            }
          }
        }
        element.html(shell);
        input.data('length', shell.find('.ac-item').length);
        element.find('.ac-item').mousedown(function acItemClick() {
          _populate($(this).data(), input, {mouse: true});
          setTimeout(function acClickDelay() {
            input.focus();
            hide();
          }, 10);
        });
        _align(input);
      }

      var _handleResults = function(input, term, _data) {
        // Limit results
        var data = typeof _data.sections === 'undefined'
          ? _data.slice(0, Math.min(options.maxResults, _data.length))
          : _data;
        var cid = input.data('cacheId');
        cache[cid][term] = data;
        if (data.length === 0) {
          hide();
        } else {
          _createList(data, input);
        }
      }
      var search = function(input) {
        if (xhr) { xhr.abort(); }
        if (input.val().length >= options.minLength) {
          element.html('<i class="item loading">' + options.loadingString + '</i>');
          show();
          _align(input);
          input.data('selected', -1);
          var term = input.val();
          // Check cache (only for handler-based setups)
          var cid = input.data('cacheId');
          if (options.cache && typeof cache[cid][term] !== "undefined") {
            if (cache[cid][term].length === 0) {
              hide();
            } else {
              _createList(cache[cid][term], input);
            }
          // Check for static list
          } else if (typeof options.static !== 'undefined') {
            var lcterm = term.toLowerCase();
            var matches = options.static.filter(function staticFilter(_item) {
              return _item.match.match(lcterm);
            });
            if (typeof options.staticSort === 'function') {
              matches.sort(options.staticSort);
            } else {
              matches.sort(function defaultStaticSort(a, b) {
                return a.match.indexOf(lcterm) - b.match.indexOf(lcterm);
              });
            }
            _handleResults(input, term, matches);
          // Call handler
          } else {
            options.handler(input, function achandlerCallback(data) {
        console.log(input, term, data);
              _handleResults(input, term, data);
            });
          }
        } else {
          hide();
        }
      }

      var _setup = function(input) {
        if ($('.autocomplete-results').length === 0) {
          element = $('<div/>')
            .addClass('autocomplete-results ' + options.hidingClass)
            .html('<i class="item loading">' + options.loadingString + '</i>');
          _align(input);
          $(document.body).append(element);
        }

        input.data('selected', -1);
        input.data('length', 0);

        if (options.cache) {
          var cid = Math.floor(Math.random() * 1000);
          input.data('cacheId', cid);
          cache[cid] = {};
        }

        input.blur(function acinputBlur(e) {
          if (e.target.acitem) {
            setTimeout(hide, 10);
          } else {
            hide();
          }
        });
        input.click(function acinputClick() {
          search(input, element);
        });
        input.focus(function acinputFocus() {
          search(input, element);
        });
        input.keyup(function acinputKeyup(event) {
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
          case 9:    // tab
          case 13:   // enter
          case 16:   // shift
          case 20:   // caps lock
          case 27:   // esc
          case 33:   // page up
          case 34:   // page down
          case 35:   // end
          case 36:   // home
          case 37:   // arrows
          case 38:
          case 39:
          case 40:
          case 45:   // insert
          case 144:  // num lock
          case 145:  // scroll lock
          case 19:   // pause/break
            return;
          default:
            search(input, element);
          }
        });
        input.keydown(function acinputKeydown(event) {
          // - Ignore control functions
          if (event.ctrlKey || event.which === 17) {
            return;
          }
          var position = $(this).data('selected');
          switch (event.which) {
            // arrow keys through items
          case 38: // up key
            event.preventDefault();
            element.find('.ac-item.selected').removeClass('selected');
            if (position > -1) {
              if (position-- > 0) {
                element.find('.ac-item:eq(' + position + ')').addClass('selected');
              }
              $(this).data('selected', position);
            }
            break;
          case 40: // down key
            event.preventDefault();
            if (element.hasClass(options.hidingClass)) {
              search(input, element);
            } else if (position < input.data('length') - 1) {
              position++;
              element.find('.ac-item.selected').removeClass('selected');
              element.find('.ac-item:eq(' + position + ')').addClass('selected');
              $(this).data('selected', position);
            }
            break;
            // enter to nav or populate
          case 9:
          case 13:
            var selected = element.find('.ac-item.selected');
            if (selected.length > 0) {
              event.preventDefault();
              if (event.which === 13 && selected.attr('href')) {
                return window.location.assign(selected.attr('href'));
              } else {
                _populate(selected.data(), $(this), {key: true});
                element.find('.ac-item.selected').removeClass('selected');
                $(this).data('selected', -1);
              }
            }
            break;
            // hide on escape
          case 27:
            hide();
            $(this).data('selected', -1);
            break;
          }
        });

        window.addEventListener("resize", hide, false);
      }

      var input = $(this);

      if (typeof settings === "string") {
        if (settings === "show") {
          show();
          _align(input);
        } else if (settings === "hide") {
          hide();
        } else if (options.cache && settings === "clear cache") {
          var cid = parseInt(input.data('cacheId'), 10);
          cache[cid] = {};
        }
        return input;
      } else if (typeof settings.handler === 'undefined' && typeof settings.static === 'undefined') {
        console.error('Neither handler function nor static result list provided for autocomplete');
        return this;
      } else {
        if (typeof settings.static !== 'undefined') {
          // Preprocess strings into items
          settings.static = settings.static.map(function preprocessStatic(_item) {
            var item = typeof _item === 'string'
              ? { value: _item }
              : _item;
            item.match = (item.label || item.value).toLowerCase();
            return item;
          });
        }
        options = $.extend( {}, $.fn.autocomplete.defaults, settings );
        _setup(input);
      }

      return input;
    }.bind(input))();
  }

  $.fn.autocomplete = function acJQuery(settings) {
    return this.each(function acJQueryEach() {
      return Factory(this, settings);
    });
  };

  $.fn.autocomplete.defaults = {
    cache: true,
    hidingClass: 'hidden',
    highlight: true,
    loadingString: 'Loading...',
    maxResults: 20,
    minLength: 3
  };

  var timer = false;
  $.fn.autocomplete.ajax = function acAjax(ops) {
    if (timer) { clearTimeout(timer); }
    if (xhr) { xhr.abort(); }
    timer = setTimeout(
      function acajaxDelay() { xhr = $.ajax(ops); },
      200
    );
  };

}( jQuery ));
