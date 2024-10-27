var d = document;
let togglerButton, togglerImage, customButtonPedido;
const DOM = () => {
  return new Promise((resolve, reject) => {
    try {
      togglerButton = d.getElementById("navbar-toggler");
      togglerImage = d.querySelector(".navbar-toggler-icon");
      customButtonPedido = d.getElementById("custom-button-pedido");
      resolve();
    } catch (error) {
      reject(error);
    }
  });
};
const loadImages = (images) => {
  return Promise.all(
    images.map((img) => {
      return new Promise((resolve, reject) => {
        const LoadingImage = new Image();
        LoadingImage.src = img;
        LoadingImage.onload = resolve;
        LoadingImage.onerror = reject;
      });
    })
  );
};

window.addEventListener("load", async () => {
  try {
    await DOM();
    if (togglerButton) {
      togglerButton.onclick = togglerButtonActiveCSS;
    } else {
      console.log("togglerButton no existe.");
    }

    if (customButtonPedido) {
      customButtonPedido.addEventListener("mouseover", () => {
        shakeAnimationCSS(true);
      });
      customButtonPedido.addEventListener("mouseout", () => {
        shakeAnimationCSS(false);
      });
    } else {
      console.log("customButtonPedido no existe.");
    }
  } catch (error) {
    console.log("Error al cargar el DOM: " + error);
  }
});

const togglerButtonActiveCSS = async () => {
  try {
    await loadImages([
      "/src/SVG/menu-nav-icon-active.svg",
      "/src/SVG/menu-nav-icon.svg",
    ]);

    togglerButton.disabled = true;

    if (togglerImage.id === "navbar-toggler-icon") {
      togglerImage.id = "navbar-toggler-icon-active";
    } else {
      togglerImage.id = "navbar-toggler-icon";
    }

    // Animación 0.35 segundos
    await new Promise((resolve) => setTimeout(resolve, 350));
    togglerButton.disabled = false;
  } catch (error) {
    console.log("Error al cargar las imágenes: " + error);
  }
};

const shakeAnimationCSS = (event) => {
  let iconoBoton = customButtonPedido.childNodes[1];
  event == true
    ? iconoBoton.classList.add("shake")
    : iconoBoton.classList.remove("shake");

  console.log(iconoBoton.classList);
};
