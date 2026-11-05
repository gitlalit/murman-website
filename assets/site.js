/* Murman Engineering site behaviour. Shared by every page; each block runs only if its section exists. */

const SITE = {
  phone: "+91 79771 88789",
  whatsapp: "917977188789",
  email: "info@murmanengineering.com",
  /* Web3Forms access key: free key from web3forms.com, sent to info@murmanengineering.com.
     Until it is set, the form prepares a WhatsApp message instead of sending. */
  web3formsKey: "YOUR_WEB3FORMS_ACCESS_KEY"
};

const $ = (id) => document.getElementById(id);
const inr = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

function copyText(text, btn) {
  const label = btn.textContent;
  const done = () => { btn.textContent = "Copied"; setTimeout(() => (btn.textContent = label), 1600); };
  const fallback = () => {
    const ta = document.createElement("textarea");
    ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.append(ta); ta.select();
    try { document.execCommand("copy"); done(); } catch (e) { btn.textContent = "Select to copy"; }
    ta.remove();
  };
  try { navigator.clipboard.writeText(text).then(done, fallback); } catch (e) { fallback(); }
}
document.querySelectorAll("[data-copy]").forEach((b) => b.addEventListener("click", () => copyText(b.dataset.copy, b)));

/* Area statement (green FSI) */
if ($("st-plot")) {
  const SQFT = 10.7639;
  const flash = (el) => { el.classList.remove("flash"); void el.offsetWidth; el.classList.add("flash"); };
  const fmtMoney = (v) => (v >= 1e7 ? "₹" + (v / 1e7).toFixed(2) + " cr" : "₹" + (v / 1e5).toFixed(1) + " lakh");
  function calc(e) {
    const plot = Math.max(0, parseFloat($("st-plot").value) || 0);
    const fsi = Math.max(0, parseFloat($("st-fsi").value) || 0);
    const pct = parseFloat($("st-rating").value) || 0;
    const rate = Math.max(0, parseFloat($("st-rate").value) || 0);
    const bua = plot * fsi, extra = bua * pct / 100, value = extra * SQFT * rate;
    $("st-bua").textContent = inr.format(bua);
    $("st-pct").textContent = pct;
    $("st-extra").textContent = inr.format(extra);
    $("st-extra-sqft").textContent = inr.format(extra * SQFT) + " sq ft";
    $("st-value").textContent = fmtMoney(value);
    if (e) { flash($("row-gain")); flash($("row-total")); }
  }
  ["st-plot", "st-fsi", "st-rating", "st-rate"].forEach((id) => $(id).addEventListener("input", calc));
  calc();
}

/* Project gallery filter */
if ($("gallery")) {
  const buttons = document.querySelectorAll(".filters button");
  buttons.forEach((btn) => btn.addEventListener("click", () => {
    buttons.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
    const f = btn.dataset.f;
    document.querySelectorAll("#gallery figure").forEach((fig) => { fig.hidden = !(f === "all" || fig.dataset.sector === f); });
  }));
}

/* Meeting request */
if ($("req")) {
  const form = $("req"), err = $("req-err"), btn = $("req-submit");
  let lastMsg = "";
  const val = (id) => $(id).value.trim();
  const message = () => {
    const picks = [...form.querySelectorAll('input[name="interest"]:checked')].map((i) => i.value);
    return [
      "Meeting request for Murman Engineering", "",
      "Name: " + val("r-name"), "Organisation: " + val("r-org"),
      val("r-phone") && "Phone: " + val("r-phone"), val("r-email") && "Email: " + val("r-email"),
      "Role: " + val("r-role"),
      val("r-loc") && "Project location: " + val("r-loc"), val("r-size") && "Project size: " + val("r-size"),
      "Stage: " + val("r-stage"),
      picks.length && "Interested in: " + picks.join(", "),
      val("r-msg") && "Notes: " + val("r-msg")
    ].filter((l, i) => l || i === 1).join("\n");
  };
  const show = (sent) => {
    $("sent-title").textContent = sent ? "Thank you. Your request has reached us." : "Your request is ready to send";
    $("sent-sub").textContent = sent
      ? "We reply within one working day. For anything urgent, message us on WhatsApp at " + SITE.phone + "."
      : "Send it to us on WhatsApp, or copy it into an email to " + SITE.email + ". We reply within one working day.";
    $("sent-text").textContent = lastMsg;
    $("sent-wa").href = "https://wa.me/" + SITE.whatsapp + "?text=" + encodeURIComponent(lastMsg);
    form.hidden = true; $("sent").hidden = false; $("sent").focus();
  };
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const missing = [["r-name", !val("r-name")], ["r-org", !val("r-org")], ["r-phone", !val("r-phone") && !val("r-email")]];
    missing.forEach(([id, bad]) => $(id).setAttribute("aria-invalid", bad ? "true" : "false"));
    const first = missing.find(([, bad]) => bad);
    if (first) { err.hidden = false; $(first[0]).focus(); return; }
    err.hidden = true;
    lastMsg = message();
    if (!SITE.web3formsKey || SITE.web3formsKey.startsWith("YOUR_")) { show(false); return; }
    btn.disabled = true; btn.textContent = "Sending";
    try {
      const data = Object.fromEntries(new FormData(form));
      data.interest = [...form.querySelectorAll('input[name="interest"]:checked')].map((i) => i.value).join(", ");
      data.access_key = SITE.web3formsKey;
      data.subject = "Meeting request: " + val("r-org");
      data.from_name = "murmanengineering.com";
      const r = await fetch("https://api.web3forms.com/submit", {
        method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(data)
      });
      const j = await r.json();
      show(Boolean(j && j.success));
    } catch (x) { show(false); }
    finally { btn.disabled = false; btn.textContent = "Request a meeting"; }
  });
  $("sent-copy").addEventListener("click", (e) => copyText(lastMsg, e.currentTarget));
  $("sent-edit").addEventListener("click", () => { $("sent").hidden = true; form.hidden = false; $("r-name").focus(); });
}

/* Client logo strip: pause and resume */
if ($("logo-pause")) {
  const box = document.querySelector(".clients"), b = $("logo-pause");
  b.addEventListener("click", () => {
    const paused = box.classList.toggle("paused");
    b.setAttribute("aria-pressed", String(paused));
    b.textContent = paused ? "Play logos" : "Pause logos";
  });
}
