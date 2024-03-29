;
(function($, window, document, undefined) {
  "use strict";

  var pluginName = "mobyGrid",
    defaults = {
      propertyName: "value"
    };

  // The actual plugin constructor
  function Plugin(element, options) {
    this.element = element;
    this.$element = $(element);
    this.$cells = this.$element.find('.cell');

    this.sizes = {
      "small":  [[1]],
      "wide":   [[1,1]],
      "tall":   [[1],
                 [1]],
      "large":  [[1,1],
                 [1,1]]
    };

    this.breakpoints = [
      {
        minWidth: 768,
        cols: 4
      },
      {
        minWidth: 400,
        cols: 2
      },
      {
        minWidth: 0,
        cols: 1
      },
    ];

    this.cols = 4;
    this.rows = 0;
    this.cellSize = 0;
    this.model = [];

    this.settings = $.extend({}, defaults, options);
    this._defaults = defaults;
    this._name = pluginName;
    this.init();
  }

  $.extend(Plugin.prototype, {
    init: function() {
      var self = this;
      this.layout();

      $(window).resize(function() {
        self.layout();
      });

      this.addEvents();
    },
    addEvents: function() {
      var self = this;
      $('.cell a').on('mouseover', function(e) {
        self.animateIn($(this));
      }).on('mouseleave', function(e) {
        self.animateOut($(this));
      });
    },
    animateIn: function($target) {
      var $el = $target.parent();
      var $overlay = $el.find('.overlay');
      var $content = $el.find('.content');
      var $overlayContent = $el.find('.overlay-content');
      var $plus = $el.find('.plus');

      $overlay.stop().transition({
        bottom: '0px',
        right: '0px',
        duration: 800
      });

      // slide
      // $content.transition({
      //   top: '-100%',
      //   left: '-100%'
      // });
      // matrix(1, -0.2, -0.2, 1, 0, 0)

      // $content.transition({
      //   x: -250,
      //   y: -250,
      //   skewX: '45deg',
      //   skeyY: '45deg',
      //   scale: 0.8,
      //   duration: 1500
      // });

      $plus.stop().transition({
        opacity: 0.0
      });

      $overlayContent.css({
        display: 'block'
      });

      $overlayContent.stop().transition({
        marginTop: '0px',
        delay: 300
      });

      $overlayContent.stop().find('img').transition({
        opacity: 1.0,
        delay: 300
      });

      $overlayContent.stop().find('label').transition({
        opacity: 1.0,
        delay: 400
      });
    },
    animateOut: function($target) {
      var $el = $target.parent();
      var $overlay = $el.find('.overlay');
      var $content = $el.find('.content');
      var $overlayContent = $el.find('.overlay-content');
      var $plus = $el.find('.plus');

      $plus.transition({
        opacity: 1.0,
        delay: 400
      });

      $overlayContent.find('img, label').transition({
        opacity: 0.0
      });

      // $content.transition({
      //   x: 0,
      //   y: 0,
      //   skewX: '0deg',
      //   skeyY: '0deg',
      //   scale: 1,
      //   delay: 400,
      //   duration: 800
      // });

      $overlay.transition({
        bottom: '-460px',
        right: '-460px',
        delay: 400,
        duration: 700
      });

      $overlayContent.transition({
        marginTop: '-15px',
        delay: 500
      });
    },
    test: function(row, col, type) {
      var matrix = this.sizes[type];
      for (var r = row; r < row + matrix.length; r++) {
        if (r >= this.rows) return false;

        for (var c = col; c < col + matrix[0].length; c++) {
          if (c >= this.cols) return false;
          if (this.model[r][c] == 1) return false;
        }
      }

      return true;
    },
    setCell: function($target, row, col, type) {
      console.log('placing ' + $target + ' in ' + row + ', ' + col + ': ' + type);
      var matrix = this.sizes[type];

      for (var r = row; r < row + matrix.length; r++) {
        for (var c = col; c < col + matrix[0].length; c++) {
          this.model[r][c] = 1;
          $target.css({
            top: row * this.cellSize,
            left: col * this.cellSize
          });
        }
      }
    },
    placeCell: function($target, type) {
      for (var r = 0; r < this.rows; r++) {
        for (var c = 0; c < this.cols; c++) {
          if (this.test(r, c, type)) {
            this.setCell($target, r, c, type);
            return;
          }
        }
      }
    },
    layout: function() {
      var self = this;
      var size = this.$cells.length * this.cols;
      var width = this.$element.width();
      var breakpoint = this.breakpoints[0];
      var breakpointIndex = 0;

      while (width < breakpoint.minWidth) {
        breakpoint = this.breakpoints[++breakpointIndex];
      }

      this.model = [];
      this.cols = breakpoint.cols;
      this.rows = Math.floor(size / this.cols);
      for (var r = 0; r < this.rows; r++) {
        this.model[r] = [];
        for (var c = 0; c < this.cols; c++) {
          this.model[r][c] = 0;
        }
      }

      var cellSize = this.cellSize = Math.ceil(width / this.cols);

      this.$cells.each(function(index, el) {
        var $target = $(el);
        var type = self.cols > 1 ? $target.data('type') : 'small';
        var w, h = 0;

        switch(type) {
          case 'small':
            w = h = cellSize;
            break;
          case 'wide':
            w = cellSize * 2;
            h = cellSize;
            break;
          case 'tall':
            w = cellSize;
            h = cellSize * 2;
            break;
          case 'large':
            w = cellSize * 2;
            h = cellSize * 2;
            break;
        }

        $target.width(w);
        $target.height(h);

        self.placeCell($target, type);
      });
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