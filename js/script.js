//set animation timing
let animationDelay = 2500,
  //loading bar effect
  barAnimationDelay = 3800,
  barWaiting = barAnimationDelay - 3000, //3000 is the duration of the transition on the loading bar - set in the scss/css file
  //letters effect
  lettersDelay = 50,
  //type effect
  typeLettersDelay = 150,
  selectionDuration = 500,
  typeAnimationDelay = selectionDuration + 800,
  //clip effect
  revealDuration = 600,
  revealAnimationDelay = 1500;
  

function singleLetters($words) {
  $words.each(function() {
    let word = $(this),
      letters = word.text().split(""),
      selected = word.hasClass("is-visible");
    for (i in letters) {
      if (word.parents(".rotate-2").length > 0)
        letters[i] = "<em>" + letters[i] + "</em>";
      letters[i] = selected
        ? '<i class="in">' + letters[i] + "</i>"
        : "<i>" + letters[i] + "</i>";
    }
    let newLetters = letters.join("");
    word.html(newLetters).css("opacity", 1);
  });
}

function animateHeadline($headlines) {
  let duration = animationDelay;
  $headlines.each(function() {
    let headline = $(this);

    if (headline.hasClass("loading-bar")) {
      duration = barAnimationDelay;
      setTimeout(function() {
        headline.find(".cd-words-wrapper").addClass("is-loading");
      }, barWaiting);
    } else if (headline.hasClass("clip")) {
      let spanWrapper = headline.find(".cd-words-wrapper"),
        newWidth = spanWrapper.width() + 10;
      spanWrapper.css("width", newWidth);
    } else if (!headline.hasClass("type")) {
      //assign to .cd-words-wrapper the width of its longest word
      let words = headline.find(".cd-words-wrapper b"),
        width = 0;
      words.each(function() {
        let wordWidth = $(this).width();
        if (wordWidth > width) width = wordWidth;
      });
      headline.find(".cd-words-wrapper").css("width", width);
    }

    //trigger animation
    setTimeout(function() {
      hideWord(headline.find(".is-visible").eq(0));
    }, duration);
  });
}

function hideWord($word) {
  let nextWord = takeNext($word);

  if ($word.parents(".cd-headline").hasClass("type")) {
    let parentSpan = $word.parent(".cd-words-wrapper");
    parentSpan.addClass("selected").removeClass("waiting");
    setTimeout(function() {
      parentSpan.removeClass("selected");
      $word
        .removeClass("is-visible")
        .addClass("is-hidden")
        .children("i")
        .removeClass("in")
        .addClass("out");
    }, selectionDuration);
    setTimeout(function() {
      showWord(nextWord, typeLettersDelay);
    }, typeAnimationDelay);
  } else if ($word.parents(".cd-headline").hasClass("letters")) {
    let bool =
      $word.children("i").length >= nextWord.children("i").length
        ? true
        : false;
    hideLetter($word.find("i").eq(0), $word, bool, lettersDelay);
    showLetter(nextWord.find("i").eq(0), nextWord, bool, lettersDelay);
  } else if ($word.parents(".cd-headline").hasClass("clip")) {
    $word
      .parents(".cd-words-wrapper")
      .animate({ width: "2px" }, revealDuration, function() {
        switchWord($word, nextWord);
        showWord(nextWord);
      });
  } else if ($word.parents(".cd-headline").hasClass("loading-bar")) {
    $word.parents(".cd-words-wrapper").removeClass("is-loading");
    switchWord($word, nextWord);
    setTimeout(function() {
      hideWord(nextWord);
    }, barAnimationDelay);
    setTimeout(function() {
      $word.parents(".cd-words-wrapper").addClass("is-loading");
    }, barWaiting);
  } else {
    switchWord($word, nextWord);
    setTimeout(function() {
      hideWord(nextWord);
    }, animationDelay);
  }
}

function showWord($word, $duration) {
  if ($word.parents(".cd-headline").hasClass("type")) {
    showLetter($word.find("i").eq(0), $word, false, $duration);
    $word.addClass("is-visible").removeClass("is-hidden");
  } else if ($word.parents(".cd-headline").hasClass("clip")) {
    $word
      .parents(".cd-words-wrapper")
      .animate({ width: $word.width() + 10 }, revealDuration, function() {
        setTimeout(function() {
          hideWord($word);
        }, revealAnimationDelay);
      });
  }
}

function hideLetter($letter, $word, $bool, $duration) {
  $letter.removeClass("in").addClass("out");

  if (!$letter.is(":last-child")) {
    setTimeout(function() {
      hideLetter($letter.next(), $word, $bool, $duration);
    }, $duration);
  } else if ($bool) {
    setTimeout(function() {
      hideWord(takeNext($word));
    }, animationDelay);
  }

  if ($letter.is(":last-child") && $("html").hasClass("no-csstransitions")) {
    let nextWord = takeNext($word);
    switchWord($word, nextWord);
  }
}

function showLetter($letter, $word, $bool, $duration) {
  $letter.addClass("in").removeClass("out");

  if (!$letter.is(":last-child")) {
    setTimeout(function() {
      showLetter($letter.next(), $word, $bool, $duration);
    }, $duration);
  } else {
    if ($word.parents(".cd-headline").hasClass("type")) {
      setTimeout(function() {
        $word.parents(".cd-words-wrapper").addClass("waiting");
      }, 200);
    }
    if (!$bool) {
      setTimeout(function() {
        hideWord($word);
      }, animationDelay);
    }
  }
}

function takeNext($word) {
  return !$word.is(":last-child")
    ? $word.next()
    : $word
        .parent()
        .children()
        .eq(0);
}

