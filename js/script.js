/**
 * inicializa el array "pesadas" leyendo desde localStorage
 * Si los datos guardados existen y son validos, los carga.
 * Si no existen o están corruptos, arranca con un array vacío
 * y limpia la clave "pesadas" en localStorage.
 */
let pesadas;
try {
  pesadas = JSON.parse(localStorage.getItem("pesadas")) || [];
} catch (e) {
  pesadas = [];
  localStorage.removeItem("pesadas");
}

// guardamos en variables los elementos del DOM para usarlos mas tarde
const form = document.getElementById("formPesada");
const inputMatricula = document.getElementById("matricula");
const inputTara = document.getElementById("tara");
const inputBruto = document.getElementById("bruto");
const tbody = document.getElementById("tablaPesadas");

/**
 * Capturamos el evento de enviar formulario y usamos preventDefault()
 * para que no se recargue la pagina. Validamos y guardamos la pesada nueva.
 */
form.addEventListener("submit", function (event) {
  event.preventDefault();

  // lee y prepara los valores ingresados
  const matricula = (inputMatricula.value || "").trim();
  const tara = Number(inputTara.value);
  const bruto = Number(inputBruto.value);

  // validaciones basicas
  if (!matricula || Number.isNaN(tara) || Number.isNaN(bruto)) {
    Swal.fire({
      icon: "warning",
      title: "Campos incompletos",
      text: "Completa los campos primero!",
      confirmButtonColor: "#ff5f6d",
    });
    return;
  }

  // validacion adicional: tara no puede ser mayor que bruto
  if (tara > bruto) {
    Swal.fire({
      icon: "error",
      title: "Valores incorrectos",
      text: "La tara no puede ser mayor que el bruto.",
    });
    return;
  }

  // crea nueva pesada, la agrega al array y guarda en localStorage
  const nuevaPesada = new Pesada(matricula, tara, bruto);
  pesadas.push(nuevaPesada);
  localStorage.setItem("pesadas", JSON.stringify(pesadas));

  // actualiza la vista, limpia el form y notifica
  actualizarTabla();
  form.reset();
  inputMatricula.focus();

  Toastify({
    text: "Pesada registrada!",
    duration: 3000,
    gravity: "top",
    position: "right",
    backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)",
  }).showToast();
});

/**
 * define como se construye cada registro.
 * guarda los datos, calcula automáticamente el neto y asigna fecha/hora.
 */
class Pesada {
  constructor(matricula, tara, bruto) {
    this.matricula = matricula.toUpperCase();
    this.tara = Number(tara);
    this.bruto = Number(bruto);
    this.neto = this.bruto - this.tara;
    this.fecha = new Date().toLocaleString();
  }
}

/**
 * vaciamos la tabla y la volvemos a llenar con los datos del array.
 * construimos un string con todas las filas y lo asignamos una sola vez.
 * los botones usan atributos data-index para que la delegación los maneje.
 */
function actualizarTabla() {
  if (!tbody) return;

  if (pesadas.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;">Sin registros</td></tr>`;
    return;
  }

  const filas = pesadas
    .map(
      (p, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${p.matricula}</td>
      <td>${p.tara}</td>
      <td>${p.bruto}</td>
      <td>${p.neto}</td>
      <td>${p.fecha}</td>
      <td><button type="button" class="btn-editar" data-index="${i}">Editar</button></td>
      <td>
        <button type="button" class="btn-borrar" data-index="${i}">Eliminar</button>
      </td>
      
    </tr>`
    )
    .join("");

  tbody.innerHTML = filas;
}

/**
 * borrar una pesada por indice (se usa desde la delegacion de eventos)
 * muestra confirmacion con SweetAlert
 */
function borrarPesada(indice) {
  if (indice < 0 || indice >= pesadas.length) return;

  Swal.fire({
    title: "¿Estás seguro?",
    text: `Se eliminará la pesada #${indice + 1}`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Sí, borrar",
    cancelButtonText: "Cancelar",
  }).then((result) => {
    if (result.isConfirmed) {
      const borrada = pesadas[indice];
      pesadas.splice(indice, 1);
      localStorage.setItem("pesadas", JSON.stringify(pesadas));
      actualizarTabla();

      Swal.fire({
        icon: "success",
        title: "Eliminada",
        text: `Se borró la pesada de ${borrada.matricula}`,
        timer: 2000,
        showConfirmButton: false,
      });
    }
  });
}

/**
 * borrar todas las pesadas (con confirmacion).
 */
function borrarPesadas() {
  if (pesadas.length === 0) return;

  Swal.fire({
    title: "Borrar todos los registros?",
    text: "Esta acción no se puede deshacer",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Sí, borrar todo",
    cancelButtonText: "Cancelar",
  }).then((result) => {
    if (result.isConfirmed) {
      pesadas = [];
      localStorage.removeItem("pesadas");
      actualizarTabla();

      Swal.fire({
        icon: "success",
        title: "Registros eliminados",
        text: "Todos los registros fueron borrados",
        timer: 2000,
        showConfirmButton: false,
      });
    }
  });
}

