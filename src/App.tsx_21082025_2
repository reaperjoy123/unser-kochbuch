// Hilfsfunktion: Bild komprimieren
const compressImage = (file: File, maxWidth = 800, quality = 0.7): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const scaleSize = maxWidth / img.width;
        const width = maxWidth;
        const height = img.height * scaleSize;

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) return reject("Kein Canvas-Context gefunden");

        ctx.drawImage(img, 0, 0, width, height);

        // Ausgabe als komprimiertes JPEG
        const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(compressedDataUrl);
      };

      img.onerror = (err) => reject(err);
    };
  });
};

const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  try {
    const compressed = await compressImage(file);
    setNewRecipe({ ...newRecipe, image: compressed });
  } catch (err) {
    console.error("Bildkomprimierung fehlgeschlagen:", err);
  }
};
