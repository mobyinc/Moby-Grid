;
(function($, window, document, undefined) {
  'use strict';

  var pluginName = 'waft',
    defaults = {
      magnitude: '1',
      childSelector: '.bubble',
      fpsElement: null
    };

  // The actual plugin constructor
  function Plugin(element, options) {
    this.settings = $.extend({}, defaults, options);
    this._defaults = defaults;
    this._name = pluginName;
    this.nodes = [];
    this.$window = $(window);
    this.$element = $(element);
    this.$children = this.$element.find(this.settings.childSelector);
    this.$fpsElement = this.settings.fpsElement;
    this.fpsPeriod = 20;
    this.fpsSMA = simpleMovingAverager(this.fpsPeriod);
    this.fpsCounter = 0;
    this.lastFrame = new Date();
    this.lastScrollTop = 0;
    this.scrollPeriod = 5;
    this.scrollSMA = simpleMovingAverager(this.scrollPeriod);
    this.smoothScrollVelocity = 0;
    this.friction = 0.6;
    this.animFrame =  window.requestAnimationFrame       ||
                      window.webkitRequestAnimationFrame ||
                      window.mozRequestAnimationFrame    ||
                      window.oRequestAnimationFrame      ||
                      window.msRequestAnimationFrame     ||
                      null ;
    this.init();
  };

  function simpleMovingAverager(period) {
    var nums = [];
    return function(num) {
      nums.push(num);
      if (nums.length > period)
        nums.splice(0,1);  // remove the first element of the array
      var sum = 0;
      for (var i in nums)
        sum += nums[i];
      var n = period;
      if (nums.length < period)
        n = nums.length;
      return(sum/n);
    }
  };

  $.extend(Plugin.prototype, {
    init: function() {
      this.initModel();
      this.listenScroll();
      this.startMainLoop();
    },
    initModel: function() {
      var self = this;

      self.$children.each(function(index, el) {
        var $el = $(el);
        var node = {
          $el: $el,
          initialTop: parseFloat($el.css('top')),
          delta: 0,
          velocity: 0
        };

        self.nodes.push(node);
      });
    },
    listenScroll: function() {
      var self = this;
      self.lastScrollTop = self.$window.scrollTop();

      self.$window.scroll(function(e) {
        var newTop = self.$window.scrollTop();
        var velocity = newTop - self.lastScrollTop;
        self.lastScrollTop = newTop;
        self.smoothScrollVelocity = self.scrollSMA(velocity);
      });
    },
    startMainLoop: function() {
      var self = this;

      if (self.animFrame !== null) {
        var recursiveAnim = function() {
          var now = new Date();
          var delta = now - self.lastFrame;
          self.lastFrame = now;
          self.mainLoop(delta);
          self.animFrame.call(window, recursiveAnim);
        };

        // start
        self.lastFrame = new Date();
        self.animFrame.call(window, recursiveAnim);
      } else {
        // fallback to getInterval?
      }
    },
    mainLoop: function(delta) {
      this.tick(delta);
      this.update();
    },
    tick: function(delta) {
      var s = delta / 1000;

      if (this.$fpsElement !== null) this.updateFPS(delta);

      this.smoothScrollVelocity *= this.friction * (1 - s);
    },
    updateFPS: function(delta) {
      this.fpsCounter++;
      if (this.fpsCounter % this.fpsPeriod) {
        var value = Math.round(this.fpsSMA(1000/delta));
        this.$fpsElement.text(value);

        // Scroll velocity debug
        $('#scrollVel').text(Math.round(this.smoothScrollVelocity));
        $('#scrollVelBar').css({ width: Math.abs(this.smoothScrollVelocity) * 2 });
      }
    },
    update: function() {
      // position elements
    }
  });

  $.fn[pluginName] = function(options) {
    return this.each(function() {
      if (!$.data(this, "plugin_" + pluginName)) {
        $.data(this, "plugin_" + pluginName, new Plugin(this, options));
      }
    });
  };

})(jQuery, window, document);