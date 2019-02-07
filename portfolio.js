$('.grid').isotope({
    itemSelector: '.grid-item',
    percentPosition: true,
    masonry: {
        columnWidth: '.grid-sizer',
        gutter: '.gutter-sizer'
    }
    
});
$('.filters-button-group').on( 'click', '.button', function() {
    var filterValue = $( this ).attr('data-filter');
    $('.grid').isotope({ filter: filterValue });
    $('.button').removeClass('is-checked');
    $(this).addClass('is-checked');
});
document.addEventListener("scroll", scrollFunction);
var header = document.getElementById('header');
function scrollFunction(){
   if (document.body.scrollTop > 10 || document.documentElement.scrollTop > 10){
       header.style.borderBottom = "none";
    }
    else if (document.body.scrollTop < 10 || document.documentElement.scrollTop < 10){
        header.style.borderBottom = "1px solid rgb(34, 31, 31, .1)";
    } 
}