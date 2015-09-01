$(document).ready(function() {
  var prevScrollTop = 0;
  var scrollTimeout, scrollFinish;
  var $grid = $('#grid_container');
  var loading = true;

  var images = $('img')
  $('.bubble').each(function(){
    var el = $(this)
      , image = el.css('background-image').match(/url\((['"])?(.*?)\1\)/);
    if(image)
      images = images.add($('<img>').attr('src', image.pop()));
  });
  images.imagesLoaded(function() {
    console.log('loaded 2!')
  });
  imagesLoaded('#grid_container', function() {
    console.log('loaded!')
  })
  $('.bubble').each(function() {
    var $bubble = $(this);
    var top = parseFloat($(this).css('top'));
    $(this).data('original-top', top);
  }).hide();

  $bubbles = _.shuffle($('.bubble'));
  var topBubbles = _.first($bubbles, $bubbles.length / 2)
  var bottomBubbles = _.last($bubbles, $bubbles.length / 2)
  var loadBubbles = function(bubbles, callback) {
    _.each(bubbles, function(bubble) {
      var $bubble = $(bubble);
      var images = $bubble.find('img');
      var image = $bubble.css('background-image').match(/url\((['"])?(.*?)\1\)/);
      if (image) { images = images.add($('<img>').attr('src', image.pop())); }
      images.imagesLoaded(function() {
        callback($bubble);
      });
    });
  };
  loadBubbles(topBubbles, function($bubble) {
    var top = $bubble.data('original-top')
    $bubble.css({ top: -$(window).height() }).show().animate({ top: top }, 1000, 'swing', function() {
      loading = false;
    });
  });
  loadBubbles(bottomBubbles, function($bubble) {
    var top = $bubble.data('original-top')
    $bubble.css({ top: $(document).height() }).show().animate({ top: top }, 700, 'swing', function() {
      loading = false;
    });
  });

  $(window).on('scroll', function(event) {
    if (loading) { return; }

    var gridBottom = $grid.offset().top + $grid.height();
    var scrollTop = $(this).scrollTop();
    var scrollDelta = scrollTop - prevScrollTop;

    if (scrollTop > gridBottom) { return; }
    console.log('scroll', scrollDelta);

    var move = function(selector, speed) {
      $(selector).each(function() {
        var curTop = parseFloat($(this).css('top'));
        var newTop = curTop - (scrollDelta * speed);
        $(this).animate({ top: newTop }, 1);
      });
    };

    scrollTimeout = setTimeout(function() {
      clearTimeout(scrollTimeout);
      clearTimeout(scrollFinish);

      scrollFinish = setTimeout(function() {
        console.log('stop')
        $('.bubble').each(function() {
          $(this).animate({ top: $(this).data('original-top') }, 300);
        });
      }, 150);

      if (true) {
        move('.case-study', 0.4)
        move('.cta', 0.5)
        move('.product', 0.8)
        move('.blog', 1.2)
        move('.job', 1.5)
      } else {
        $('.bubble').each(function() {
          var momentum = $(this).data('momentum');
          var newTop = parseFloat($(this).css('top')) + (scrollDelta * momentum);
          $(this).animate({ top: newTop }, 1);
        });
      }
    }, 100);

    prevScrollTop = scrollTop;
  });

  $('#grid_container').each(function() {
    $grid = $(this);
    $grid.find('> a').bind('click', function(event) {
      event.preventDefault();
    });
  });
});
