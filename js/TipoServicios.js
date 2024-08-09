// Abrir y cerrar el modal para añadir tipo de servicio
const addModal = document.getElementById("addServiceTypeModal");
const addBtn = document.getElementById("addServiceTypeBtn");
const addSpan = document.getElementsByClassName("close")[0];

addBtn.onclick = function() {
    resetAddServiceModal();
    addModal.style.display = "block";
    loadProducts('productsContainer');
}

addSpan.onclick = function() {
    addModal.style.display = "none";
}

window.onclick = function(event) {
    if (event.target == addModal) {
        addModal.style.display = "none";
    }
}

// Abrir y cerrar el modal para editar tipo de servicio
const editModal = document.getElementById("editServiceTypeModal");
const editSpan = document.getElementsByClassName("close-edit")[0];

editSpan.onclick = function() {
    editModal.style.display = "none";
}

window.onclick = function(event) {
    if (event.target == editModal) {
        editModal.style.display = "none";
    }
}

// Función para resetear el modal de añadir tipo de servicio
function resetAddServiceModal() {
    document.getElementById("addServiceTypeForm").reset();
    document.getElementById("productsContainer").innerHTML = '';
}

// Manejar el envío del formulario para añadir tipo de servicio
const addForm = document.getElementById("addServiceTypeForm");
addForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const serviceName = document.getElementById("serviceName").value;
    const products = getSelectedProducts('productsContainer');

    // Validar que al menos un producto esté seleccionado
    if (Object.keys(products).length === 0) {
        alert("Debe seleccionar al menos un producto.");
        return;
    }

    // Añadir el tipo de servicio a Firestore
    db.collection("serviceTypes").add({
        name: serviceName,
        products: products
    }).then((docRef) => {
        // Añadir el tipo de servicio a la tabla
        addServiceTypeToTable(docRef.id, serviceName, products);
        // Cerrar el modal
        addModal.style.display = "none";
    }).catch((error) => {
        console.error("Error al añadir el tipo de servicio: ", error);
    });
});

// Manejar el envío del formulario para editar tipo de servicio
const editForm = document.getElementById("editServiceTypeForm");
editForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const id = document.getElementById("editServiceTypeId").value;
    const serviceName = document.getElementById("editServiceName").value;
    const products = getSelectedProducts('editProductsContainer');

    // Validar que al menos un producto esté seleccionado
    if (Object.keys(products).length === 0) {
        alert("Debe seleccionar al menos un producto.");
        return;
    }

    // Actualizar el tipo de servicio en Firestore
    db.collection("serviceTypes").doc(id).update({
        name: serviceName,
        products: products
    }).then(() => {
        // Actualizar la fila en la tabla
        updateTableRow(id, serviceName, products);
        // Cerrar el modal
        editModal.style.display = "none";
    }).catch((error) => {
        console.error("Error al actualizar el tipo de servicio: ", error);
    });
});

// Función para añadir un tipo de servicio a la tabla
function addServiceTypeToTable(id, serviceName, products) {
    const table = document.getElementById("serviceTypesTable").getElementsByTagName("tbody")[0];
    const newRow = table.insertRow();
    newRow.setAttribute('data-id', id); // Añade el ID del tipo de servicio como un atributo de datos
    newRow.insertCell(0).innerText = table.rows.length;
    newRow.insertCell(1).innerText = serviceName;
    newRow.insertCell(2).innerHTML = getProductKeysHtml(products);
    newRow.insertCell(3).innerHTML = getProductQuantitiesHtml(products);
    const actionsCell = newRow.insertCell(4);

    // Botón Editar
    const editButton = document.createElement('button');
    editButton.className = 'btn-edit';
    const editIcon = document.createElement('span');
    editIcon.className = 'material-icons-outlined';
    editIcon.innerText = 'edit';
    editButton.appendChild(editIcon);
    editButton.addEventListener('click', function() {
        openEditModal(id, serviceName, products);
    });
    actionsCell.appendChild(editButton);

    // Botón Eliminar
    const deleteButton = document.createElement('button');
    deleteButton.className = 'btn-delete';
    const deleteIcon = document.createElement('span');
    deleteIcon.className = 'material-icons-outlined';
    deleteIcon.innerText = 'delete';
    deleteButton.appendChild(deleteIcon);
    deleteButton.addEventListener('click', function() {
        deleteServiceType(id, newRow);
    });
    actionsCell.appendChild(deleteButton);
}

