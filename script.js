const form = document.getElementById("uploadForm");
const imageInput = document.getElementById("imageInput");
const preview = document.getElementById("preview");
const result = document.getElementById("result");

// Preview image before upload
imageInput.addEventListener("change", () => {
  preview.innerHTML = "";
  const file = imageInput.files[0];
  if (file) {
    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);
    preview.appendChild(img);
  }
});

// Handle form submission
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  result.textContent = "⏳ Analyzing image...";

  const formData = new FormData();
  formData.append("image", imageInput.files[0]);

  try {
    const res = await fetch("/analyze", {
      method: "POST",
      body: formData
    });

    const data = await res.json();
    result.textContent = data.analysis || "No result.";
  } catch (err) {
    console.error(err);
    result.textContent = "❌ Error analyzing image.";
  }
});
