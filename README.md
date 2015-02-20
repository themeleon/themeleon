Themeleon
=========

> A simple Node.js theming standard.

* [Overview](#overview)
  * [Interface](#interface)
  * [Publication](#publication)
  * [Inclusion](#inclusion)
  * [Framework](#framework)
* [Usage](#usage)
  * [As a theme maker](#as-a-theme-maker)
  * [As a theme user](#as-a-theme-user)
* [Examples](#examples)

Overview
--------

### Interface

A theme is a simple JavaScript function. The purpose of this function
is to render a **context** in a **destination**.

The **context** is a JavaScript object. It typically contains the
variables and configuration you will use to render the theme in the
**destination** directory.

A theme is also asynchronous, and relies on [ES6 promises] for this.

[ES6 promises]: https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise

The following JSDoc comment describes the theme interface:

```js
/**
 * @param {String} destination
 *   Destination directory to render the theme in. The directory must
 *   already exist, be empty, and be writable.
 *
 * @param {Object} context
 *   An object passed to the template engine to render the theme. Usually,
 *   each key of the context object will be a variable in the template.
 *
 * @return {Promise}
 *   Any compatible implementation of ES6 promise specification.
 */
function render(destination, context) {}
```

So, if you want to create a *Themeleon compatible* theme, you just have
to implement this interface. See [Usage](#usage) for more details about
this.

The behavior is undefined if the destination directory doesn't exists or
is not empty. Understand: it's the responsibility of the script calling
the theme to make sure the destination is an empty directory. This is
because I believe this logic should not be duplicated in every single
theme, and should instead be handled once in the main "themable"
project.

*Note: Themeleon does not document anything about the context object
structure. This is left to the project that will be themed. It means
that a Themeleon theme is strongly tied with the context it is designed
for.*

#### Publication

You will probably be publishing themes *for a context*, since you need a
predictable idea of what will contain the context data.

The convention is to name the Node.js package like this:

```
${context}-theme-${themeName}
```

The `${context}` variable is the context name, an identifier that
qualifies the kind of data the context object will contain, and
`${themeName}` is the name of your theme.

See a practical example in the [Examples](#examples) section below.

You're not required to publish the theme on npm, anything that can be
`require`d will do the job, so downloading a theme archive, extracting
it in a folder, and including its `index.js` is also an acceptable
solution. I believe it's more practical to use a package manager for
this though.

#### Inclusion

If you want to make your project themable, all you'll need to do is to
dynamically `require` a theme module, an call it with a destination and
context object.

Themeleon doesn't enforces anything about this, but the recommended way
is the following:

1. Let your users configure a theme name (or even directly a theme
   function if you expose a Node.js API).
1. If the theme is not a function but a single identifier (something
   like `[a-z-]+`, but you can be less strict), `require` the prefixed
   name (`${context}-theme-${themeName}`).
1. Otherwise, `require` the whole name (it might be a path), resolved to
   `process.cwd()` (it might be relative too).

See [As a theme user](#as-a-theme-user) for an example on how to include
a theme in your project.

### Framework

Themeleon used to provide a Node.js package, described as:

> A theme creation framework, to ease the interface implementation by
> hiding relatively low-level considerations, like reading and writing
> files, handling promises, and using a raw
> template engine.

Since ES6, and in particular promises and arrow functions, and even ES7
async functions, I find more and more easy to build a theme from
scratch, and often a simple [denodeify] function is enough to deal
decently with asynchronicity, without needing another abstraction layer.

[Themeleon 3.0] was the last release of the framework, and you can still
browse the tree [here][3.0-tree].

[denodeify]: https://github.com/valeriangalliat/es6-denodeify
[Themeleon 3.0]: https://www.npmjs.com/package/themeleon
[3.0-tree]: https://github.com/themeleon/themeleon/tree/17bd4a78707951910bfe17e652b73881ee4e7c0c

Usage
-----

### As a theme maker

I assume you're using ES6 goodness, using a transpiler to maintain ES5
compatibility, for example the awesome [Babel] transpiler
[(formerly 6to5)][6to5]. Though, you're free to stock to ES5; the
following example is not using advanced ES6 syntax and could easily be
ported to ES5, but in a more advanced scenario, the ES6 syntax could
*really* come in handy.

In this example, we're gonna use Babel, the [Bluebird] promise
implementation, [es6-denodeify][denodeify] to make Node.js callback
functions return promises, and the [Swig] template engine.

[Babel]: https://babeljs.io/
[6to5]: https://babeljs.io/blog/2015/02/15/not-born-to-die/
[Bluebird]: https://github.com/petkaantonov/bluebird
[Swig]: http://paularmstrong.github.io/swig/

In your `package.json`:

```json
{
  "name": "foo-theme-bar",
  "version": "0.1.0",

  "dependencies": {
    "bluebird": "^2.9.12",
    "es6-denodeify": "^0.1.1",
    "fs-extra": "^0.16.3"
  },

  "devDependencies": {
    "babel": "^4.3.0"
  },

  "scripts": {
    "build": "babel index.es6.js > index.js",
    "prepublish": "$npm_package_scripts_build"
  }
}
```

Don't forget to `npm install`!

Then, we want the theme function to copy an `assets` directory in the
destination directory, and render Swig template as `index.html`.

In `index.es6.js`:

```js
// Promises compatibility.
const Promise = require('bluebird')
const denodeify = require('es6-denodeify')(Promise)

const fs = require('fs') // Needed to write compiled template to file.
const fse = require('fs-extra') // Needed to copy directory recursively.
const swig = require('swig') // Template engine.

// Make Node-style callback functions return a promise.
const writeFile = denodeify(fs.writeFile)
const copy = denodeify(fse.copy)
const renderFile = denodeify(swig.renderFile)

// Export the theme function.
module.exports = (dest, ctx) =>
  Promise.all(
    // Copy the `assets` directory in the destination directory.
    copy(path.resolve(__dirname, 'assets'), path.resolve(dest, 'assets')),

    // Render the `index.html.swig` template.
    renderFile(path.resolve(__dirname, 'views/index.html.swig'), ctx)
      // Then, write to `index.html` in destination directory.
      .then(html => writeFile(path.resolve(dest, 'index.html'), html))
  )
```

Then run `npm run build` to compile your theme in `index.js`, and you're
ready do publish it!


### As a theme user

Use the above theme in a project:

```js
var theme = require('foo-theme-bar')

// Render the theme in `dest` directory with given variables.
theme('dest', {
  some: 'variables',
  that: 'will be',
  passed: 2,
  the: 'theme',
})
  .then(
    function () { console.log('Success!') },
    function (err) { console.error(err) }
  )
```

Examples
--------

The best production example for Themeleon is [SassDoc]. In fact,
Themeleon was created *for* SassDoc because we wanted to support custom
themes, without having any theming logic inside SassDoc.

SassDoc describes a [theme context interface][theme-context]. This
documents the context object passed to SassDoc themes. So, if you want
to write a theme for SassDoc, all you have to do is to provide a
function implementing the [Themeleon interface](#interface), and making
sense of the context data passed by SassDoc.

Since the context is specific to SassDoc, all themes are prefixed with
`sassdoc-theme-`. Thus, the [default theme][sassdoc-theme-default] is
published as `sassdoc-theme-default`. This theme uses Swig to render a
single HTML page from multiple Swig partials, built around the
documented SassDoc context.

[SassDoc]: https://github.com/SassDoc/sassdoc
[theme-context]: http://sassdoc.com/data-interface/
[sassdoc-theme-default]: https://github.com/SassDoc/sassdoc-theme-default
