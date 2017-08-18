[![Travis Status](https://travis-ci.org/vufind-org/autocomplete.js.svg?branch=master)](https://travis-ci.org/crhallberg/autocomplete.js)

# autocomplete.js
Here to provide the interface so you can control the results.

requires [jQuery](http://code.jquery.com/)

---

[Setup](#setup)
~ [Sectioned display](#sectioned-display)
~ [Other options](#other-options)
~ [Methods and Events](#events)
~ [Examples](#basic-handler-example)

---

## Setup
You can tweak the below options as much as you like, but there are two functions not set by default.

### Using a static list
A list of strings and [items](#item-format) to use for every search. Matched without case sensitivity.

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
  - array of [objects](#item-format)

### Item format
```Javascript
{
  value: "input value"
  label: "optional display string for results list",
  description: "optional long text",
  href: "optional, go to a link instead of fill in input"
}
```

### callback (optional)
This function will fire when a selection is made. Values returned will populate the input. Returning false will prevent closing of the dropdown and populating of the input element.

```Javascript
function(data, inputElement, eventType) {
  // data - full selected object, given from the handler
  // inputElement - the input being populated
  // eventType will have a .mouse = true or a .key = true depending on how the user selected an item
}
```

## Sectioned display
Returning an object with a `groups` key to your handler callback will create a sectioned output.
```Javascript
{
  groups: [
    [items],
    [], // empty arrays ignored
    { label: "Section 2", items: [items] }, // use { label:, items: } to add headers to your groups
    [items]
  ]
}
```
![Groups example](http://image.prntscr.com/image/16f13976674b4b618fd94ddbad04c8ab.png)

## Other options
- `ajaxDelay` (200) - milliseconds between last input and firing of AJAX
- `cache` (true) - save results by term and reuse results if the same term is retyped
- `hidingClass` ('hidden') - class added when the results are hidden and removed when revealed
- `highlight` (true) - give the search term some **highlight**ing in the results
- `loadingString` ('Loading...') - Pending AJAX phrase
- `maxResults` (20) - Most results shown
- `minLength` (3) - Minimum term length before firing

## Methods
- `$().autocomplete({options})` - setup
- `$().autocomplete('show')`- reveal the results panel
- `$().autocomplete('hide')` - hide the results panel
- `$().autocomplete('clear cache')` - clear cache for these inputs

## Events
| name | params | description |
|------|-------------|
| **`ac:render`** | `HTMLDivElement container` | When the HTML of the results list has been created, but before `display` (for binding before display) |
| **`ac:select`** | `[ItemObj](#item-format) item, [`{} eventType`](#callback)` | When an option has been selected. Equivalent to using [`callback`](#callback) |

## Exposed components
- `$.fn.autocomplete.ajax` - make jQuery style AJAX calls that cancel on new searches

## Basic Handler Example
```Javascript
$('.autocomplete').each(function(i, op) {
  $(op).autocomplete({
    maxResults: 10,
    handler: function(inputEl, cb) {
      console.log(inputEl);
      cb('1,2,3,4,5,6,7,8,9,10'.split(','));
    },
    callback: function() {
      $(input).closest('form').submit();
    }
  });
});
```

## AJAX Example
```Javascript
$(input).autocomplete({
  maxResults: 10,
  handler: function(inputEl, cb) {
    $.fn.autocomplete.ajax({
      url: 'http://md5.jsontest.com/?text=' + inputEl.val(),
      dataType:'json',
      success: function(json) {
        cb([json.md5, inputEl[0]]);
      }
    });
  }
});
```

## Static Example
```Javascript
$(input).autocomplete({
  static: ['aardvark','albatross','alligator','alpaca','ant','anteater','antelope','ape','armadillo','baboon','badger','barracuda','bat','bear','bee','beetle','bison','boar','buffalo','bushbaby','bustard','butterfly','camel','capuchin','caribou','cat','caterpillar','chameleon','chamois','cheetah','chicken','chimpanzee','chinchilla','chipmunk','chough','clam','cobra','cockroach','cod','cormorant','coyote','crab','crane','crocodile','crow','curlew','deer','dinosaur','dog','dogfish','dolphin','donkey','dotterel','dove','dragon','dragonfly','duck','dugong','dunlin','eagle','echidna','eel','eland','elephant','elk','emu','falcon','ferret','finch','fish','flamingo','fly','fox','frog','gaur','gazelle','gecko','gerbil','giraffe','gnu','goat','goldfish','goose','gorilla','goshawk','grasshopper','grouse','guanaco','gull','hamster','hare','hawk','hedgehog','heron','herring','hippopotamus','hornet','horse','horsecrab','hummingbird','hyena','hyrax','ibex','ibis','iguana','impala','jackal','jaguar','jay','jellyfish','kangaroo','koala','kouprey','kudu','lapwing','lark','lemming','lemur','leopard','lion','llama','lobster','locust','loris','louse','lynx','lyrebird','magpie','mallard','manatee','marten','meerkat','mink','mole','mongoose','monkey','moose','mosquito','mouse','mule','narwhal','newt','nightingale','numbat','octopus','okapi','opossum','oryx','ostrich','otter','owl','ox','oyster','panther','parrot','partridge','peacock','peafowl','pelican','penguin','pheasant','pig','pigeon','platypus','pony','porcupine','porpoise','puffin','quagga','quail','quelea','rabbit','raccoon','ram','rat','raven','reindeer','rhea','rhinoceros','rook','ruff','salamander','salmon','sambar','sandpiper','sardine','scorpion','seahorse','seal','shark','sheep','shrew','shrimp','skink','skunk','snail','snake','spider','squid','squirrel','starling','stinkbug','stork','swan','tapir','tarsier','termite','tern','tiger','toad','trout','turkey','turtle','viper','vulture','wallaby','walrus','wasp','weasel','whale','wolf','wolverine','wombat','woodcock','woodpecker','worm','wren','yak','zebra','zorilla']
});
```