function takePrev($word) {
  return !$word.is(":first-child")
    ? $word.prev()
    : $word
        .parent()
        .children()
        .last();
}

function switchWord($oldWord, $newWord) {
  $oldWord.removeClass("is-visible").addClass("is-hidden");
  $newWord.removeClass("is-hidden").addClass("is-visible");
}

function initHeadline() {
  //insert <i> element for each letter of a changing word
  singleLetters($(".cd-headline.letters").find("b"));
  //initialise headline animation
  animateHeadline($(".cd-headline"));
}

jQuery(document).ready(() => {
  
  initHeadline();
  initTeamCarousel();
  initSponsorsCarousel();

  jQuery("div#panorama").paver({
    mouseSmoothingFunction: "cosine",
    tiltSmoothingFunction: "cosine",
    tiltThresholdPortrait: 115,
    gracefulFailure: false,
    gyroscopeThrottle: 1000 / 200,
    cursorThrottle: 1000 / 200,
    tiltSensitivity: 0.1
  });

  // check whether Paver has been enabler/disable
  jQuery(document)
    .on("enabled.paver", () => {
      // do nothing
    })
    .on("disabled.paver", () => {
      // Fallback
      jQuery("img#panorama-img").css({ position: "absolute" });
    });

  //trigger the animation - open modal window
  jQuery('[data-type="modal-trigger"]').on("click", function() {
    let actionBtn = jQuery(this),
      scaleValue = retrieveScale(actionBtn.next(".cd-modal-bg"));

    actionBtn.addClass("to-circle");
    actionBtn
      .next(".cd-modal-bg")
      .addClass("is-visible")
      .one(
        "webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend",
        function() {
          animateLayer(actionBtn.next(".cd-modal-bg"), scaleValue, true);
        }
      );

    //if browser doesn't support transitions...
    if (actionBtn.parents(".no-csstransitions").length > 0)
      animateLayer(actionBtn.next(".cd-modal-bg"), scaleValue, true);
  });
  jQuery(document).keyup(function(event) {
    if (event.which == "27") closeModal();
  });

  jQuery(window).on("resize", function() {
    //on window resize - update cover layer dimention and position
    if (jQuery(".cd-section.modal-is-visible").length > 0)
      window.requestAnimationFrame(updateLayer);
  });
});

/**
 * Initiates team carousel with options
 */
function initTeamCarousel() {
  let mySwiper = new Swiper(".team-carousel", {
    loop: true,
    autoplay: 2000,

    slidesPerView: "auto",
    watchSlidesVisibility: true,
    
    // Navigation arrows
    nextButton: ".swiper-button-next",
    prevButton: ".swiper-button-prev",

    breakpoints: {
      575: {
        slidesPerView: 1
      }
    }
  });
}

/**
 * Initiates sponsors carousel with options
 */
function initSponsorsCarousel() {
  let mySwiper = new Swiper(".sponsors-carousel", {
    loop: true,
    autoplay: 2000,

    slidesPerView: "auto",
    watchSlidesVisibility: true,

    // Navigation arrows
    nextButton: ".swiper-button-next-2",
    prevButton: ".swiper-button-prev-2",

    breakpoints: {
      575: {
        slidesPerView: 1
      }
    }
  });
}

function retrieveScale(btn) {
  let btnRadius = btn.width() / 2,
    left = btn.offset().left + btnRadius,
    top = btn.offset().top + btnRadius - jQuery(window).scrollTop(),
    scale = scaleValue(
      top,
      left,
      btnRadius,
      jQuery(window).height(),
      jQuery(window).width()
    );

  btn.css("position", "fixed").velocity(
    {
      top: top - btnRadius,
      left: left - btnRadius,
      translateX: 0
    },
    0
  );

  return scale;
}

function scaleValue(topValue, leftValue, radiusValue, windowW, windowH) {
  let maxDistHor = leftValue > windowW / 2 ? leftValue : windowW - leftValue,
    maxDistVert = topValue > windowH / 2 ? topValue : windowH - topValue;
  return Math.ceil(
    Math.sqrt(Math.pow(maxDistHor, 2) + Math.pow(maxDistVert, 2)) / radiusValue
  );
}

function animateLayer(layer, scaleVal, bool) {
  layer.velocity({ scale: scaleVal }, 400, function() {
    jQuery("body").toggleClass("overflow-hidden", bool);
    bool
      ? layer
          .parents(".cd-section")
          .addClass("modal-is-visible")
          .end()
          .off(
            "webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend"
          )
      : layer
          .removeClass("is-visible")
          .removeAttr("style")
          .siblings('[data-type="modal-trigger"]')
          .removeClass("to-circle");
  });
}

function updateLayer() {
  let layer = jQuery(".cd-section.modal-is-visible").find(".cd-modal-bg"),
    layerRadius = layer.width() / 2,
    layerTop =
      layer.siblings(".btn").offset().top +
      layerRadius -
      jQuery(window).scrollTop(),
    layerLeft = layer.siblings(".btn").offset().left + layerRadius,
    scale = scaleValue(
      layerTop,
      layerLeft,
      layerRadius,
      jQuery(window).height(),
      jQuery(window).width()
    );

  layer.velocity(
    {
      top: layerTop - layerRadius,
      left: layerLeft - layerRadius,
      scale: scale
    },
    0
  );
}

function closeModal() {
  let section = jQuery(".cd-section.modal-is-visible");
  section
    .removeClass("modal-is-visible")
    .one(
      "webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend",
      function() {
        animateLayer(section.find(".cd-modal-bg"), 1, false);
      }
    );
  //if browser doesn't support transitions...
  if (section.parents(".no-csstransitions").length > 0)
    animateLayer(section.find(".cd-modal-bg"), 1, false);
}
