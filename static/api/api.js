const loadInfo = async () => {
  const request = await fetch("/api/v1/info", { method: "GET" });
  const result = await request.json();
  if (result.version) {
    document.getElementById("cowphone-version").innerHTML = `v${result.version}`;
  }
  if (result.updateSchedule) {
    document.getElementById("cowphone-schedule").innerHTML = result.updateSchedule;
  }
  if (result.cowTypes) {
    const selectBox = document.getElementById("cowphone-types");
    selectBox.replaceChildren();
    result.cowTypes.forEach((cowType) => {
      let option = document.createElement("option");
      option.value = cowType;
      option.innerHTML = cowType;
      selectBox.appendChild(option);
    });
  }
};

const loadHistory = async () => {
  const request = await fetch("/api/v1/history", { method: "GET" });
  const result = await request.json();
  if (result.length) {
    let html = "";
    result.forEach((file) => {
      const title = file.substr(0, file.lastIndexOf("."));
      html += `<div class="col col-6 col-md-4 col-lg-3 col-xl-2">
        <div class="card my-2" role="button" onclick="enlargeCow('${title}', '/cow/${file}');">
          <img src="/cow/${file}" alt="${title}" class="m-2" style="object-fit: scale-down;">
          <div class="card-footer small p-1">
            <small class="card-text text-muted">${title}</small>
          </div>
        </div>
      </div>`;
    });
    document.getElementById("cowphone-history").innerHTML = html;
  } else {
    document.getElementById("cowphone-history").innerHTML =
      `<div class="alert alert-warning d-flex flex-row" role="alert">
        <span class="me-auto">Apparently there aren't any cow powers yet...</span>
        <i class="fa-regular fa-face-sad-tear fa-xl"></i>
      </div>`;
  }
};

const loadFortune = async (form) => {
  const request = await fetch("/api/v1/fortune", { method: "GET" });
  const result = await request.json();
  if (result.text) {
    form.cow_text.value = result.text;
  }
};

const update = async () => {
  await fetch("/api/v1/update", { method: "POST" });
  loadHistory();
};

const setText = async (button, form) => {
  const buttonText = button.innerHTML;
  button.disabled = true;
  try {
    button.innerHTML = `<div class="spinner-border spinner-border-sm mx-1" role="status"></div>`;
    const request = await fetch("/api/v1/moo", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: form.cow_text.value,
        type: form.cow_type.options[form.cow_type.selectedIndex].value,
        trimmed: form.cow_text_trimmed.checked,
        centered: form.cow_text_centered.checked,
      }),
    });
    if (request.status == 200) {
      setTextStatus(form.cow_text, false, true);
    } else {
      setTextStatus(form.cow_text, true, false);
    }
    loadHistory();
  } catch (error) {
    console.error(error);
    setTextStatus(form.cow_text, true, false);
  } finally {
    button.innerHTML = buttonText;
    button.disabled = false;
  }
};

const setTextStatus = (textArea, error = false, success = false) => {
  if (error) {
    textArea.classList.add("text-danger", "border-danger");
  } else if (success) {
    textArea.classList.add("text-success", "border-success");
  } else {
    textArea.classList.remove("text-success", "text-danger", "border-success", "border-danger");
  }
};

const enlargeCow = (title, file) => {
  document.getElementById("cowphone-modal-title").innerHTML = title;
  document.getElementById("cowphone-modal-img").setAttribute("src", file);
  document.getElementById("cowphone-modal-img").setAttribute("alt", title);
  const modal = new bootstrap.Modal(document.getElementById("cowphone-modal"));
  modal.show();
};
