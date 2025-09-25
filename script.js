// Handle sample image selection
async function useSample(img) {
  preview.innerHTML = "";
  const clone = img.cloneNode();
  clone.style.maxWidth = "400px";
  preview.appendChild(clone);

  result.textContent = "⏳ Analyzing sample image...";

  try {
    const res = await fetch(img.src);
    const blob = await res.blob();
    const formData = new FormData();
    formData.append("image", blob, "sample.jpg");

    const response = await fetch("/analyze", {
      method: "POST",
      body: formData
    });

    const data = await response.json();
    result.textContent = data.analysis || "No result.";
  } catch (err) {
    console.error(err);
    result.textContent = "❌ Error analyzing sample image.";
  }
}
