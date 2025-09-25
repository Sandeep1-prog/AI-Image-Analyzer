const form = document.getElementById("uploadForm");
const imageInput = document.getElementById("imageInput");
const preview = document.getElementById("preview");
const result = document.getElementById("result");

imageInput.addEventListener("change", () => {
  preview.innerHTML = "";
  const file = imageInput.files[0];
  if (file) {
    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);
    preview.appendChild(img);
  }
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  result.textContent = "⏳ Analyzing...";

  const formData = new FormData();
  formData.append("image", imageInput.files[0]);

  const res = await fetch("/analyze", { method: "POST", body: formData });
  const data = await res.json();
  result.textContent = data.analysis || "No result.";
});

async function useSample(img) {
  preview.innerHTML = "";
  const clone = img.cloneNode();
  preview.appendChild(clone);

  result.textContent = "⏳ Analyzing sample...";

  const res = await fetch(img.src);
  const blob = await res.blob();
  const formData = new FormData();
  formData.append("image", blob, "sample.jpg");

  const analyzeRes = await fetch("/analyze", { method: "POST", body: formData });
  const data = await analyzeRes.json();
  result.textContent = data.analysis || "No result.";
}
