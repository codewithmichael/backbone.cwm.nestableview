Backbone.CWM.NestableView
=========================

A nestable Backbone.View extension.

Usage
-----

**Append a view to an existing element:**

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

**Add a view, replacing an existing element:**

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

**Alternate addView() syntax:**

If you prefer object notation, you can specify the fields by name.

```javascript
appView.addView({
  selector: '.button-goes-here',  // optional: default = ''
  view:     new ButtonView(),     // required
  replace:  true                  // optional: default = false
});
```

Optional undefined fields will revert to their defaults.
