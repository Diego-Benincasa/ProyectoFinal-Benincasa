let pesadas = JSON.parse(localStorage.getItem("pesadas")) || [];

const form = document.getElementById("formPesada");
const inputMatricula = document.getElementById("matricula");
const inputTara = document.getElementById("tara");
const inputBruto = document.getElementById("bruto");

form.addEventListener("submit", function (event) {
  event.preventDefault();

  const matricula = (inputMatricula.value || "").trim();
  const tara = Number(inputTara.value);
  const bruto = Number(inputBruto.value);

  if (!matricula || Number.isNaN(tara) || Number.isNaN(bruto)) {
    Toastify({
      text: "Completa los campos primero!",
      duration: 3000,
      gravity: "top",
      position: "right",
      backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
    }).showToast();
    return;
  }

  const nuevaPesada = new Pesada(matricula, tara, bruto);
  pesadas.push(nuevaPesada);

  localStorage.setItem("pesadas", JSON.stringify(pesadas));

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

class Pesada {
  constructor(matricula, tara, bruto) {
    this.matricula = matricula;
    this.tara = Number(tara);
    this.bruto = Number(bruto);
    this.neto = this.bruto - this.tara;
    this.fecha = new Date().toLocaleString();
  }
}

function actualizarTabla() {
  const tbody = document.getElementById("tablaPesadas");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (pesadas.length === 0) {
    tbody.innerHTML = `
      <tr><td colspan="7" style="text-align:center;">Sin registros</td></tr>
    `;
    return;
  }

  pesadas.forEach((p, i) => {
    const fila = `
      <tr>
        <td>${i + 1}</td>
        <td>${p.matricula}</td>
        <td>${p.tara}</td>
        <td>${p.bruto}</td>
        <td>${p.neto}</td>
        <td>${p.fecha}</td>
        <td>
          <button type="button" onclick="borrarPesada(${i})">Eliminar</button>
        </td>
      </tr>
    `;
    tbody.innerHTML += fila;
  });
}

function borrarPesada(indice) {
  if (indice < 0 || indice >= pesadas.length) return;

  if (confirm("Borrar la pesada seleccionada?")) {
    const borrada = pesadas[indice];
    pesadas.splice(indice, 1);
    localStorage.setItem("pesadas", JSON.stringify(pesadas));
    actualizarTabla();

    Toastify({
      text: `Eliminaste la pesada #${indice + 1} (${borrada.matricula})`,
      duration: 3000,
      gravity: "top",
      position: "right",
      backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
    }).showToast();
  }
}

function borrarPesadas() {
  if (pesadas.length === 0) return;

  if (confirm("Borrar todo el registro?")) {
    pesadas = [];
    localStorage.removeItem("pesadas");
    actualizarTabla();

    Toastify({
      text: "Todos los registros han sido eliminados",
      duration: 3000,
      gravity: "top",
      position: "right",
      backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
    }).showToast();
  }
}

function mostrarFiltradas(minimo) {
  const tbody = document.getElementById("tablaPesadas");
  if (!tbody) return;

  const filtradas = pesadas.filter((p) => p.neto >= minimo);
  tbody.innerHTML = "";

  if (filtradas.length === 0) {
    tbody.innerHTML = `
      <tr><td colspan="6" style="text-align:center;">Sin resultados</td></tr>
    `;
    return;
  }

  filtradas.forEach((p, i) => {
    const fila = `
      <tr>
        <td>${i + 1}</td>
        <td>${p.matricula}</td>
        <td>${p.tara}</td>
        <td>${p.bruto}</td>
        <td>${p.neto}</td>
        <td>${p.fecha}</td>
      </tr>
    `;
    tbody.innerHTML += fila;
  });
}

window.onload = function () {
  actualizarTabla();
};
