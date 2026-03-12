

document.addEventListener("DOMContentLoaded", iniciarApp);

function iniciarApp(){

let movimientos = JSON.parse(localStorage.getItem("movimientos")) || [];

configurarPestanas();
configurarFormulario();
configurarExportacion();
render();

function configurarPestanas(){

const botones = document.querySelectorAll(".tab-btn");
const tabs = document.querySelectorAll(".tab");

botones.forEach(function(boton){

boton.addEventListener("click", function(){

botones.forEach(function(b){
b.classList.remove("active");
});

tabs.forEach(function(t){
t.classList.remove("active");
});

boton.classList.add("active");

const id = boton.dataset.tab;
const tab = document.getElementById(id);

if(tab){
tab.classList.add("active");
}

});

});

}

function configurarFormulario(){

const form = document.getElementById("movementForm");

if(!form) return;

form.addEventListener("submit", function(e){

e.preventDefault();

const fecha = document.getElementById("date").value;
const tipo = document.getElementById("type").value;
const concepto = document.getElementById("concept").value;
const categoria = document.getElementById("category").value;
const monto = Number(document.getElementById("amount").value);
const metodo = document.getElementById("payment").value;

if(!fecha || !monto){
alert("Completa fecha y monto");
return;
}

const movimiento = {
date: fecha,
type: tipo,
concept: concepto,
category: categoria,
amount: monto,
payment: metodo
};

movimientos.push(movimiento);

localStorage.setItem("movimientos", JSON.stringify(movimientos));

form.reset();

render();

});

}

function calcularSaldo(){

let saldo = 0;

return movimientos.map(function(m){

if(
m.type === "income" ||
m.type === "loan" ||
m.type === "investment"
){
saldo += m.amount;
}else{
saldo -= m.amount;
}

return {
date: m.date,
type: m.type,
concept: m.concept,
category: m.category,
amount: m.amount,
payment: m.payment,
balance: saldo
};

});

}

function renderTabla(){

const tabla = document.getElementById("movementTable");
if(!tabla) return;

tabla.innerHTML = "";

const lista = calcularSaldo();

lista.forEach(function(m){

const fila = document.createElement("tr");

fila.innerHTML =
"<td>"+m.date+"</td>"+
"<td>"+m.type+"</td>"+
"<td>"+m.concept+"</td>"+
"<td>"+m.category+"</td>"+
"<td>"+m.amount+"</td>"+
"<td>"+m.balance+"</td>";

tabla.appendChild(fila);

});

}

function actualizarDashboard(){

let caja = 0;
let ventas = 0;
let gastos = 0;
let deudas = 0;
let activos = 0;

movimientos.forEach(function(m){

if(m.type === "income"){
caja += m.amount;
ventas += m.amount;
}

if(m.type === "expense"){
caja -= m.amount;
gastos += m.amount;
}

if(m.type === "loan"){
caja += m.amount;
deudas += m.amount;
}

if(m.type === "debtPayment"){
caja -= m.amount;
deudas -= m.amount;
}

if(m.type === "asset"){
caja -= m.amount;
activos += m.amount;
}

if(m.type === "investment"){
caja += m.amount;
}

});

let beneficio = ventas - gastos;

setTexto("cash", caja);
setTexto("sales", ventas);
setTexto("expenses", gastos);
setTexto("profit", beneficio);
setTexto("debts", deudas);
setTexto("assets", activos);

}

function actualizarPL(){

let ingresos = 0;
let costos = 0;
let gastos = 0;

movimientos.forEach(function(m){

if(m.type === "income") ingresos += m.amount;
if(m.type === "asset") costos += m.amount;
if(m.type === "expense") gastos += m.amount;

});

let resultado = ingresos - costos - gastos;

setTexto("plIncome", ingresos);
setTexto("plCost", costos);
setTexto("plExpenses", gastos);
setTexto("plResult", resultado);

}

function actualizarBalance(){

let caja = 0;
let equipos = 0;
let prestamos = 0;
let capital = 0;

movimientos.forEach(function(m){

if(m.type === "income") caja += m.amount;
if(m.type === "expense") caja -= m.amount;

if(m.type === "asset"){
caja -= m.amount;
equipos += m.amount;
}

if(m.type === "loan"){
caja += m.amount;
prestamos += m.amount;
}

if(m.type === "debtPayment"){
caja -= m.amount;
prestamos -= m.amount;
}

if(m.type === "investment"){
caja += m.amount;
capital += m.amount;
}

});

let ingresos = movimientos
.filter(m => m.type === "income")
.reduce((a,b)=>a+b.amount,0);

let gastos = movimientos
.filter(m => m.type === "expense")
.reduce((a,b)=>a+b.amount,0);

let ganancias = ingresos - gastos;

let activos = caja + equipos;
let patrimonio = capital + ganancias;

setTexto("assetCash", caja);
setTexto("assetEquipment", equipos);
setTexto("totalAssets", activos);

setTexto("liabilitiesLoans", prestamos);
setTexto("totalLiabilities", prestamos);

setTexto("equityCapital", capital);
setTexto("equityProfit", ganancias);
setTexto("totalEquity", patrimonio);

}

function actualizarFlujo(){

let entradas = 0;
let salidas = 0;

movimientos.forEach(function(m){

if(
m.type === "income" ||
m.type === "loan" ||
m.type === "investment"
){
entradas += m.amount;
}else{
salidas += m.amount;
}

});

let final = entradas - salidas;

setTexto("cfStart", 0);
setTexto("cfIn", entradas);
setTexto("cfOut", salidas);
setTexto("cfEnd", final);

}

function configurarExportacion(){

const boton = document.getElementById("exportExcel");

if(!boton) return;

boton.addEventListener("click", function(){

let csv = "Fecha,Tipo,Concepto,Categoria,Monto,Metodo\n";

movimientos.forEach(function(m){

csv +=
m.date + "," +
m.type + "," +
m.concept + "," +
m.category + "," +
m.amount + "," +
m.payment + "\n";

});

const blob = new Blob([csv], {type:"text/csv"});
const link = document.createElement("a");

link.href = URL.createObjectURL(blob);
link.download = "contabilidad_negocio.csv";

document.body.appendChild(link);
link.click();
document.body.removeChild(link);

});

}

function setTexto(id,valor){

const el = document.getElementById(id);
if(el){
el.innerText = valor;
}

}

function render(){

renderTabla();
actualizarDashboard();
actualizarPL();
actualizarBalance();
actualizarFlujo();

}

}
