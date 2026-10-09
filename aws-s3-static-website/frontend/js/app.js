const input = document.querySelector("#folder-input");
const zone = document.querySelector("#drop-zone");
const selection = document.querySelector("#selection");
const fileList = document.querySelector("#file-list");
const statusBox = document.querySelector("#status");
const success = document.querySelector("#success");
const API_BASE = window.location.protocol === "file:" ? "http://127.0.0.1:5000" : "";
let selectedFiles = [];

function showFiles(files) {
  selectedFiles = [...files];
  const hasIndex = selectedFiles.some(file => file.webkitRelativePath.split("/").pop().toLowerCase() === "index.html");
  if (!selectedFiles.length || !hasIndex) {
    statusBox.textContent = "✕ index.html not found. Please select a valid static website folder.";
    statusBox.classList.remove("hidden");
    selection.classList.add("hidden");
    return;
  }
  statusBox.classList.add("hidden");
  selection.classList.remove("hidden");
  document.querySelector("#folder-name").textContent = selectedFiles[0].webkitRelativePath.split("/")[0] || "Website selected";
  fileList.innerHTML = selectedFiles.map(file => `<li>${escapeHtml(file.webkitRelativePath || file.name)}</li>`).join("");
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[character]));
}

input.addEventListener("change", event => showFiles(event.target.files));
["dragenter", "dragover"].forEach(eventName => zone.addEventListener(eventName, event => { event.preventDefault(); zone.classList.add("dragging"); }));
["dragleave", "drop"].forEach(eventName => zone.addEventListener(eventName, event => { event.preventDefault(); zone.classList.remove("dragging"); }));
zone.addEventListener("drop", event => showFiles(event.dataTransfer.files));

document.querySelector("#deploy-button").addEventListener("click", async () => {
  const body = new FormData();
  selectedFiles.forEach(file => body.append("files", file, file.webkitRelativePath || file.name));
  statusBox.textContent = "Uploading website... Validating files, configuring hosting, and uploading to S3.";
  statusBox.classList.remove("hidden");
  document.querySelector("#deploy-button").disabled = true;
  try {
    const response = await fetch(`${API_BASE}/api/deploy`, { method: "POST", body });
    const result = await response.json();
    if (!response.ok || !result.success) throw new Error(result.message || "Website deployment failed.");
    success.innerHTML = `<p class="eyebrow">DEPLOYMENT COMPLETE</p><h2>🎉 Your website is live.</h2><p>Deployment <strong>${escapeHtml(result.deploymentId)}</strong> uploaded ${result.fileCount} files successfully.</p><div class="success-grid"><div><p class="eyebrow">LIVE WEBSITE</p><a class="url" href="${escapeHtml(result.url)}" target="_blank" rel="noopener">${escapeHtml(result.url)}</a></div><button class="button secondary" id="copy-url">Copy URL</button><a class="button primary" href="${escapeHtml(result.url)}" target="_blank" rel="noopener">Open website ↗</a></div>`;
    success.classList.remove("hidden");
    document.querySelector("#copy-url").addEventListener("click", () => navigator.clipboard.writeText(result.url));
    selection.classList.add("hidden");
  } catch (error) {
    statusBox.textContent = `✕ ${error.message}`;
  } finally {
    document.querySelector("#deploy-button").disabled = false;
  }
});

function relativeTime(date) {
  const minutes = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
  return minutes < 1 ? "just now" : minutes < 60 ? `${minutes} minutes ago` : minutes < 1440 ? `${Math.floor(minutes / 60)} hours ago` : `${Math.floor(minutes / 1440)} days ago`;
}
async function loadDeployments() {
  const list = document.querySelector("#deployment-list");
  try {
    const deployments = await (await fetch(`${API_BASE}/api/deployments`)).json();
    list.innerHTML = deployments.length ? deployments.map(item => `<article class="deployment-card"><div><h3>${escapeHtml(item.name)}</h3><div class="meta">${item.fileCount} files · Deployed ${relativeTime(item.createdAt)}</div><div class="live">LIVE</div></div><a class="button secondary" href="${escapeHtml(item.url)}" target="_blank" rel="noopener">Open website ↗</a></article>`).join("") : '<div class="empty">No deployments yet. Your published websites will appear here.</div>';
  } catch { list.innerHTML = '<div class="empty">Could not load deployment history.</div>'; }
}
function route() {
  const deployments = location.hash === "#deployments";
  document.querySelector("#deploy-view").classList.toggle("hidden", deployments);
  document.querySelector("#deployments-view").classList.toggle("hidden", !deployments);
  if (deployments) loadDeployments();
}
window.addEventListener("hashchange", route);
route();
