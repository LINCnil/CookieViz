/* When the user clicks on the button,
toggle between hiding and showing the dropdown content */
function openDropdown(id) {
    // Show content
    const dropdowns = document.getElementsByClassName("dropdown-content");
    for (const dropdown of dropdowns){
      if (dropdown.id == "dropdown-"+id) dropdown.classList.toggle("show"); 
      else if (dropdown.classList.contains('show')) dropdown.classList.remove('show');
    };

    // Active button
    const buttons = document.getElementsByClassName("dropbtn");
    for (const button of buttons){
      if (button.id == id) button.classList.toggle("active"); 
      else if (button.classList.contains('active')) button.classList.remove('active');
    };
}

function closeDropdown(elt) {
  var dropdowns = document.getElementsByClassName("dropdown-content");
  var i;
  
  // Close content
  for (const openDropdown of dropdowns){
    if (openDropdown.classList.contains('show')) {
      openDropdown.classList.remove('show');
    }
  }

  // Close buttons
  const buttons = document.getElementsByClassName("dropbtn");
  for (const button of buttons){
    if (button.classList.contains('active')) button.classList.remove('active');
  };
  if (elt){
    elt.removeEventListener("click", closeDropdown);
  }
}

function createDropdownElt(menu_id, content, event_menu, id, title, ngclick){
  menu_elt = document.getElementById(menu_id);

  // Create separator if required
  if (menu_elt.childElementCount > 1){
      var div = document.createElement("div");
      div.class = "separator";
      menu_elt.appendChild(div);
  } 

  // Create new menu element
  var a = document.createElement("a");
  a.href = "#";
  if(id) a.id = id;
  if(content) a.textContent = content;
  if(title) a.title = title;
  if(ngclick) a.setAttribute("ng-click", ngclick);
  if(event_menu) a.addEventListener ("click", event_menu);
  
  menu_elt.appendChild(a);
}
