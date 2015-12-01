# autocomplete.js
Lightweight autocomplete library focused on the UI.

requires [jQuery](http://code.jquery.com/)

## setup
You can tweak the below options as much as you like, but there are two functions not set by default.

### handler
This function will be called when a search for a term needs to be done
    function(query, cb) {
      // query is the search term
      // callback cb with an array of results when done
      // result formats
      // - array of strings
      // - array of objects: {val: value[, href: link]}
    }

### onselection (optional)
This function will fire when a selection is made
    function(term, inputElement, eventtype) {
      // term is the word searched
      // inputElement will be the input being populated
    }

## options
* **ajaxDelay** (200) - milliseconds between last input and firing of AJAX
* **cache** (true) - save results by term and reuse results if the same term is retyped
* **hidingClass** ('hidden') - class added when the results are hidden and removed when revealed
* **highlight** (true) - give the search term some **highlight**ing in the results
* **loadingString** ('Loading...') - Pending AJAX phrase
* **maxResults** (20) - Most results shown
* **minLength** (3) - Minimum term length before firing

## example
    $('.autocomplete').each(function(i, op) {
      $(op).autocomplete({
        maxResults: 10,
        handler: function(query, cb) {
          console.log(query);
          cb('1,2,3,4,5,6,7,8,9,10'.split(','));
        },
        onselection: function() {
          $(input).closest('form').submit();
        }
      });
    });

## ajax example
    $('.autocomplete').each(function(i, op) {
      $(op).autocomplete({
        maxResults: 10,
        handler: function(query, cb) {
          $.fn.autocomplete.ajax({
            url: 'http://md5.jsontest.com/?text='+query,
            dataType:'json',
            success: function(json) {
              cb([json.md5, query]);
            }
          });
        }
      });
    });

## methods
* **$().autocomplete({options})** - setup
* **$().autocomplete('show')** - reveal the results panel
* **$().autocomplete('hide')** - hide the results panel
* **$().autocomplete('clear cache')** - clear cache for these inputs

## exposed components
* $.fn.autocomplete.ajax - make jQuery style AJAX calls that cancel on new searches
* $.fn.autocomplete.cache
* $.fn.autocomplete.element - results container
* $.fn.autocomplete.options

## License
[Creative Commons Zero License] (https://creativecommons.org/publicdomain/zero/1.0/)