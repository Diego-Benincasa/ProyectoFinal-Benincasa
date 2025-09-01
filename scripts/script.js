let pesadas = JSON.parse(localStorage.getItem("pesadas")) || [];

document
  .getElementById("formPesada")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    let matricula = document.getElementById("matricula").value;
    let tara = parseInt(document.getElementById("tara").value);
    let bruto = parseInt(document.getElementById("bruto").value);
    let neto = bruto - tara;
    let fecha = new Date().toLocaleString();

    let nuevaPesada = { matricula, tara, bruto, neto, fecha };

    pesadas.push(nuevaPesada);

    localStorage.setItem("pesadas", JSON.stringify(pesadas));

    actualizarTabla();

    document.getElementById("formPesada").reset();
  });

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
  if (confirm("Borrar la pesada?")) {
    pesadas.splice(indice, 1);
    localStorage.setItem("pesadas", JSON.stringify(pesadas));
    actualizarTabla();
  }
}

