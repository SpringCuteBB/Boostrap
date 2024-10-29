var d = document;
let togglerButton,
  togglerImage,
  customButtonPedido,
  iconoTienda,
  displayTiendaProductos,
  orderType,
  selectorDiv;
let actualModeEditor = "Tartas";
let actualPropertyEditor = "Base";

let pedido = {
  Type: actualModeEditor,
  Prop: {
    base: null,
    relleno: null,
    bordes: null,
    decoracion: null,
    encima: null,
  },
};

const DOM = () => {
  return new Promise((resolve, reject) => {
    try {
      togglerButton = d.getElementById("navbar-toggler");
      togglerImage = d.querySelector(".navbar-toggler-icon");
      customButtonPedido = d.getElementById("custom-button-pedido");
      iconoTienda = d.getElementById("iconoTienda");
      displayTiendaProductos = d.getElementById("displayTiendaProductos");
      orderType = d.getElementById("orderType");
      selectorDiv = document.querySelector(".order-properties-selector");
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

const fetchData = async () => {
  try {
    const response = await fetch("/api/data");
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

window.addEventListener("DOMContentLoaded", async () => {
  try {
    await DOM();
    const productData = await fetchData();
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
    //
    iconoTienda.addEventListener("click", () => {
      if (
        displayTiendaProductos.style.display === "none" ||
        displayTiendaProductos.style.display === ""
      ) {
        displayTiendaProductos.style.display = "block";
      } else {
        displayTiendaProductos.style.display = "none";
      }
    });
    //
    const updateIcons = (mode) => {
      selectorDiv.innerHTML = ""; // Limpiar el contenido anterior

      const properties = productData[mode.toLowerCase()];
      for (const key in properties) {
        if (properties.hasOwnProperty(key)) {
          const icono = properties[key].icono;
          const imgElement = document.createElement("img");
          imgElement.src = icono;
          imgElement.alt = key;
          imgElement.width = 40;
          imgElement.height = 40;
          imgElement.classList.add("property-icon");
          selectorDiv.appendChild(imgElement);
        }
      }
    };
    updateIcons(actualModeEditor);
    //
    const cleanButtons = () => {
      let botonsOrderType = Array.from(orderType.childNodes).filter(
        (node) => node.nodeType === Node.ELEMENT_NODE
      );
      botonsOrderType.forEach((boton) => {
        boton.classList.remove("actual-boton-type");
      });
    };
    //
    let botonsOrderType = Array.from(orderType.childNodes).filter(
      (node) => node.nodeType === Node.ELEMENT_NODE
    );
    botonsOrderType.forEach((boton) => {
      boton.addEventListener("click", () => {
        if (actualModeEditor != boton.id) {
          cleanButtons();
          boton.classList.add("actual-boton-type");
          actualModeEditor = boton.id;
          if (boton.id === "Tartas") {
            console.log("Tarta");
          } else if (boton.id === "Muffins") {
            console.log("Muffin");
          }
          updateIcons(actualModeEditor);
        }
      });
    });
    //
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

console.log("iconoTienda existe." + iconoTienda);
