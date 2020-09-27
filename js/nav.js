$(document).ready(function(){

    // main burger menu
    $('.btn-burger').click(function () {
        $(this).toggleClass('active');
        $('body').toggleClass('page-nav-active');
    })

    $('.nav-overlay').click(function () {
        $('.btn-burger').removeClass('active');
        $('body').removeClass('page-nav-active');
    })

    // tab nav
    $('.tab-nav').on('click', 'button:not(.active)', function () {
        $(this)
            .addClass('active').siblings().removeClass('active')
            .closest('.tab-container').find('.tab-content').removeClass('active').eq($(this).index()).addClass('active');
    });

    $(document).ready(function() {

        $('.toggle-password').on('click', function() {

            if ($('.password-control').attr('password-shown') == 'false') {
                $('.toggle-password').removeClass('active');
                $('.password-control').removeAttr('type');
                $('.password-control').attr('type', 'text');

                $('.password-control').removeAttr('password-shown');
                $('.password-control').attr('password-shown', 'true');


            }else {
                $('.toggle-password').addClass('active');
                $('.password-control').removeAttr('type');
                $('.password-control').attr('type', 'password');

                $('.password-control').removeAttr('password-shown');
                $('.password-control').attr('password-shown', 'false');

            }

        });

    });

});



