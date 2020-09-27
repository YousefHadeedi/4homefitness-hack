$(document).ready(function(){
    var timer;
    var minute = 15
    var seconds = minute * 60
    var textSec = "00"
    var minuteBlock = document.getElementsByClassName('timerMin');
    Array.prototype.map.call(minuteBlock, function(e,i){
        e.innerHTML = minute
    })
    var secondBlock = document.getElementsByClassName("timerSec");
    Array.prototype.map.call(secondBlock, function(e,i){
        e.innerHTML = '00'
    })

    function startTimer(){
        var statSec = 60
        timer = setInterval(function(){
            seconds--;
            if(statSec != 0)
                statSec--
            else
                statSec = 59

            if(statSec < 10)
                textSec = '0' + statSec
            else
                textSec = statSec

            // minuteBlock.innerHTML
            Array.prototype.map.call(minuteBlock, function(e,i){
                e.innerHTML = Math.floor(seconds/60);
            })
            Array.prototype.map.call(secondBlock, function(e,i){
                e.innerHTML = textSec;
            })

            if(seconds == 0)
                clearInterval(timer)
        }, 1000)
    }


    var $element = $('.timer-block');
    let counter = 0;
    $(window).scroll(function() {
        if ($element.length === 0) {
            return;
        }

        var scroll = $(window).scrollTop() + $(window).height();
        var offset = $element.offset().top
        var blockOut = $element.offset().top + $(window).height() + $('.timer-block').height();

        if (scroll > offset && counter == 0) {
            startTimer()
            counter = 1;
        }
        if (scroll > blockOut) {
            $('.timer-panel').addClass('show');
            $('.pay-page').addClass('timer-active');
        }
    });


    // Header timer
    var timerHeader;
    var minuteHeader = 10
    var secondsHeader = minuteHeader * 60
    var textSecHeader = "00"
    var minuteBlockHeader = document.getElementsByClassName('timerMinHeader');
    Array.prototype.map.call(minuteBlockHeader, function(e,i){
        e.innerHTML = minuteHeader
    })
    var secondBlockHeader = document.getElementsByClassName("timerSecHeader");
    Array.prototype.map.call(secondBlockHeader, function(e,i){
        e.innerHTML = '00'
    })

    function startTimerHeader(){
        var statSec = 60
        timerHeader = setInterval(function(){
            secondsHeader--;
            if(statSec != 0)
                statSec--
            else
                statSec = 59

            if(statSec < 10)
                textSecHeader = '0' + statSec
            else
                textSecHeader = statSec

            // minuteBlock.innerHTML
            Array.prototype.map.call(minuteBlockHeader, function(e,i){
                e.innerHTML = Math.floor(secondsHeader/60);
            })
            Array.prototype.map.call(secondBlockHeader, function(e,i){
                e.innerHTML = textSecHeader;
            })

            if(secondsHeader == 0)
                clearInterval(timerHeader)
        }, 1000)
    }

    // TODO: Start function when paymentStep '.timer-onload' is visible (replace to onbording.js)
    if (document.querySelector('.timer-onload').hasAttribute('class')) {
        startTimerHeader();
    }

    // Popup show/hidden
    $('.btn-payment-popup').click(function () {
        $('.popup-payment').removeClass('hidden');
    })


    $('.btn-popup-close, .popup-overlay').click(function () {
        $(this).closest('.popup').addClass('hidden');
        if ($(this).hasClass('btn-exit')){
            $('.special_offer').css('display', 'block');
            $('.paymentProdappStep').css('display', 'none');
            $('.popup-exitPopUp').removeClass('hidden');

            fbq('track', 'ExitPopupLoad', {release_date: localStorage.getItem('release_date') || null});
        }
    })

    $('.btn-exit-popup').click(function () {
        $('.popup-exitPopUp').addClass('hidden');
        $('.special_offer_popup').addClass('hidden');
        $('.paymentProdappStep').css('display', 'none');
        $('.prodapp-payment-popup').addClass('hidden');
        $('.special_offer').css('display', 'block');
        window.scroll(0, 0);
    })
});