/**
 * editar una pesada mediante un modal SweetAlert
 * validamos que los campos no esten vacios y que la tara no supere al bruto
 * NO modificamos la fecha original
 */
function editarPesada(indice) {
  if (indice < 0 || indice >= pesadas.length) return;

  const p = pesadas[indice];

  Swal.fire({
    title: `Editar pesada #${indice + 1}`,
    html: `
      <input id="swal-matricula" class="swal2-input" placeholder="Matricula" value="${p.matricula}">
      <input id="swal-tara" class="swal2-input" placeholder="Tara" type="number" value="${p.tara}">
      <input id="swal-bruto" class="swal2-input" placeholder="Bruto" type="number" value="${p.bruto}">
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: "Guardar",
    cancelButtonText: "Cancelar",
    preConfirm: () => {
      const matricula = (
        document.getElementById("swal-matricula").value || ""
      ).trim();
      const taraVal = document.getElementById("swal-tara").value;
      const brutoVal = document.getElementById("swal-bruto").value;

      const tara = Number(taraVal);
      const bruto = Number(brutoVal);

      if (!matricula || Number.isNaN(tara) || Number.isNaN(bruto)) {
        Swal.showValidationMessage("Completa todos los campos correctamente");
        return false;
      }

      if (tara > bruto) {
        Swal.showValidationMessage("La tara no puede ser mayor que el bruto");
        return false;
      }

      return { matricula, tara, bruto };
    },
  }).then((result) => {
    if (result.isConfirmed && result.value) {
      const { matricula, tara, bruto } = result.value;

      pesadas[indice].matricula = matricula;
      pesadas[indice].tara = Number(tara);
      pesadas[indice].bruto = Number(bruto);
      pesadas[indice].neto = Number(bruto) - Number(tara);
      // nota: no tocamos pesadas[indice].fecha para conservar la fecha original

      localStorage.setItem("pesadas", JSON.stringify(pesadas));
      actualizarTabla();

      Swal.fire({
        icon: "success",
        title: "Guardado",
        text: `Pesada #${indice + 1} actualizada.`,
        timer: 1600,
        showConfirmButton: false,
      });
    }
  });
}

/**
 * devuelve las pesadas cuyo neto sea >= minimo.
 * dibuja las filas (sin botones de accion).
 */
function mostrarFiltradas(minimo) {
  if (!tbody) return;

  const filtradas = pesadas.filter((p) => p.neto >= minimo);
  tbody.innerHTML = "";

  if (filtradas.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;">Sin resultados</td></tr>`;
    Swal.fire({
      icon: "info",
      title: "Sin resultados",
      text: `No se encontraron pesadas con neto mayor o igual a ${minimo}`,
    });
    return;
  }

  const filas = filtradas
    .map(
      (p, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${p.matricula}</td>
      <td>${p.tara}</td>
      <td>${p.bruto}</td>
      <td>${p.neto}</td>
      <td>${p.fecha}</td>
      <td><button type="button" class="btn-editar" data-index="${i}">Editar</button></td>
      <td>
        <button type="button" class="btn-borrar" data-index="${i}">Eliminar</button>
      </td>
    </tr>`
    )
    .join("");

  tbody.innerHTML = filas;
}

/**
 * delegacion de eventos para manejar clicks en botones Eliminar y Editar
 * esto evita usar onclick inline y funciona aunque la tabla se vuelva a dibujar
 */
if (tbody) {
  tbody.addEventListener("click", (e) => {
    const btn = e.target;
    const idx = btn.dataset.index;
    if (!idx) return;

    const indice = Number(idx);
    if (btn.classList.contains("btn-borrar")) {
      borrarPesada(indice);
    } else if (btn.classList.contains("btn-editar")) {
      editarPesada(indice);
    }
  });
}

//barra de busqueda

const buscador = document.getElementById("buscador");

buscador.addEventListener("input", function () {
  const texto = buscador.value.toLowerCase();

  // filtramos las pesadas que coincidan con lo buscado
  const filtradas = pesadas.filter((p) =>
    p.matricula.toLowerCase().includes(texto)
  );

  mostrarResultados(filtradas);
});

// función auxiliar para mostrar la tabla con un array dado
function mostrarResultados(lista) {
  if (!tbody) return;

  if (lista.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;">Sin resultados</td></tr>`;
    return;
  }

  const filas = lista
    .map(
      (p, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${p.matricula}</td>
      <td>${p.tara}</td>
      <td>${p.bruto}</td>
      <td>${p.neto}</td>
      <td>${p.fecha}</td>
      <td><button type="button" class="btn-editar" data-index="${i}">Editar</button></td>
      <td><button type="button" class="btn-borrar" data-index="${i}">Eliminar</button></td>
    </tr>`
    )
    .join("");

  tbody.innerHTML = filas;
}
window.onload = function () {
  actualizarTabla();
};
