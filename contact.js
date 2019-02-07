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