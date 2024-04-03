const sidebar = document.querySelector('.sidebar');
const arrow = document.createElement('div');
arrow.classList.add('arrow');
arrow.innerHTML = '>'; 

document.body.appendChild(arrow);

window.addEventListener('resize', function() {
  resetSidebar();
});


function resetSidebar() {
  const newWidth = window.innerWidth;
  
  if (newWidth < 680) {
    sidebar.style.width = "0";
    arrow.style.left = "0"
    arrow.textContent = '>';
  } 
  else {
    sidebar.style.cssText = "";
  }
}


// JavaScript to handle arrow click and toggle sidebar visibility
document.addEventListener('DOMContentLoaded', function () {

  // Toggle sidebar visibility on arrow click
  arrow.addEventListener('click', function () {
    sidebar.style.width = sidebar.style.width === '0px' ? '130px' : '0px';
    arrow.style.left = arrow.style.left === '0px' ? '130px' : '0px';
    arrow.textContent = arrow.textContent === '>' ? '<' : '>';
  });
  resetSidebar();

});

