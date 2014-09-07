/*!
 * Backbone.CWM.NestableView v0.1.0
 *
 * (c) 2014 Michael Spencer
 * Released under the MIT license
 */

;(function(exports, BaseView) {

  var NestableView = BaseView.extend({
    template: _.template('[NestableView:{data:<%- JSON.stringify(data) %>}]'),
    views: function() { return []; },

    constructor: function(options) {
      if (options && options.views) {
        this.views = options.views;
        delete options.views;
      }
      if (_.isObject(this.views)) { this.views = _.result(this, 'views'); }
      BaseView.apply(this, arguments);
    },

    renderTemplate: function(data) {
      data = data || (this.model && this.model.toJSON()) || {};
      return this.template({ data: data });
    },

    addView: function(selector, view, replace) {
      var meta = {
        selector: selector || '',
        view: view,
        replace: !!replace,
        renderEnabled: true,
        attachEnabled: true
      };
      if (!this.views) { this.views = []; }
      this.views.push(meta);
      return meta;
    },

    detachViews: function() {
      // Detach child views (in reverse order)
      if (this.views && this.views.length) {
        var viewFragments = {};
        for (var i = this.views.length - 1; i >= 0; i--) {
          var meta = this.views[i];
          var selector = meta.selector || '';
          if (meta.replace && selector) {
            // Attached views
            meta.view.$el.detach();
          } else {
            // Nested views
            if (!('attachEnabled' in meta) || meta.attachEnabled) {
              var viewFragment = viewFragments[selector];
              if (!viewFragment) {
                viewFragment = document.createDocumentFragment();
                viewFragments[selector] = viewFragment;
              }
              // insert at beginning since we are iterating backwards
              viewFragment.insertBefore(meta.view.el, viewFragment.firstChild);
            } else {
              meta.view.$el.detach();
            }
          }
        }
        this._viewFragments = viewFragments;
      }
    },

    renderViews: function() {
      if (this.views && this.views.length) {
        _.each(this.views, function(meta) {
          if (!('renderEnabled' in meta) || meta.renderEnabled) {
            meta.view.render();
          }
        });
      }
    },

    attachViews: function() {
      // Attach child views
      if (this.views && this.views.length) {
        _.each(this.views, function(meta) {
          if (!('attachEnabled' in meta) || meta.attachEnabled) {
            var selector = meta.selector || '';
            var $selectorEl = selector ? this.$el.find(selector) : this.$el;
            if ($selectorEl.length) {
              if (meta.replace && selector) {
                // Attached views
                // Replace the selector element with the view element
                $selectorEl.replaceWith(meta.view.el);
              } else {
                // Nested views
                // Append the fragment to the selector element (if it hasn't already been added)
                var viewFragment = this._viewFragments[selector];
                if (viewFragment) {
                  $selectorEl.append(viewFragment);
                  delete this._viewFragments[selector];
                }
              }
            }
          }
        }, this);
      }
      delete this._viewFragments;
    },

    render: function(data) {
      this.undelegateEvents();
      this.detachViews();
      this.$el.html(this.renderTemplate(data));
      this.renderViews();
      this.attachViews();
      this.delegateEvents();
      return this;
    }
  });

  exports.NestableView = NestableView;

}.call(this, Backbone.CWM = Backbone.CWM || {}, Backbone.View));
