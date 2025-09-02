let pesadas = JSON.parse(localStorage.getItem("pesadas")) || [];

document
  .getElementById("formPesada")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    let matricula = document.getElementById("matricula").value;
    let tara = document.getElementById("tara").value;
    let bruto = document.getElementById("bruto").value;

    let nuevaPesada = new Pesada(matricula, tara, bruto);
    pesadas.push(nuevaPesada);

    localStorage.setItem("pesadas", JSON.stringify(pesadas));

    actualizarTabla();

    document.getElementById("formPesada").reset();
  });

class Pesada {
  constructor(matricula, tara, bruto) {
    this.matricula = matricula;
    this.tara = parseInt(tara);
    this.bruto = parseInt(bruto);
    this.neto = this.bruto - this.tara;
    this.fecha = new Date().toLocaleString();
  }
}

function actualizarTabla() {
  let tbody = document.getElementById("tablaPesadas");
  tbody.innerHTML = "";

  pesadas.forEach((p, i) => {
    let fila = `
      <tr>
        <td>${i + 1}</td>
        <td>${p.matricula}</td>
        <td>${p.tara}</td>
        <td>${p.bruto}</td>
        <td>${p.neto}</td>
        <td>${p.fecha}</td>
        <td>
          <button onclick="borrarPesada(${i})">Eliminar</button>
        </td>
      </tr>
    `;
    tbody.innerHTML += fila;
  });
}

function borrarPesada(indice) {
  if (confirm("¿Borrar la pesada seleccionada?")) {
    pesadas.splice(indice, 1);
    localStorage.setItem("pesadas", JSON.stringify(pesadas));
    actualizarTabla();
  }
}

function borrarPesadas() {
  if (confirm("¿Borrar todo el registro?")) {
    pesadas = [];
    localStorage.removeItem("pesadas");
    actualizarTabla();
    alert("Todos los registros han sido eliminados");
  }
}

function mostrarFiltradas(minimo) {
  let filtradas = pesadas.filter((p) => p.neto >= minimo);

  let tbody = document.getElementById("tablaPesadas");
  tbody.innerHTML = "";

  filtradas.forEach((p, i) => {
    let fila = `
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
