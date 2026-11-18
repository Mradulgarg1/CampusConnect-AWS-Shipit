// Set this to the API URL printed by `sam deploy --guided`. Keep the trailing slash off.
const API_BASE = "PASTE_YOUR_API_GATEWAY_URL_HERE";
const $ = (id) => document.getElementById(id);
let reports = [];

function apiReady() {
  return API_BASE.startsWith("https://") && !API_BASE.includes("PASTE_");
}
function escapeText(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
function setMessage(message, error=false) {
  $("formMessage").textContent = message;
  $("formMessage").classList.toggle("error", error);
}
function formatDate(value) {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "Recently" : d.toLocaleString([], {dateStyle:"medium", timeStyle:"short"});
}
function updateStats() {
  $("totalCount").textContent = reports.length;
  $("openCount").textContent = reports.filter(x => x.status === "Open").length;
  $("resolvedCount").textContent = reports.filter(x => x.status === "Resolved").length;
}
function renderReports() {
  const q = $("searchInput").value.trim().toLowerCase();
  const status = $("filterStatus").value;
  const filtered = reports.filter(x => {
    const haystack = `${x.title} ${x.description} ${x.category} ${x.location || ""}`.toLowerCase();
    return (!q || haystack.includes(q)) && (status === "All" || x.status === status);
  });
  const host = $("issueList");
  if (!filtered.length) {
    host.innerHTML = `<div class="empty-state"><p>${reports.length ? "No reports match this filter." : "No reports yet. Be the first to raise one."}</p></div>`;
    return;
  }
  host.innerHTML = filtered.map(x => {
    const statusClass = x.status.toLowerCase().replaceAll(" ", "-");
    const moderator = $("adminKey").value.trim();
    const controls = moderator ? `<div class="moderator-controls"><select aria-label="New status" id="status-${escapeText(x.issueId)}"><option>Open</option><option>In Progress</option><option>Resolved</option></select><button type="button" data-update="${escapeText(x.issueId)}">Update</button></div>` : "";
    return `<article class="issue-card">
      <div class="issue-top"><div><h3>${escapeText(x.title)}</h3><div class="issue-meta">${escapeText(x.category)}${x.location ? " · " + escapeText(x.location) : ""} · ${formatDate(x.createdAt)}</div></div><span class="status ${statusClass}">${escapeText(x.status)}</span></div>
      <p class="issue-desc">${escapeText(x.description)}</p>
      <div class="issue-bottom"><span class="issue-id">#${escapeText(String(x.issueId).slice(0,8))}</span>${controls}</div>
    </article>`;
  }).join("");
  host.querySelectorAll("[data-update]").forEach(btn => btn.addEventListener("click", () => updateStatus(btn.dataset.update)));
}
async function loadReports() {
  if (!apiReady()) {
    $("issueList").innerHTML = `<div class="empty-state"><p>Connect your AWS API URL in <code>app.js</code> to load live reports.</p></div>`;
    $("totalCount").textContent = $("openCount").textContent = $("resolvedCount").textContent = "—";
    return;
  }
  $("issueList").innerHTML = `<div class="empty-state"><span class="loader"></span><p>Loading campus reports...</p></div>`;
  try {
    const response = await fetch(`${API_BASE}/issues`);
    if (!response.ok) throw new Error("API returned " + response.status);
    const data = await response.json();
    reports = Array.isArray(data.issues) ? data.issues : [];
    updateStats(); renderReports();
  } catch (err) {
    $("issueList").innerHTML = `<div class="empty-state"><p>Couldn't load reports. Check the API URL and deployment, then refresh.</p></div>`;
    console.error(err);
  }
}
$("issueForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!apiReady()) return setMessage("First connect the deployed API URL in app.js.", true);
  const payload = {
    title: $("title").value.trim(),
    category: $("category").value,
    location: $("location").value.trim(),
    description: $("description").value.trim()
  };
  $("submitBtn").disabled = true; $("submitBtn").textContent = "Submitting...";
  try {
    const response = await fetch(`${API_BASE}/issues`, {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload)});
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Unable to submit report");
    $("issueForm").reset(); setMessage("Report submitted. Thanks for helping improve campus life!");
    await loadReports();
  } catch (err) { setMessage(err.message, true); }
  finally { $("submitBtn").disabled = false; $("submitBtn").innerHTML = 'Submit report <span>↗</span>'; }
});
async function updateStatus(issueId) {
  const key = $("adminKey").value.trim();
  const status = $(`status-${CSS.escape(issueId)}`).value;
  if (!key) return;
  try {
    const response = await fetch(`${API_BASE}/issues/${encodeURIComponent(issueId)}/status`, {
      method:"PATCH", headers:{"Content-Type":"application/json","x-admin-key":key}, body:JSON.stringify({status})
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Status update failed");
    await loadReports();
  } catch (err) { alert(err.message); }
}
$("adminToggle").addEventListener("click", () => {
  $("adminPanel").classList.toggle("hidden");
  $("adminToggle").innerHTML = $("adminPanel").classList.contains("hidden") ? "Moderator tools <span>＋</span>" : "Hide moderator tools <span>−</span>";
});
$("adminKey").addEventListener("input", renderReports);
$("searchInput").addEventListener("input", renderReports);
$("filterStatus").addEventListener("change", renderReports);
$("refreshBtn").addEventListener("click", loadReports);
loadReports();
