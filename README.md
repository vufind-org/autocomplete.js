# autocomplete.js
Lightweight autocomplete library focused on the UI.

requires [jQuery](http://code.jquery.com/)

## Setup
You can tweak the below options as much as you like, but there are two functions not set by default.

### Using a static list
A list of strings and items to use for every search. Matched without case sensitivity.

Matched items are sorted based on the position of the term within the item. You can change the sorting behaviour by passing a function in as `staticSort`.

```Javascript
$('input').autocomplete({
  static: ['list', 'of', { label:'strings or items', value:'items' }],
  staticSort: optionalFunction
})
```


### Defining a custom handler
For cases where you want to use a dynamic list or make an ajax call to populate your list, this is accomplished by defining a handler function. This function will be called when a search for a term needs to be done. The autocomplete list is then populated by returning items to the callback function.
```Javascript
$('input').autocomplete({
  handler: function(inputEl, callback) { callback(items); }
})
```

- `inputEl` is the input element being queried, it comes jQuery-wrapped
- call `callback` with an array of results when done
  - array of strings
  - array of objects

### item format
```Javascript
{
  value: "input value"
  label: "optional display string for results list",
  description: "optional long text",
  href: "optional, go to a link instead of fill in input"
}
```

### callback (optional)
This function will fire when a selection is made

```Javascript
function(data, inputElement, eventType) {
  // data - full selected object, given from the handler
  // inputElement - the input being populated
  // eventType will have a .mouse = true or a .key = true depending on how the user selected an item
}
```

## other options
- `ajaxDelay` (200) - milliseconds between last input and firing of AJAX
- `cache` (true) - save results by term and reuse results if the same term is retyped
- `hidingClass` ('hidden') - class added when the results are hidden and removed when revealed
- `highlight` (true) - give the search term some **highlight**ing in the results
- `loadingString` ('Loading...') - Pending AJAX phrase
- `maxResults` (20) - Most results shown
- `minLength` (3) - Minimum term length before firing

## example
```Javascript
$('.autocomplete').each(function(i, op) {
  $(op).autocomplete({
    maxResults: 10,
    handler: function(inputEl, cb) {
      console.log(inputEl);
      cb('1,2,3,4,5,6,7,8,9,10'.split(','));
    },
    onselection: function() {
      $(input).closest('form').submit();
    }
  });
});
```

## ajax example
```Javascript
$('.autocomplete').each(function(i, op) {
  $(op).autocomplete({
    maxResults: 10,
    handler: function(inputEl, cb) {
      $.fn.autocomplete.ajax({
        url: 'http://md5.jsontest.com/?text=' + inputEl.val(),
        dataType:'json',
        success: function(json) {
          cb([json.md5, inputEl]);
        }
      });
    }
  });
});
```

## methods
- `$().autocomplete({options})` - setup
- `$().autocomplete('show')`- reveal the results panel
- `$().autocomplete('hide')` - hide the results panel
- `$().autocomplete('clear cache')` - clear cache for these inputs

## exposed components
- `$.fn.autocomplete.ajax` - make jQuery style AJAX calls that cancel on new searches

## License
[Creative Commons Zero License] (https://creativecommons.org/publicdomain/zero/1.0/)