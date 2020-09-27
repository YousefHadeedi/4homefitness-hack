$(document).ready(function () {
    let getParameters = (new URL(window.location)).searchParams;
    let $startNowBtn = $('.start-now-btn');

    $startNowBtn.attr('href', $startNowBtn.attr('href') + '?' + getParameters.toString());
})