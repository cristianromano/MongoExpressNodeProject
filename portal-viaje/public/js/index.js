/* eslint-disable */

import { login, logout } from "./login.js";
import { displayMap } from "./mapbox.js";

const mapBox = document.getElementById("map");
const logoutBtn = document.querySelector(".nav__el--logout");
const loginForm = document.querySelector(".form");

if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    login(email, password);
  });
}

if (logoutBtn) logoutBtn.addEventListener("click", logout);
