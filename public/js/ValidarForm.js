const createErrorDom = (errorText) => {
  const error = d.createElement("div");
  error.classList.add("error");
  const text = d.createTextNode(errorText);
  error.appendChild(text);
  return error;
};

const showModalErrors = (errors) => {
  const errorList = d.getElementById("errorList");
  errorList.innerHTML = ""; // Limpiar errores anteriores

  errors.forEach((error) => {
    const li = d.createElement("li");
    li.classList.add("error");
    const text = d.createTextNode(error);
    li.appendChild(text);
    errorList.appendChild(li);
  });

  const errorModal = new bootstrap.Modal(d.getElementById("errorModal"));
  errorModal.show();
};

const validateForm = () => {
  let isValid = true;
  const errors = [];
  const name = document.getElementById("name");
  const email = document.getElementById("email");
  const subject = document.getElementById("subject");
  const message = document.getElementById("message");
  const terms = document.getElementById("terms");

  document.querySelectorAll(".error").forEach((error) => error.remove());

  if (name.value.trim() === "") {
    const error = createErrorDom("El nombre es obligatorio.");
    name.closest(".mb-3").appendChild(error);
    errors.push("El nombre es obligatorio.");
    isValid = false;
  }

  if (email.value.trim() === "") {
    const error = createErrorDom("El correo electrónico es obligatorio.");
    email.closest(".mb-3").appendChild(error);
    errors.push("El correo electrónico es obligatorio.");
    isValid = false;
  } else if (!/\S+@\S+\.\S+/.test(email.value)) {
    const error = createErrorDom("El correo electrónico no es válido.");
    email.closest(".mb-3").appendChild(error);
    errors.push("El correo electrónico no es válido.");
    isValid = false;
  }

  if (subject.value.trim() === "") {
    const error = createErrorDom("El asunto es obligatorio.");
    subject.closest(".mb-3").appendChild(error);
    errors.push("El asunto es obligatorio.");
    isValid = false;
  }

  if (message.value.trim() === "") {
    const error = createErrorDom("El mensaje es obligatorio.");
    message.closest(".mb-3").appendChild(error);
    errors.push("El mensaje es obligatorio.");
    isValid = false;
  }

  if (!terms.checked) {
    const error = createErrorDom("Debe aceptar los términos y condiciones.");
    terms.closest(".mb-3").appendChild(error);
    errors.push("Debe aceptar los términos y condiciones.");
    isValid = false;
  }

  if (!isValid) {
    showModalErrors(errors);
  }

  return isValid;
};

const form = d.querySelector(".formulario");
const submitButton = d.querySelector(".custom-button-contacto");

form.addEventListener("submit", async (e) => {
  submitButton.disabled = true;
  e.preventDefault();

  if (validateForm()) {
    const formData = new FormData(form);
    const formDataObject = Object.fromEntries(formData);

    for (let [key, value] of Object.entries(formDataObject)) {
      console.log(`${key}: ${value}`);
    }

    try {
      const response = await fetch("/Form", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formDataObject),
      });

      const result = await response.json();
      if (response.ok) {
        window.location.href = `/contacted?name=${encodeURIComponent(
          formDataObject.name
        )}`;
      } else {
        result.errors.forEach((error) => {
          alert(error);
          submitButton.disabled = false;
        });
      }
    } catch (error) {
      console.error("Error:", error);
      submitButton.disabled = false;
    }
  } else {
    submitButton.disabled = false;
  }
});
