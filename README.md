# Themeleon [![npm version](http://img.shields.io/npm/v/themeleon.svg?style=flat-square)](https://www.npmjs.org/package/themeleon)

> A lightweight Node.js theme engine.

* [Overview](#overview)
  * [Interface](#interface)
    * [Publication](#publication)
    * [Inclusion](#inclusion)
  * [Framework](#framework)
* [Usage](#usage)
  * [As a theme maker](#as-a-theme-maker)
  * [As a theme user](#as-a-theme-user)
* [Template engines](#template-engines)
  * [Swig](#swig)
  * [Nunjucks](#nunjucks)
  * [Jade](#jade)
  * [Mustache](#mustache)
  * [Handlebars](#handlebars)
* [Examples](#examples)

Overview
--------

Themeleon is two things:

1. a conventional interface to build themes with Node.js,
1. a tiny and modular framework to implement the interface.

### Interface

A theme is a simple JavaScript function. The purpose of this function
is to render a **context** in a **destination**.

The **context** is a JavaScript object. It typically contains the
variables and configuration you will use to render the theme in the
**destination** directory.

A theme is also asynchronous, and relies on [Promises/A+] for this.

[Promises/A+]: http://promises-aplus.github.io/promises-spec/

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
 *   Any compatible implementation of the Promises/A+ specification.
 */
function render(destination, context) {}
```

So, if you want to create a *Themeleon compatible* theme, you can
implement this interface by hand without relying on the `themeleon`
Node.js package.

The behavior is undefined if the destination directory doesn't exists or
is not empty.

*Note: Themeleon does not document anything about the context object
structure. This is left to the project that will be themed. It means
that a Themeleon theme is strongly tied with the context it is designed
for.*

#### Publication

You will probably be publishing themes *for a context*, since you need a
predictable idea of what will contain the context data.

The convention is to name the Node.js package like this:

```
{{context}}-theme-{{theme}}
```

The `{{context}}` variable is the context name, an identifier that
qualifies the kind of data the context object will contain, and
`{{theme}}` is the name of your theme.

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
   name (`{{context}}-theme-{{theme}}`).
1. Otherwise, `require` the whole name (it might be a path), resolved to
   `process.cwd()` (it might be relative too).

### Framework

Themeleon also acts as a theme creation framework, to ease the
interface implementation by hiding relatively low-level considerations,
like reading and writing files, handling promises, and using a raw
template engine.

When using the framework, you only have to define a render function,
that will describe the high-level tasks needed to render the theme.

These tasks are in fact mixins that you include in your Themeleon
instance. It's easy to define and share custom mixins, and that's how
[template engines](#template-engines) are brought to Themeleon.

The mixins makes it easy to abstract the theme directory, destination
directory and the context data. For example, a mixin can decide to make
a given path relative to the theme or destination directory when it
makes sense, instead of the CWD, and a template engine mixin can
implicitely pass the context object to the templates.

Usage
-----

### As a theme maker

First, install Themeleon in your `package.json`:

```sh
npm install themeleon --save
```

```json
{
  "dependencies": {
    "themeleon": "1.*"
  }
}
```

You will be using Themeleon in the `index.js` of your theme package.

First, create a Themeleon instance:

```js
var themeleon = require('themeleon')();
```

You can then use some mixins, for example see the
[supported template engines](#template-engines).

```js
// Use Swig mixin
themeleon.use('swig');

// You can also use Jade
// themeleon.use('jade');

// Or Mustache
// themeleon.use('mustache');
```

You may also add your own mixin:

```js
themeleon.use({

  /**
   * Log current source directory, destination directory, and context
   * variables.
   */
  log: function () {
    console.log(this.src, this.dest, this.ctx);
  },
});
```

Now everything is initialized, you can begin to describe your theme.

For this, you define a function taking a Themeleon instance `t` as
parameter, and you give this function to the `themeleon` function,
together with the theme directory (certainly `__dirname` if you're in
the `index.js`):

```js
module.exports = themeleon(__dirname, function (t) {
  // Theme render logic here
});
```

The `themeleon` function will take care of the
[interface implementation](#interface), and will call your render
function on demand. That's where the magic resides:

```js
module.exports = themeleon(__dirname, function (t) {
  t.copy('assets'); // Will copy `assets` in destination directory
  // t.copy('assets', 'foo'); // Other name in destination directory

  // Compile a Swig view as `index.html` in destination directory
  t.swig('views/index.html.swig', 'index.html');

  // Call the custom mixin defined above
  t.log();
});
```

And that's all! Themeleon will run all the tasks and return a promise
waiting for them all to complete.

### As a theme user

Use the above theme (assuming it's named `project-theme-foo`) in a
project:

```js
var theme = require('project-theme-foo');

// Render the theme in `dest` directory with given variables
theme('dest', {
  some: 'variables',
  that: 'will be',
  passed: 2,
  the: 'theme',
});
```

Template engines
----------------

### Swig

```js
// Use the Swig mixin
themeleon.use('swig');

// Or inject your own instance
themeleon.use('swig', require('swig'));

module.exports = themeleon(__dirname, function (t) {
  // Compile a Swig view as `index.html` in destination directory
  t.swig('views/index.html.swig', 'index.html');
});
```

### Nunjucks

```js
// Use the Nunjucks mixin
themeleon.use('nunjucks');

// Or inject your own instance
themeleon.use('nunjucks', require('nunjucks'));

module.exports = themeleon(__dirname, function (t) {
  // Configure Nunjucks views base path and options
  t.nunjucks.configure('views', options);

  // Compile a Nunjucks view as `index.html` in destination directory
  t.nunjucks('index.html', 'dist/index.html');
});
```

See [Nunjucks configuration](https://mozilla.github.io/nunjucks/api.html#configure).

### Jade

```js
// Use the Jade mixin
themeleon.use('jade');

// Or inject your own instance
themeleon.use('jade', require('jade'));

module.exports = themeleon(__dirname, function (t) {
  var options = {
    pretty: true,
  };

  // Compile a Jade view as `index.html` in destination directory
  t.jade('views/index.jade', 'index.html', options);
});
```

### Mustache

```js
// Use the Mustache mixin
themeleon.use('mustache');

// Or inject your own instance
themeleon.use('mustache', require('mustache'));

module.exports = themeleon(__dirname, function (t) {
  // Render index alone
  t.mustache('views/index.mustache', 'index.html');

  // Or include a partials object
  t.mustache('views/index.mustache', 'index.html', {
    foo: 'views/foo.mustache',
    'foo/bar': 'views/foo/bar.mustache',
  });

  // Or let the mixin resolve all `.mustache` files in `views`
  t.mustache('views/index.mustache', 'index.html', 'views');
});
```

### Handlebars

```js
// Use the Handlebars mixin
themeleon.use('handlebars');

// Or inject your own instance
themeleon.use('handlebars', require('handlebars'));

module.exports = themeleon(__dirname, function (t) {
  // Render index alone
  t.handlebars('views/index.handlebars', 'index.html');

  // Or include a partials object
  t.handlebars('views/index.handlebars', 'index.html', {
    foo: 'views/foo.handlebars',
    'foo/bar': 'views/foo/bar.handlebars',
  });

  // Or let the mixin resolve all `.handlebars` files in `views`
  t.handlebars('views/index.handlebars', 'index.html', 'views');
});
```

**Note:** `.handlebars` and `.hbs` extensions are supported.

Examples
--------

The best production example for Themeleon is [SassDoc]. In fact,
Themeleon was created *for SassDoc* because we wanted to support custom
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