// Función para abrir el modal de edición con la información actual
function openEditModal(id, serviceName, products) {
    document.getElementById("editServiceTypeId").value = id;
    document.getElementById("editServiceName").value = serviceName;
    loadProducts('editProductsContainer', products);
    editModal.style.display = "block";
}

// Función para eliminar un tipo de servicio
function deleteServiceType(id, row) {
    if (confirm("¿Estás seguro de que quieres eliminar este tipo de servicio?")) {
        db.collection("serviceTypes").doc(id).delete().then(() => {
            row.remove(); // Elimina la fila de la tabla
            console.log("Tipo de servicio eliminado con éxito");
        }).catch((error) => {
            console.error("Error al eliminar el tipo de servicio: ", error);
        });
    }
}

// Cargar los tipos de servicios de Firebase Firestore y mostrarlos en la tabla
function loadServiceTypes() {
    db.collection("serviceTypes").get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                const serviceType = doc.data();
                addServiceTypeToTable(doc.id, serviceType.name, serviceType.products); // Pasa el ID del documento
            });
        })
        .catch((error) => {
            console.error("Error al obtener los tipos de servicios: ", error);
        });
}

// Función para cargar los productos de Firebase Firestore y mostrarlos en el modal
function loadProducts(containerId, selectedProducts = {}) {
    const container = document.getElementById(containerId);
    container.innerHTML = ''; // Limpiar contenedor

    const productTitles = document.createElement('div');
    productTitles.className = 'product-titles';

    db.collection("products").get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            const product = doc.data();
            const productId = doc.id;

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `${containerId}_${productId}`;
            checkbox.value = productId;
            if (selectedProducts[productId]) {
                checkbox.checked = true;
            }

            const label = document.createElement('label');
            label.htmlFor = `${containerId}_${productId}`;
            label.innerText = product.key; // Mostrar solo la clave del producto

            const quantityInput = document.createElement('input');
            quantityInput.type = 'number';
            quantityInput.min = '0'; // Permitir valores mayores o iguales a 0
            quantityInput.value = selectedProducts[productId] ? selectedProducts[productId].quantity : 1; // Valor inicial 1
            quantityInput.required = checkbox.checked; // Requerido si el producto está seleccionado

            const div = document.createElement('div');
            div.className = 'product-item';
            div.appendChild(checkbox);
            div.appendChild(label);
            div.appendChild(quantityInput);

            container.appendChild(div);
        });
    }).catch((error) => {
        console.error("Error al obtener los productos: ", error);
    });
}

// Función para obtener los productos seleccionados y sus cantidades
function getSelectedProducts(containerId) {
    const container = document.getElementById(containerId);
    const productItems = container.getElementsByClassName('product-item');
    const selectedProducts = {};

    for (const item of productItems) {
        const checkbox = item.querySelector('input[type="checkbox"]');
        const quantityInput = item.querySelector('input[type="number"]');

        if (checkbox.checked) {
            selectedProducts[checkbox.value] = {
                key: item.querySelector('label').innerText,
                quantity: parseInt(quantityInput.value, 10)
            };
        }
    }

    return selectedProducts;
}

// Función para generar el HTML de la lista de claves de productos seleccionados
function getProductKeysHtml(products) {
    return Object.values(products).map(product => {
        return `${product.key}`;
    }).join('<br>');
}

// Función para generar el HTML de la lista de cantidades de productos seleccionados
function getProductQuantitiesHtml(products) {
    return Object.values(products).map(product => {
        return `${product.quantity}`;
    }).join('<br>');
}

// Función para actualizar una fila en la tabla
function updateTableRow(id, serviceName, products) {
    const row = document.querySelector(`tr[data-id='${id}']`);
    row.cells[1].innerText = serviceName;
    row.cells[2].innerHTML = getProductKeysHtml(products);
    row.cells[3].innerHTML = getProductQuantitiesHtml(products);
}

// Cargar los tipos de servicios al cargar la página
window.onload = function() {
    loadServiceTypes();
};
