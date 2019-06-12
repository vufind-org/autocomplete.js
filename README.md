# autocomplete.js

> Here to provide the interface so you can control the results.

[![Go to latest version](https://img.shields.io/github/release/vufind-org/autocomplete.js.svg)](https://github.com/vufind-org/autocomplete.js/releases)
[![GitHub license](https://img.shields.io/github/license/vufind-org/autocomplete.js.svg)](https://github.com/vufind-org/autocomplete.js/blob/master/LICENSE.md)
![GitHub last commit](https://img.shields.io/github/last-commit/vufind-org/autocomplete.js.svg)

Go to [Version 1](https://github.com/vufind-org/autocomplete.js/tree/v1) for groups, etc.

## Getting Started

1/ Include the javascript. [Best practices](https://developers.google.com/apps-script/guides/html/best-practices#load_javascript_last) recommend doing this at the bottom of your page's body.

```html
<script src="./autocomplete.js"></script>
```

2/ Include the CSS, usually in your page's head.

```html
<link rel="stylesheet" href="./autocomplete-lite.css"/>
```

3/ Create an Autocomplete instance with all your desired settings.

```js
const AC = new Autocomplete({ limit: 10, minInputLength: 1 });
```

4/ Use the instance to bind handlers to inputs

```js
AC(document.getElementById("ajax"), function achandler(query, callback) {
    const url = "https://api.wordnik.com/v4/words.json/search/" + query + "?api_key=API_KEY";
    fetch(url).then(function(response) {
        return response.json();
    }).then(function(json) {
        callback( json.searchResults.map( word => word.word ) );
    });
});
```

### Defining your handler

Every input is bound to a handler function that will create the results displayed in the UI. This function will be called when a search for a term needs to be done.

The handler function will receive two parameters:
- `query` is the search text
- and `callback` to return your results as
  - an array of strings or numbers (can be HTML)
  - an array of [objects](#item-format)

### Options

| Option | Default | Description |
|--------|---------|-------------|
| delay | 250 | Debounce rate for input: handlers are triggered this many milliseconds after the last character is typed |
| limit | 20 | Max number of results to display |
| loadingString | "Loading..." | String that is displayed while waiting for results. HTML welcome. |
| minInputLength | 3 | Minimum number of characters that need to be typed before a search is made |
| rtl | false | RTL tries to anchor to the right edge of the input instead of the left |

### Item format

Returning objects allows you to have more control and information. You can have any keys you like, but the following control how items are displayed. Text would be the only required field for objects.

```js
{
  text: "What is displayed (html for formatting)",
  value: "optional string that gets filled into the input (maybe a format-free version)",
  href: "optional url to go to when this item is selected",
  sub: "optional smaller subtitle"
}
```

You can disable items with `._disabled`:

```js
{ _disabled: true }
```

You can also create section headers like so:

```js
{ header: "Fruits and Vegetables" }
```

### Events

Autocomplete.js broadcasts an `ac-select` event on the input element when an item is chosen. `event.detail` contains the full item, be it a string, number, or object.

## Autocomplete.static

For default fuzzy searching on a static list of strings, you can use `Autocomplete.static` to create a handler for you.

1/ Include the Autocomplete.static plugin

```html
<script src="./autocomplete-static.js"></script>
```

2/ Use `Autocomplete.static` to create your handler

```js
const animals = ['aardvark','albatross','alligator','alpaca','ant','anteater'...];
AC(document.getElementById("static"), Autocomplete.static(animals));
```

`Autocomplete.static` fires the callback **and** returns the results normally.

### Options

```js
Autocomplete.static(set, [limit], [key]);
```

| Option | Default | Description |
|--------|---------|-------------|
| set    |         | Array of strings or objects you want to search. |
| limit  | 20      | Optional. Number of items to return. |
| key    | undefined | Optional. When objects are passed, this key is used for text comparison. |
