const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", function(event) {
  event.preventDefault();

  const email = document.getElementById("email").value;
  const senha = document.getElementById("password").value;

  const emailCorreto = "teste@pokedex.com";
  const senhaCorreta = "1234";

  if (email === emailCorreto && senha === senhaCorreta) {
    alert("Login realizado com sucesso!");
    window.location.href = "index.html";
  } else {
    alert(" Usuário ou senha incorretos!");
  }
});
