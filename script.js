function copyIP(id) {
  const ip = document.getElementById(id).innerText;
  navigator.clipboard.writeText(ip).then(() => {
    alert("IP copiada: " + ip);
  });
}
