var d = document;
let togglerButton,
  togglerImage,
  customButtonPedido,
  iconoTienda,
  displayTiendaProductos,
  orderType,
  selectorDiv,
  columnasOrder,
  botonAgregar,
  buyButton;
let actualModeEditor = "tartas";
let actualPropertyEditor = "base";
let precio = 0;
let pedido = {
  Type: actualModeEditor,
  Prop: {
    base: "claro", //Por defecto
    relleno: "nata", //Por defecto
    bordes: null,
    decoracion: null,
    encima: actualModeEditor === "tartas" ? "chocolate blanco" : null,
  },
};
let pedidos = [];

const DOM = () => {
  return new Promise((resolve, reject) => {
    try {
      togglerButton = d.getElementById("navbar-toggler");
      togglerImage = d.querySelector(".navbar-toggler-icon");
      customButtonPedido = d.getElementById("custom-button-pedido");
      iconoTienda = d.getElementById("iconoTienda");
      displayTiendaProductos = d.getElementById("displayTiendaProductos");
      orderType = d.getElementById("orderType");
      selectorDiv = d.querySelector(".order-properties-selector");
      columnasOrder = d.getElementById("columnasOrder");
      botonAgregar = d.getElementById("botonAgregar");
      buyButton = d.getElementById("buyButton");
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
    // Tienda
    iconoTienda.addEventListener("click", () => {
      if (
        displayTiendaProductos.style.display === "none" ||
        displayTiendaProductos.style.display === ""
      ) {
        iconoTienda.src = "/src/SVG/tienda-icon-selected.svg";
        displayTiendaProductos.style.display = "block";
      } else {
        iconoTienda.src = "/src/SVG/tienda-icon.svg";
        displayTiendaProductos.style.display = "none";
      }
    });
    // Actualiza los iconos
    const updateIcons = (mode) => {
      selectorDiv.innerHTML = "";

      const properties = productData[mode.toLowerCase()];
      for (const key in properties) {
        if (properties.hasOwnProperty(key)) {
          const icono = properties[key].icono;
          const imgElement = document.createElement("img");
          imgElement.src = icono;
          imgElement.alt = key;
          imgElement.id = key;
          imgElement.width = 40;
          imgElement.height = 40;
          imgElement.classList.add("property-icon");
          selectorDiv.appendChild(imgElement);
        }
      }
    };
    updateIcons(actualModeEditor);
    //
    const cleanTypeButtons = () => {
      let botonsColumnasOrder = Array.from(columnasOrder.childNodes).filter(
        (node) => node.nodeType === Node.ELEMENT_NODE
      );
      botonsColumnasOrder.forEach((boton) => {
        boton.classList.remove("selected-product");
      });
    };
    //
    const selectedProperty = (property) => {
      let botonsColumnasOrder = Array.from(columnasOrder.childNodes).filter(
        (node) => node.nodeType === Node.ELEMENT_NODE
      );
      botonsColumnasOrder.forEach((boton) => {
        console.log(pedido.Prop[property], boton.id);
        if (pedido.Prop[property] == boton.id) {
          cleanTypeButtons();
          boton.classList.add("selected-product");
        }
      });
    };
    //
    const imageSelectedProperty = () => {
      const divs = document.querySelectorAll(".contenedor-pedido-imagenes img");

      const limpiar = () => {
        divs.forEach((imagen) => {
          imagen.style.visibility = "hidden"; // Ocultar la imagen mientras se limpia
          imagen.src = "";
        });
      };
      limpiar();

      divs.forEach((imagen) => {
        let partes = imagen.id.split(" ");
        let prop = partes[0];
        let tipo = partes[1];
        let actualPropiedad = pedido.Prop[prop];
        let arrayPropiedad =
          productData[tipo.toLowerCase()][prop.toLowerCase()].contenido;

        arrayPropiedad.forEach((propiedad) => {
          console.log(actualModeEditor);
          if (
            propiedad.nombre === actualPropiedad &&
            tipo == actualModeEditor.toLowerCase()
          ) {
            const nuevaImagen = new Image();
            nuevaImagen.src = propiedad.imagen;
            nuevaImagen.onload = () => {
              imagen.src = nuevaImagen.src;
              imagen.style.visibility = "visible";
            };
          }
        });
      });
    };

    imageSelectedProperty();
    // Botones de las propiedades
    const orderTypeButtons = () => {
      let botonsColumnasOrder = Array.from(columnasOrder.childNodes).filter(
        (node) => node.nodeType === Node.ELEMENT_NODE
      );
      botonsColumnasOrder.forEach((boton) => {
        boton.addEventListener("click", () => {
          pedido.Prop[actualPropertyEditor.toLowerCase()] = boton.id;
          cleanTypeButtons();
          boton.classList.add("selected-product");
          imageSelectedProperty();
        });
      });
    };
    // Actualiza las propiedades
    const updateProperty = (mode, prop) => {
      const columnasOrderDiv = document.querySelector(".columnas-order");
      columnasOrderDiv.innerHTML = "";

      const properties = productData[mode.toLowerCase()];
      for (const key in properties) {
        if (properties.hasOwnProperty(key) && key === prop.toLowerCase()) {
          properties[key].contenido.forEach((property) => {
            const propertyDiv = document.createElement("div");
            propertyDiv.classList.add("order-property");

            if (key === "decoracion") {
              propertyDiv.style.backgroundImage = `url(${property.imagenLayout})`;
            } else {
              propertyDiv.style.backgroundColor = property.color;
            }
            propertyDiv.id = property.nombre;
            const showPropertyDiv = document.createElement("div");
            showPropertyDiv.classList.add("show-property");
            showPropertyDiv.addEventListener("click", () => {
              //Click
              document.getElementById("propertyModalLabel").innerText =
                "SABOR: ";
              document.getElementById("propertyModalContent").innerText =
                property.nombre;

              const propertyModal = new bootstrap.Modal(
                document.getElementById("propertyModal")
              );
              propertyModal.show();
            });

            propertyDiv.appendChild(showPropertyDiv);
            columnasOrderDiv.appendChild(propertyDiv);
          });
        }
      }
      console.log("Hola");
      selectedProperty(actualPropertyEditor.toLowerCase());
      orderTypeButtons();
    };
    updateProperty(actualModeEditor, actualPropertyEditor);
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
      //Cambia tipo
      boton.addEventListener("click", () => {
        if (actualModeEditor != boton.id) {
          cleanButtons();
          boton.classList.add("actual-boton-type");
          actualPropertyEditor = "Base";
          actualModeEditor = boton.id;
          updateIcons(actualModeEditor);
          updateProperty(actualModeEditor, actualPropertyEditor);
          PorpertyButtons();
          pedido = {
            Type: actualModeEditor,
            Prop: {
              base: "claro",
              relleno: "nata",
              bordes: null,
              decoracion: null,
              encima: actualModeEditor === "tartas" ? "chocolate blanco" : null,
            },
          };
          selectedProperty(actualPropertyEditor);
        }
        imageSelectedProperty();
      });
    });
    //
    const clearPropertyButtons = () => {
      let botonsPropertyType = Array.from(selectorDiv.childNodes).filter(
        (node) => node.nodeType === Node.ELEMENT_NODE
      );
      botonsPropertyType.forEach((boton) => {
        boton.classList.remove("selected-property");
      });
    };
    //
    const PorpertyButtons = () => {
      //Cambia propiedad
      let botonsPropertyType = Array.from(selectorDiv.childNodes).filter(
        (node) => node.nodeType === Node.ELEMENT_NODE
      );
      botonsPropertyType.forEach((boton, i) => {
        if (i === 0) {
          boton.classList.add("selected-property");
          actualPropertyEditor = boton.id;
        }
        boton.addEventListener("click", () => {
          if (actualPropertyEditor != boton.id) {
            clearPropertyButtons();
            actualPropertyEditor = boton.id;
            boton.classList.add("selected-property");
          }
          updateProperty(actualModeEditor, actualPropertyEditor);
        });
      });
    };

    PorpertyButtons();
    //
    const botonAgregar = document.getElementById("botonAgregar");
    const cestaContenedor = document.querySelector(".cesta-contenedor");
    const precioTotal = document.getElementById("precio");
    //
    const actualizarPedidosDOM = () => {
      cestaContenedor.innerHTML = "";

      let contadorTartas = 0;
      let contadorMuffins = 0;

      pedidos.forEach((pedido, index) => {
        const pedidoElemento = document.createElement("div");
        pedidoElemento.classList.add("cesta-elemento");

        const div1 = document.createElement("div");
        div1.classList.add("cesta-elemento-div1");

        const p = document.createElement("p");
        p.classList.add("titulo-elemento");

        const span = document.createElement("span");
        span.classList.add("white-text");

        if (pedido.pedido.Type === "tartas") {
          contadorTartas++;
          span.textContent = `Tarta ${contadorTartas}`;
        } else if (pedido.pedido.Type === "muffins") {
          contadorMuffins++;
          span.textContent = `Muffin ${contadorMuffins}`;
        }

        p.appendChild(span);
        div1.appendChild(p);

        const div2 = document.createElement("div");
        div2.classList.add("cesta-elemento-div2");

        const eliminarLink = document.createElement("a");
        eliminarLink.href = "/orders";
        eliminarLink.textContent = "Eliminar";
        eliminarLink.addEventListener("click", (e) => {
          e.preventDefault();
          eliminarPedido(index);
        });

        div2.appendChild(eliminarLink);

        pedidoElemento.appendChild(div1);
        pedidoElemento.appendChild(div2);

        cestaContenedor.appendChild(pedidoElemento);
      });

      const totalPrecio = pedidos.reduce(
        (total, pedido) => total + pedido.precio,
        0
      );
      precioTotal.textContent = totalPrecio;
    };
    //
    const eliminarPedido = (index) => {
      pedidos.splice(index, 1);
      actualizarPedidosDOM();
      if (cestaContenedor.children.length <= 0) {
        buyButton.disabled = true;
        buyButton.classList.add("disabled");
      }
    };
    //
    botonAgregar.addEventListener("click", () => {
      iconoTienda.src = "/src/SVG/tienda-icon-selected.svg";
      displayTiendaProductos.style.display = "block";
      precio = 0;
      const pedidoActual = JSON.parse(JSON.stringify(pedido));

      for (let key in pedidoActual.Prop) {
        if (pedidoActual.Prop[key] !== null) {
          precio += productData[actualModeEditor.toLowerCase()][key].precio;
        }
      }

      const pedidoConPrecio = {
        pedido: pedidoActual,
        precio: precio,
      };

      pedidos.push(pedidoConPrecio);
      console.log(pedidos);

      actualizarPedidosDOM();
      if (cestaContenedor.children.length > 0) {
        buyButton.disabled = false;
        buyButton.classList.remove("disabled");
      }
    });

    actualizarPedidosDOM();
    //
    var stripeHandler = StripeCheckout.configure({
      key: publicStripeKey,
      locate: "auto",
      token: function (token) {
        fetch("/purchase", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            id: token.id,
            contenido: pedidos,
          }),
        }).then((data) => {
          alert("Pago exitoso");
          pedidos = [];
          actualizarPedidosDOM();
          buyButton.disabled = true;
          buyButton.classList.add("disabled");
        });
      },
    });
    buyButton.addEventListener("click", async () => {
      const precioTotal = parseFloat(
        document.getElementById("precio").textContent
      );

      try {
        stripeHandler.open({
          amount: precioTotal * 100,
        });
      } catch (error) {
        console.log(error);
      }
    });
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
