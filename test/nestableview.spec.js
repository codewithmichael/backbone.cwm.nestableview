describe('Backbone.CWM.NestableView', function() {
  "use strict";

  var NestableView = Backbone.CWM.NestableView;
  var expect       = chai.expect;

  // Custom Views
  // ------------

  var CustomView = NestableView.extend({
    className: 'custom',
    template: _.template('[Custom NestableView]')
  });

  var OuterView = NestableView.extend({
    className: 'outer',
    template: _.template('<div class="nest"></div>')
  });

  var InnerView = OuterView.extend({
    className: 'inner'
  });

  var ButtonView = NestableView.extend({
    tagName: 'button',
    template: _.template('Click Me')
  });

  // TESTS
  // =====

  describe('default view instance', function() {
    describe('without data', function() {
      it('should render the default template', function() {
        expect(new NestableView().render().$el.html()).to.equal('[NestableView:{data:{}}]');
      });
    });

    describe('with data', function() {
      it('should render the default template with the provided data', function() {
        var data = { abc: "xyz" };
        expect(new NestableView().render(data).$el.html()).to.equal(
          '[NestableView:{data:' + JSON.stringify(data) + '}]'
        );
      })
    });

    describe('with a model', function() {
      it('should render the default template with the provided data', function() {
        var data = { abc: "xyz" };
        expect(new NestableView({ model: data }).render().$el.html()).to.equal(
          '[NestableView:{data:' + JSON.stringify(data) + '}]'
        );
      })
    });
  })

  describe('custom view instance', function() {
    it('should have a "custom" class', function() {
      expect(new CustomView().render().$el.hasClass('custom')).to.be.true;
    });

    it('should render the custom template', function() {
      expect(new CustomView().render().$el.html()).to.equal('[Custom NestableView]');
    });
  });

  describe('nested views', function() {
    describe('rendering', function() {
      describe('single nesting', function() {
        var outerView, innerView;

        beforeEach(function() {
          outerView = new OuterView();
          innerView = new InnerView();
        });

        describe('replace', function() {
          beforeEach(function() {
            outerView.addView('.nest', innerView, true);
          });

          it('should render elements ".outer > .inner > .nest"', function() {
            var $el = outerView.render().$el;
            expect($el.hasClass('outer')).to.be.true;
            expect($el.html()).to.equal(
              '<div class="inner">' +
                '<div class="nest">' +
                '</div>' +
              '</div>'
            );
          });
        });

        describe('not replace', function() {
          beforeEach(function() {
            outerView.addView('.nest', innerView, false);
          });

          it('should render elements ".outer > .nest > .inner > .nest"', function() {
            var $el = outerView.render().$el;
            expect($el.hasClass('outer')).to.be.true;
            expect($el.html()).to.equal(
              '<div class="nest">' +
                '<div class="inner">' +
                  '<div class="nest">' +
                  '</div>' +
                '</div>' +
              '</div>'
            );
          });
        });
      });

      describe('double nesting', function() {
        var outerView, innerView, innerView2;

        beforeEach(function() {
          outerView  = new OuterView();
          innerView  = new InnerView();
          innerView2 = new InnerView();
        });

        describe('replace', function() {
          beforeEach(function() {
            outerView.addView('.nest', innerView, true);
            innerView.addView('.nest', innerView2, true);
          });

          it('should render elements: ".outer > .inner > .inner > .nest"', function() {
            var $el = outerView.render().$el;
            expect($el.hasClass('outer')).to.be.true;
            expect($el.html()).to.equal(
              '<div class="inner">' +
                '<div class="inner">' +
                  '<div class="nest">' +
                  '</div>' +
                '</div>' +
              '</div>'
            );
          });
        });

        describe('not replace, single layer', function() {
          beforeEach(function() {
            outerView.addView('.nest', innerView, false);
            outerView.addView('.nest', innerView2, false);
          });

          it('should render elements: ".outer > .nest > [(.inner > .nest), (.inner > .nest)]"', function() {
            var $el = outerView.render().$el;
            expect($el.hasClass('outer')).to.be.true;
            expect($el.html()).to.equal(
              '<div class="nest">' +
                '<div class="inner">' +
                  '<div class="nest">' +
                  '</div>' +
                '</div>' +
                '<div class="inner">' +
                  '<div class="nest">' +
                  '</div>' +
                '</div>' +
              '</div>'
            );
          });
        });

        describe('not replace, double layer', function() {
          beforeEach(function() {
            outerView.addView('.nest', innerView, false);
            innerView.addView('.nest', innerView2, false);
          });

          it('should render elements: ".outer > .nest > .inner > .nest > .inner > .nest"', function() {
            var $el = outerView.render().$el;
            expect($el.hasClass('outer')).to.be.true;
            expect($el.html()).to.equal(
              '<div class="nest">' +
                '<div class="inner">' +
                  '<div class="nest">' +
                    '<div class="inner">' +
                      '<div class="nest">' +
                      '</div>' +
                    '</div>' +
                  '</div>' +
                '</div>' +
              '</div>'
            );
          });
        });
      });
    });

    describe('removal', function() {
      var RemovableView, outerView, middleView, innerView, removeCount;

      RemovableView = NestableView.extend({
        template: _.template('<div class="nest"></div>'),
        remove: function() {
          removeCount++;
          return NestableView.prototype.remove.apply(this, arguments);
        }
      });

      beforeEach(function() {
        removeCount = 0;
        outerView = new RemovableView();
        middleView = new RemovableView();
        innerView = new RemovableView();
        outerView.addView('.nest', middleView);
        middleView.addView('.nest', innerView);
      });

      it('should remove each child view individually', function() {
        outerView.render();
        outerView.remove();
        expect(removeCount).to.equal(3);
      })
    }),

    describe('events', function() {
      var outerView, innerView, buttonView;

      beforeEach(function() {
        outerView = new OuterView();
        innerView = new InnerView({
          events: {
            'click button': function(e, done) {
              e.stopPropagation();
              done();
            }
          }
        });
        buttonView = new ButtonView();
        outerView.addView('.nest', innerView, true);
        innerView.addView('.nest', buttonView, true);
      });

      it('should handle delegated events after rendering', function(done) {
        outerView.render();
        buttonView.$el.trigger('click', done);
      });

      it('should handle delegated events after re-rendering', function(done) {
        outerView.render();
        outerView.render();
        buttonView.$el.trigger('click', done);
      });
    });

    describe('child view metadata', function() {
      var outerView, buttonView, buttonViewMeta, buttonViewRenderCount;

      beforeEach(function() {
        outerView = new OuterView();
        buttonView = new (ButtonView.extend({
          render: function() {
            buttonViewRenderCount++;
            return ButtonView.prototype.render.apply(this, arguments);
          }
        }));
        buttonViewRenderCount = 0;
      });

      describe('#selector', function() {
        describe('when null', function() {
          describe('when #replace == true', function() {
            beforeEach(function() {
              outerView.addView(null, buttonView, true);
            });

            it('should render but not attach the child view', function() {
              outerView.render();
              expect(buttonView.$el.html()).to.equal('Click Me');
              expect(outerView.$el.find('button')).to.have.length(0);
            });
          });

          describe('when #replace == false', function() {
            beforeEach(function() {
              outerView.addView(null, buttonView, false);
            });

            it('should render the child view as a direct child element of the parent view', function() {
              outerView.render();
              expect(outerView.$el.children('button')).to.have.length(1);
            });
          });
        });

        describe('when empty string (\'\')', function() {
          describe('when #replace == true', function() {
            beforeEach(function() {
              outerView.addView('', buttonView, true);
            });

            it('should render but not attach the child view', function() {
              outerView.render();
              expect(buttonView.$el.html()).to.equal('Click Me');
              expect(outerView.$el.find('button')).to.have.length(0);
            });
          });

          describe('when #replace == false', function() {
            beforeEach(function() {
              outerView.addView('', buttonView, false);
            });

            it('should render the child view as a direct child element of the parent view', function() {
              outerView.render();
              expect(outerView.$el.children('button')).to.have.length(1);
            });
          });
        });

        describe('when valid (matches valid child element) (\'.nest\')', function() {
          describe('when #replace == true', function() {
            beforeEach(function() {
              outerView.addView('.nest', buttonView, true);
            });

            it('should render the child view in place of the matched child element', function() {
              outerView.render();
              expect(outerView.$el.children('button')).to.have.length(1);
              expect(outerView.$el.children('.nest')).to.have.length(0);
            });
          });

          describe('when #replace == false', function() {
            beforeEach(function() {
              outerView.addView('.nest', buttonView, false);
            });

            it('should render the child view as a child element of the matched child element', function() {
              outerView.render();
              expect(outerView.$el.children('.nest')).to.have.length(1);
              expect(outerView.$el.children('.nest').children('button')).to.have.length(1);
            });
          });
        });

        describe('when not valid (does not match a child element) (\'.xxx\')', function() {
          describe('when #replace == true', function() {
            beforeEach(function() {
              outerView.addView('.xxx', buttonView, true);
            });

            it('should render but not attach the child view', function() {
              outerView.render();
              expect(buttonView.$el.html()).to.equal('Click Me');
              expect(outerView.$el.find('button')).to.have.length(0);
            });
          });

          describe('when #replace == false', function() {
            beforeEach(function() {
              outerView.addView('.xxx', buttonView, false);
            });

            it('should render but not attach the child view', function() {
              outerView.render();
              expect(buttonView.$el.html()).to.equal('Click Me');
              expect(outerView.$el.find('button')).to.have.length(0);
            });
          });
        });
      });

      describe('#renderEnabled', function() {
        describe('when true', function() {
          beforeEach(function() {
            buttonViewMeta = outerView.addView('.nest', buttonView, true);
            buttonViewMeta.renderEnabled = true;
          });

          it('should render the child view\'s associated template', function() {
            outerView.render();
            expect(buttonView.$el.html()).to.equal('Click Me');
          });

          it('should render the child view every time the parent view is rendered', function() {
            outerView.render();
            outerView.render();
            expect(buttonViewRenderCount).to.equal(2);
          });
        });

        describe('when false', function() {
          beforeEach(function() {
            buttonViewMeta = outerView.addView('.nest', buttonView, true);
            buttonViewMeta.renderEnabled = false;
          });

          it('should not render the child view\'s associated template', function() {
            outerView.render();
            expect(buttonView.$el.html()).to.equal('');
          });

          it('should not render the child when the parent view is re-rendered', function() {
            outerView.render();
            outerView.render();
            expect(buttonViewRenderCount).to.equal(0);
          });
        });

        describe('when set to false after the initial render', function() {
          beforeEach(function() {
            buttonViewMeta = outerView.addView('.nest', buttonView, true);
            buttonViewMeta.renderEnabled = true;
            outerView.render();
            buttonViewMeta.renderEnabled = false;
          });

          it('should still contain the previously rendered child view\'s associated template', function() {
            outerView.render();
            expect(outerView.$el.html()).to.equal('<button>Click Me</button>');
          });

          it('should not render the child when the parent view is subsequently rendered', function() {
            outerView.render();
            outerView.render();
            expect(buttonViewRenderCount).to.equal(1);
          });
        });
      });

      describe('#attachEnabled', function() {
        describe('when true', function() {
          describe('when #replace == true', function() {
            beforeEach(function() {
              buttonViewMeta = outerView.addView('.nest', buttonView, true);
              buttonViewMeta.attachEnabled = true;
            });

            it('should attach the child view\'s associated template', function() {
              outerView.render();
              expect(outerView.$el.html()).to.equal('<button>Click Me</button>');
            });

            it('should re-attach the child view every time the parent view is rendered', function() {
              outerView.render();
              outerView.render();
              expect(outerView.$el.children()[0]).to.equal(buttonView.el);
            });
          });

          describe('when #replace == false', function() {
            beforeEach(function() {
              buttonViewMeta = outerView.addView('.nest', buttonView, false);
              buttonViewMeta.attachEnabled = true;
            });

            it('should append the child view\'s associated template', function() {
              outerView.render();
              expect(outerView.$el.html()).to.equal('<div class="nest"><button>Click Me</button></div>');
            });

            it('should re-append the child view every time the parent view is rendered', function() {
              outerView.render();
              outerView.render();
              expect(outerView.$el.children('.nest').children()[0]).to.equal(buttonView.el);
            });
          });
        });

        describe('when false', function() {
          describe('when #replace == true', function() {
            beforeEach(function() {
              buttonViewMeta = outerView.addView('.nest', buttonView, true);
              buttonViewMeta.attachEnabled = false;
            });

            it('should not attach the child view\'s associated template', function() {
              outerView.render();
              expect(outerView.$el.html()).to.equal('<div class="nest"></div>');
            });

            it('should not attach the child view when the parent view is re-rendered', function() {
              outerView.render();
              outerView.render();
              expect(outerView.$el.children()[0]).to.not.equal(buttonView.el);
            });
          });

          describe('when #replace == false', function() {
            beforeEach(function() {
              buttonViewMeta = outerView.addView('.nest', buttonView, false);
              buttonViewMeta.attachEnabled = false;
            });

            it('should not append the child view\'s associated template', function() {
              outerView.render();
              expect(outerView.$el.html()).to.equal('<div class="nest"></div>');
            });

            it('should not append the child view when the parent view is re-rendered', function() {
              outerView.render();
              outerView.render();
              expect(outerView.$el.children('.nest').children()).to.have.length(0);
            });
          });
        });

        describe('when set to false after the initial render', function() {
          describe('when #replace == true', function() {
            beforeEach(function() {
              buttonViewMeta = outerView.addView('.nest', buttonView, true);
              buttonViewMeta.attachEnabled = true;
              outerView.render();
              buttonViewMeta.attachEnabled = false;
            });

            it('should not attach the child view\'s associated template', function() {
              outerView.render();
              expect(buttonViewRenderCount).to.equal(2);
              expect(outerView.$el.html()).to.equal('<div class="nest"></div>');
            });

            it('should not attach the child view when the parent view is re-rendered', function() {
              outerView.render();
              outerView.render();
              expect(buttonViewRenderCount).to.equal(3);
              expect(outerView.$el.children()[0]).to.not.equal(buttonView.el);
            });
          });

          describe('when #replace == false', function() {
            beforeEach(function() {
              buttonViewMeta = outerView.addView('.nest', buttonView, false);
              buttonViewMeta.attachEnabled = true;
              outerView.render();
              buttonViewMeta.attachEnabled = false;
            });

            it('should not attach the child view\'s associated template', function() {
              outerView.render();
              expect(buttonViewRenderCount).to.equal(2);
              expect(outerView.$el.html()).to.equal('<div class="nest"></div>');
            });

            it('should not attach the child view when the parent view is re-rendered', function() {
              outerView.render();
              outerView.render();
              expect(buttonViewRenderCount).to.equal(3);
              expect(outerView.$el.children('.nest').children()).to.have.length(0);
            });
          });
        });
      });
    });
  });
});
