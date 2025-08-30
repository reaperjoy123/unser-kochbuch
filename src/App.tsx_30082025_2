import React, { useState, useEffect, ChangeEvent } from "react";

type Recipe = {
  title: string;
  ingredients: string;
  instructions: string;
  image?: string;
};

export default function App() {
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
  const [searchTerm, setSearchTerm] = useState("");

  // Rezepte aus localStorage laden
  useEffect(() => {
    const stored = localStorage.getItem("recipes");
    if (stored) {
      setRecipes(JSON.parse(stored));
    }
  }, []);

  // Rezepte speichern
  useEffect(() => {
    localStorage.setItem("recipes", JSON.stringify(recipes));
  }, [recipes]);

  // Eingabeänderungen
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: keyof Recipe
  ) => {
    const { value } = e.target;
    setNewRecipe((prev) => ({ ...prev, [field]: value }));

    // Dynamische Höhe für Textareas
    if (e.target instanceof HTMLTextAreaElement) {
      e.target.style.height = "auto";
      e.target.style.height = `${e.target.scrollHeight}px`;
    }
  };

  // Bild komprimieren und laden
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const MAX_SIZE = 300;
        let { width, height } = img;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        const compressed = canvas.toDataURL("image/jpeg", 0.7);

        setNewRecipe((prev) => ({ ...prev, image: compressed }));
      };
    };

    reader.readAsDataURL(file);
  };

  // Rezept speichern (neu oder bearbeiten)
  const saveRecipe = () => {
    if (!newRecipe.title.trim()) return;

    if (editIndex !== null) {
      const updated = [...recipes];
      updated[editIndex] = newRecipe;
      setRecipes(updated);
      setSelectedRecipe(newRecipe);
      setEditIndex(null);
    } else {
      setRecipes([...recipes, newRecipe]);
    }

    setNewRecipe({ title: "", ingredients: "", instructions: "", image: "" });
    setShowForm(false);
  };

  // Rezept löschen
  const deleteRecipe = (index: number) => {
    if (window.confirm("Möchtest du dieses Rezept wirklich löschen?")) {
      const updated = recipes.filter((_, i) => i !== index);
      setRecipes(updated);
      setSelectedRecipe(null);
    }
  };

  // Export als JSON
  const exportRecipes = () => {
    const dataStr = JSON.stringify(recipes, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "unser-kochbuch.json";
    link.click();

    URL.revokeObjectURL(url);
  };

  // Import aus JSON
  const importRecipes = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        setRecipes(imported);
      } catch {
        alert("Ungültige JSON-Datei");
      }
    };
    reader.readAsText(file);
  };

  // Filter nach Suchbegriff
  const filteredRecipes = recipes.filter((r) =>
    r.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-4">📖 Unser Kochbuch</h1>

      {/* Steuerung oben */}
      {!showForm && !selectedRecipe && (
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <input
            type="text"
            placeholder="🔍 Rezept suchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 p-2 border rounded"
          />
          <button
            onClick={() => {
              setNewRecipe({
                title: "",
                ingredients: "",
                instructions: "",
                image: "",
              });
              setShowForm(true);
              setEditIndex(null);
            }}
            className="p-2 bg-green-500 text-white rounded"
          >
            ➕ Rezept hinzufügen
          </button>
          <button
            onClick={exportRecipes}
            className="p-2 bg-blue-500 text-white rounded"
          >
            ⬇️ Export
          </button>
          <label className="p-2 bg-purple-500 text-white rounded cursor-pointer">
            ⬆️ Import
            <input
              type="file"
              accept="application/json"
              onChange={importRecipes}
              className="hidden"
            />
          </label>
        </div>
      )}

      {/* Rezept-Formular */}
      {showForm && (
        <div className="p-4 border rounded mb-4 bg-gray-50">
          <h2 className="text-xl font-bold mb-2">
            {editIndex !== null ? "Rezept bearbeiten" : "Neues Rezept"}
          </h2>
          <input
            type="text"
            value={newRecipe.title}
            onChange={(e) => handleInputChange(e, "title")}
            placeholder="Titel"
            className="w-full p-2 border rounded mb-2"
          />
          <textarea
            value={newRecipe.ingredients}
            onChange={(e) => handleInputChange(e, "ingredients")}
            placeholder="Zutaten"
            className="w-full p-2 border rounded mb-2 resize-none overflow-hidden"
            rows={2}
          />
          <textarea
            value={newRecipe.instructions}
            onChange={(e) => handleInputChange(e, "instructions")}
            placeholder="Anleitung"
            className="w-full p-2 border rounded mb-2 resize-none overflow-hidden"
            rows={2}
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="mb-2"
          />
          {newRecipe.image && (
            <img
              src={newRecipe.image}
              alt="Preview"
              className="w-32 h-32 object-cover rounded mb-2"
            />
          )}
          <div className="flex gap-2">
            <button
              onClick={saveRecipe}
              className="flex-1 p-2 bg-green-500 text-white rounded"
            >
              💾 Speichern
            </button>
            <button
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
              className="flex-1 p-2 bg-gray-400 text-white rounded"
            >
              ❌ Abbrechen
            </button>
          </div>
        </div>
      )}

      {/* Detailansicht */}
      {selectedRecipe && !showForm && (
        <div className="p-4 border rounded bg-white shadow-md">
          <h2 className="text-2xl font-bold mb-2">{selectedRecipe.title}</h2>
          {selectedRecipe.image && (
            <img
              src={selectedRecipe.image}
              alt={selectedRecipe.title}
              className="w-full h-64 object-cover rounded mb-4"
            />
          )}
          <h3 className="font-semibold">Zutaten</h3>
          <pre className="whitespace-pre-wrap mb-2">
            {selectedRecipe.ingredients}
          </pre>
          <h3 className="font-semibold">Anleitung</h3>
          <pre className="whitespace-pre-wrap mb-4">
            {selectedRecipe.instructions}
          </pre>
          <div className="flex gap-2">
            <button
              onClick={() => {
                const index = recipes.findIndex((r) => r === selectedRecipe);
                if (index !== -1) {
                  setEditIndex(index);
                  setNewRecipe(recipes[index]);
                  setShowForm(true);
                }
              }}
              className="flex-1 p-2 bg-yellow-500 text-white rounded"
            >
              ✏️ Bearbeiten
            </button>
            <button
              onClick={() => {
                const index = recipes.findIndex((r) => r === selectedRecipe);
                if (index !== -1) deleteRecipe(index);
              }}
              className="flex-1 p-2 bg-red-500 text-white rounded"
            >
              🗑️ Löschen
            </button>
            <button
              onClick={() => setSelectedRecipe(null)}
              className="flex-1 p-2 bg-gray-400 text-white rounded"
            >
              🔙 Zurück
            </button>
          </div>
        </div>
      )}

      {/* Galerie */}
      {!showForm && !selectedRecipe && (
        <div className="grid grid-cols-2 gap-4">
          {filteredRecipes.map((recipe, index) => (
            <div
              key={index}
              className="p-2 border rounded shadow cursor-pointer hover:bg-gray-50"
              onClick={() => setSelectedRecipe(recipe)}
            >
              {recipe.image && (
                <img
                  src={recipe.image}
                  alt={recipe.title}
                  className="w-full h-32 object-cover rounded mb-2"
                />
              )}
              <h2 className="text-lg font-bold">{recipe.title}</h2>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
