const loadInfo = async () => {
  const request = await fetch("/api/v1/info", { method: "GET" });
  const result = await request.json();
  if (result.version) {
    document.getElementById("cowphone-version").innerHTML = `v${result.version}`;
  }
  if (result.schedule) {
    document.getElementById("cowphone-schedule").innerHTML = result.schedule;
  }
};

const loadHistory = async () => {
  const request = await fetch("/api/v1/history", { method: "GET" });
  const result = await request.json();
  if (result.length) {
    let html = "";
    result.forEach((cow) => {
      html += `<div class="col col-12 col-sm-6 col-md-4 col-lg-3">
        <div class="card p-2 my-2">
          <img src="/cow/${cow}" alt="${cow}">
          <div class="card-body p-0">
            <small class="card-text text-muted">${cow}</small>
          </div>
        </div>
      </div>`;
    });
    document.getElementById("cowphone-history").innerHTML = html;
  } else {
    document.getElementById("cowphone-history").innerHTML =
      `<div class="alert alert-warning d-flex flex-row" role="alert">
        <span class="me-auto">Apparently there's no cow power yet...</span>
        <i class="fa-regular fa-face-sad-tear fa-xl"></i>
      </div>`;
  }
};

const loadFortune = async (textArea) => {
  const request = await fetch("/api/v1/fortune", { method: "GET" });
  const result = await request.json();
  if (result.text) {
    textArea.value = result.text;
  }
};

const setText = async (textArea) => {
  const request = await fetch("/api/v1/moo", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text: textArea.value }),
  });
  if (request.status == 200) {
    textArea.classList.add("text-success", "border-success");
  } else {
    textArea.classList.add("text-danger", "border-danger");
  }
  console.log(textArea);
  console.log(textArea.classList);
  window.setTimeout(() => {
    textArea.classList.remove("text-success", "text-danger", "border-success", "border-danger");
  }, 4000);
  loadHistory();
};
