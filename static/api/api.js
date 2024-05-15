const loadVersion = async () => {
  const request = await fetch("/api/v1/version", { method: "GET" });
  const result = await request.json();
  if (result.version) {
    document.getElementById("cowphone-version").innerHTML = `v${result.version}`;
  }
};

const loadHistory = async () => {
  const request = await fetch("/api/v1/history", { method: "GET" });
  if (request.body) {
    const result = await request.json();
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
      `<div class="alert alert-info" role="alert">
        Apparently there's no cow power yet...
      </div>`;
  }
};
