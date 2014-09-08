# Backbone.CWM.NestableView

A nestable Backbone.View extension.

## Usage

### Append a view to an existing element

```javascript
// Create an application view
var AppView = Backbone.CWM.NestableView.extend({
  template: _.template('Look, some buttons! <div class="button-container"></div>')
});

// Create a generic button view
var ButtonView = Backbone.CWM.NestableView.extend({
  tagName: 'button',
  template: _.template('Button')
});

// Instantiate the application view
var appView = new AppView({ el: '#app' });

// Add a few buttons to the matched element
appView.addView('.button-container', new ButtonView());
appView.addView('.button-container', new ButtonView());
appView.addView('.button-container', new ButtonView());

// Render the application view and all nested views
appView.render();
```

If the selector is *null*, *undefined*, or an empty string then the view will be appended directly to the parent view's element. Example:

```javascript
...

appView.addView(null, new ButtonView());

...
```

### Add a view, replacing an existing element

This is exactly the same as appending, but add *true* to the *addView()* arguments.

```javascript
// Create an application view
var AppView = Backbone.CWM.NestableView.extend({
  template: _.template('Look, a button! <div class="button-goes-here"></div>')
});

// Create a generic button view
var ButtonView = Backbone.CWM.NestableView.extend({
  tagName: 'button',
  template: _.template('Button')
});

// Instantiate the application view
var appView = new AppView({ el: '#app' });

// Add a button view, replacing the matched element
appView.addView('.button-goes-here', new ButtonView(), true);

// Render the application view and all nested views
appView.render();
```

In case of multiple matched elements, it will replace the first one found. If multiple views are added with the same selector, they will replace each matched element in sequence.

If the selector is *null*, *undefined*, or an empty string then the child view will still be rendered in the background but, since it cannot safely replace the parent view, it will not be attached to the DOM and will not be displayed.

### Alternate addView() syntax

If you prefer object notation, you can specify the fields by name.

```javascript
...

appView.addView({
  selector: '.button-goes-here',  // optional: default = ''
  view:     new ButtonView(),     // required
  replace:  true                  // optional: default = false
});

...
```

Optional undefined fields will revert to their defaults.

### Disable child view rendering

Sometimes you may only want to render a child view once but still want subsequent renders of the parent view to contain the child view. This can be accomplished by disabling rendering of the child view after the first render.

```javascript
...

// Instantiate the application view
var appView = new AppView({ el: '#app' });

// Add a child view
var childViewMeta = appView.addView(null, new ChildView());

// Render the application view and all nested views
appView.render();

// Disable rendering of the child view
childViewMeta.renderEnabled = false;

// Render the application view a few more times
appView.render();
appView.render();
appView.render();
appView.render();
```

In the example above, the application view is rendered 5 times, but the child view is only rendered once, even though it continues to be displayed in each subsequent render of the application view.

### Disable child view attaching

This is a slightly more advanced topic.

Similar to disabling rendering, the act of attaching a child view can be disabled for upcoming render cycles. This is useful if you want to hide a child view that would normally be appended.

In the case of a child view that normally replaces an element, disabling attaching may be desirable if you want to temporarily fall back to the default element or swap in another child view.

In most cases you will also want to disable rendering at the same time, but it's not strictly required. If rendering of the child view is not disabled it will continue to render in the background while remaining detached from the DOM.

```javascript
...

// Instantiate the application view
var appView = new AppView({ el: '#app' });

// Add a child view
var childViewMeta = appView.addView(null, new ChildView());

// Render the application view and all nested views
appView.render();

// Disable attaching of the child view (it will be hidden for the next render)
childViewMeta.attachEnabled = false;

// Render the application view -- child view is hidden
appView.render();

// Enable attaching of the child view (it will be visible for the next render)
childViewMeta.attachEnabled = true;

// Render the application view -- child view is visible
appView.render();
```

## Testing

The test suite is built on [Mocha](http://visionmedia.github.io/mocha/) and [Chai](http://chaijs.com/).

Tests can be run either in the browser or via command line. Either way requires the [Node](http://nodejs.org/) development packages be installed first.

### Terminal

Assuming Node and NPM are already installed, run the following in a terminal from the checked out directory to install the dependencies and run the tests:

```
npm install
npm test
```

### Browser

If you prefer to view the tests in a browser, or want to run the tests in a specific browser, install the dependencies via `npm` (as shown above) and then open *test.html* in your preferred browser.
