$(document).ready(function(){
    var owl = $('.owl-carousel');
    owl.owlCarousel({
        nav: true,
        margin: 10,
        items: 1,
        smartSpeed: 800,
        slideTransition: 'ease'
    });
    $('.owl-dot').each(function(){
        $(this).children('span').text($(this).index()+1);
    });
    owl.on('mousewheel', '.owl-stage', function (e) {
        if (e.originalEvent.deltaY > 80) {
            owl.trigger('next.owl');
        } else {
            owl.trigger('prev.owl');
        }
        e.preventDefault();
    });
    $('.owl-dot').each(function(e){
        $(this).children('span').text(('0' + (e + 1)).slice(-2))
    });
});
function openNav() {
    document.getElementById("mySidenav").style.width = "300px";
    document.getElementsByClassName("openbtn")[0].style.visibility = "hidden";
}

function closeNav() {
  document.getElementById("mySidenav").style.width = "0";
    document.getElementsByClassName("openbtn")[0].style.visibility = "visible";
}