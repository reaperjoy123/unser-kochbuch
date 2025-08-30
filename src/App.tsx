import React, { useState, useEffect, ChangeEvent } from "react";

type Recipe = {
  title: string;
  ingredients: string;
  instructions: string;
  image?: string;
};

function App() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [newRecipe, setNewRecipe] = useState<Recipe>({
    title: "",
    ingredients: "",
    instructions: "",
    image: "",
  });
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Rezepte beim Start laden
  useEffect(() => {
    const storedRecipes = localStorage.getItem("recipes");
    if (storedRecipes) {
      setRecipes(JSON.parse(storedRecipes));
    }
  }, []);

  // Rezepte im localStorage sichern
  useEffect(() => {
    localStorage.setItem("recipes", JSON.stringify(recipes));
  }, [recipes]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setNewRecipe({ ...newRecipe, [e.target.name]: e.target.value });
  };

  // ✅ Bild-Upload mit Crop (400×300, zentriert)
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const targetWidth = 400;
          const targetHeight = 300;
          const canvas = document.createElement("canvas");
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          const ctx = canvas.getContext("2d");

          if (!ctx) return;

          const scale = Math.max(
            targetWidth / img.width,
            targetHeight / img.height
          );
          const scaledWidth = img.width * scale;
          const scaledHeight = img.height * scale;

          const offsetX = (targetWidth - scaledWidth) / 2;
          const offsetY = (targetHeight - scaledHeight) / 2;

          ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);

          const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
          setNewRecipe({ ...newRecipe, image: dataUrl });
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editIndex !== null) {
      const updated = [...recipes];
      updated[editIndex] = newRecipe;
      setRecipes(updated);
      setSelectedRecipe(newRecipe); // nach dem Speichern im Rezept bleiben
      setEditIndex(null);
    } else {
      setRecipes([...recipes, newRecipe]);
    }
    setNewRecipe({ title: "", ingredients: "", instructions: "", image: "" });
    setShowForm(false);
  };

  const handleDelete = (index: number) => {
    if (window.confirm("Möchtest du dieses Rezept wirklich löschen?")) {
      const updated = recipes.filter((_, i) => i !== index);
      setRecipes(updated);
      setSelectedRecipe(null);
    }
  };

  const exportRecipes = () => {
    const dataStr = JSON.stringify(recipes, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "unser-kochbuch.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const importRecipes = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        setRecipes(imported);
        e.target.value = "";
      } catch {
        alert("Fehler beim Importieren der Datei!");
      }
    };
    reader.readAsText(file);
  };

  const filteredRecipes = recipes.filter((r) =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>Unser Kochbuch</h1>

      {!showForm && !selectedRecipe && (
        <>
          <input
            type="text"
            placeholder="Suche nach Rezept..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ marginBottom: "10px", width: "100%", padding: "5px" }}
          />
          <button onClick={() => setShowForm(true)}>Rezept hinzufügen</button>
          <button onClick={exportRecipes}>Exportieren</button>
          <input
            type="file"
            accept="application/json"
            onChange={importRecipes}
            style={{ marginLeft: "10px" }}
          />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: "10px",
              marginTop: "20px",
            }}
          >
            {filteredRecipes.map((recipe, index) => (
              <div
                key={index}
                style={{
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  padding: "10px",
                  cursor: "pointer",
                  textAlign: "center",
                }}
                onClick={() => setSelectedRecipe(recipe)}
              >
                {recipe.image && (
                  <img
                    src={recipe.image}
                    alt={recipe.title}
                    style={{
                      maxWidth: "100%",
                      height: "auto",
                      borderRadius: "5px",
                    }}
                  />
                )}
                <h3>{recipe.title}</h3>
              </div>
            ))}
          </div>
        </>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          style={{ marginTop: "20px", display: "flex", flexDirection: "column" }}
        >
          <input
            type="text"
            name="title"
            placeholder="Titel"
            value={newRecipe.title}
            onChange={handleChange}
            required
          />
          <textarea
            name="ingredients"
            placeholder="Zutaten"
            value={newRecipe.ingredients}
            onChange={handleChange}
            rows={2}
            style={{ resize: "none", overflow: "hidden" }}
            onInput={(e) => {
              e.currentTarget.style.height = "auto";
              e.currentTarget.style.height = e.currentTarget.scrollHeight + "px";
            }}
            required
          />
          <textarea
            name="instructions"
            placeholder="Anleitung"
            value={newRecipe.instructions}
            onChange={handleChange}
            rows={2}
            style={{ resize: "none", overflow: "hidden" }}
            onInput={(e) => {
              e.currentTarget.style.height = "auto";
              e.currentTarget.style.height = e.currentTarget.scrollHeight + "px";
            }}
            required
          />
          <input type="file" accept="image/*" onChange={handleImageUpload} />
          <button type="submit">
            {editIndex !== null ? "Änderungen speichern" : "Rezept hinzufügen"}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowForm(false);
              setEditIndex(null);
              setNewRecipe({
                title: "",
                ingredients: "",
                instructions: "",
                image: "",
              });
            }}
          >
            Abbrechen
          </button>
        </form>
      )}

      {selectedRecipe && !showForm && (
        <div style={{ marginTop: "20px" }}>
          <h2>{selectedRecipe.title}</h2>
          {selectedRecipe.image && (
            <img
              src={selectedRecipe.image}
              alt={selectedRecipe.title}
              style={{ maxWidth: "100%", borderRadius: "5px" }}
            />
          )}
          <h3>Zutaten</h3>
          <pre style={{ whiteSpace: "pre-wrap" }}>
            {selectedRecipe.ingredients}
          </pre>
          <h3>Anleitung</h3>
          <pre style={{ whiteSpace: "pre-wrap" }}>
            {selectedRecipe.instructions}
          </pre>

          <button
            onClick={() => {
              const index = recipes.findIndex((r) => r === selectedRecipe);
              if (index !== -1) {
                setEditIndex(index);
                setNewRecipe(recipes[index]);
                setShowForm(true);
              }
            }}
          >
            Bearbeiten
          </button>
          <button
            onClick={() => {
              const index = recipes.findIndex((r) => r === selectedRecipe);
              if (index !== -1) handleDelete(index);
            }}
          >
            Löschen
          </button>
          <button onClick={() => setSelectedRecipe(null)}>Zurück</button>
        </div>
      )}
    </div>
  );
}

export default App;
