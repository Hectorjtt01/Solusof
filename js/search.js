
document.addEventListener("DOMContentLoaded", function() {
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
      searchInput.addEventListener("input", function() {
        const filter = searchInput.value.toLowerCase();
        filterTable(filter);
      });
    }
  });
  
  function filterTable(filter) {
    const tables = document.querySelectorAll("table");
    tables.forEach(table => {
      const rows = table.getElementsByTagName("tr");
      for (let i = 1; i < rows.length; i++) { // Empezar en 1 para saltar el encabezado de la tabla
        let cells = rows[i].getElementsByTagName("td");
        let match = false;
        for (let j = 0; j < cells.length; j++) {
          if (cells[j]) {
            let cellValue = cells[j].textContent || cells[j].innerText;
            if (cellValue.toLowerCase().indexOf(filter) > -1) {
              match = true;
              break;
            }
          }
        }
        if (match) {
          rows[i].style.display = "";
        } else {
          rows[i].style.display = "none";
        }
      }
    });
  }
  