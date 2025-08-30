import React, { useState, useEffect, useRef, ChangeEvent } from "react";

interface Recipe {
  title: string;
  ingredients: string;
  instructions: string;
  image?: string;
}

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
  const [search, setSearch] = useState("");

  // Refs für dynamische Textarea-Höhe
  const ingredientsRef = useRef<HTMLTextAreaElement | null>(null);
  const instructionsRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("recipes");
    if (saved) {
      setRecipes(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("recipes", JSON.stringify(recipes));
  }, [recipes]);

  // Dynamische Höhe bei Bearbeiten/Erstellen
  useEffect(() => {
    if (ingredientsRef.current) {
      ingredientsRef.current.style.height = "auto";
      ingredientsRef.current.style.height = `${ingredientsRef.current.scrollHeight}px`;
    }
  }, [newRecipe.ingredients]);

  useEffect(() => {
    if (instructionsRef.current) {
      instructionsRef.current.style.height = "auto";
      instructionsRef.current.style.height = `${instructionsRef.current.scrollHeight}px`;
    }
  }, [newRecipe.instructions]);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: keyof Recipe
  ) => {
    setNewRecipe({ ...newRecipe, [field]: e.target.value });
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const maxSize = 300;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxSize) {
              height *= maxSize / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width *= maxSize / height;
              height = maxSize;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
          setNewRecipe({ ...newRecipe, image: dataUrl });
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const addRecipe = () => {
    if (editIndex !== null) {
      const updated = [...recipes];
      updated[editIndex] = newRecipe;
      setRecipes(updated);
      setEditIndex(null);
      setSelectedRecipe(newRecipe); // Nach Speichern im Rezept bleiben
    } else {
      setRecipes([...recipes, newRecipe]);
    }
    setNewRecipe({ title: "", ingredients: "", instructions: "", image: "" });
    setShowForm(false);
  };

  const deleteRecipe = (index: number) => {
    if (window.confirm("Willst du dieses Rezept wirklich löschen?")) {
      const updated = recipes.filter((_, i) => i !== index);
      setRecipes(updated);
      setSelectedRecipe(null);
    }
  };

  const filteredRecipes = recipes.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase())
  );

  const exportRecipes = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(recipes, null, 2));
    const a = document.createElement("a");
    a.href = dataStr;
    a.download = "unser-kochbuch.json";
    a.click();
  };

  const importRecipes = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          setRecipes(imported);
          alert("Rezepte erfolgreich importiert!");
        } else {
          alert("Ungültiges Format!");
        }
      } catch {
        alert("Fehler beim Import!");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      {!showForm && !selectedRecipe && (
        <>
          <h1 className="text-2xl font-bold mb-4">📖 Unser Kochbuch</h1>
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setShowForm(true)}
              className="p-2 bg-green-500 text-white rounded"
            >
              ➕ Rezept hinzufügen
            </button>
            <button
              onClick={exportRecipes}
              className="p-2 bg-blue-500 text-white rounded"
            >
              📤 Exportieren
            </button>
            <label className="p-2 bg-yellow-500 text-white rounded cursor-pointer">
              📥 Importieren
              <input
                type="file"
                accept="application/json"
                className="hidden"
                onChange={importRecipes}
              />
            </label>
          </div>
          <input
            type="text"
            placeholder="🔍 Rezepte suchen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-2 border rounded mb-4"
          />
          <div className="grid grid-cols-2 gap-4">
            {filteredRecipes.map((r, index) => (
              <div
                key={index}
                className="border rounded p-2 cursor-pointer"
                onClick={() => setSelectedRecipe(r)}
              >
                {r.image && (
                  <img
                    src={r.image}
                    alt={r.title}
                    className="w-full h-32 object-cover mb-2 rounded"
                  />
                )}
                <h2 className="font-bold">{r.title}</h2>
              </div>
            ))}
          </div>
        </>
      )}

      {showForm && (
        <div>
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
            ref={ingredientsRef}
            value={newRecipe.ingredients}
            onChange={(e) => handleInputChange(e, "ingredients")}
            placeholder="Zutaten"
            className="w-full p-2 border rounded mb-2 resize-none overflow-hidden"
            rows={2}
          />
          <textarea
            ref={instructionsRef}
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
          <button
            onClick={addRecipe}
            className="p-2 bg-green-500 text-white rounded mr-2"
          >
            ✅ Speichern
          </button>
          <button
            onClick={() => {
              setShowForm(false);
              setEditIndex(null);
              setNewRecipe({ title: "", ingredients: "", instructions: "", image: "" });
            }}
            className="p-2 bg-gray-500 text-white rounded"
          >
            ❌ Abbrechen
          </button>
        </div>
      )}

      {selectedRecipe && !showForm && (
        <div>
          <button
            onClick={() => setSelectedRecipe(null)}
            className="p-2 bg-gray-300 rounded mb-4"
          >
            ← Zurück
          </button>
          {selectedRecipe.image && (
            <img
              src={selectedRecipe.image}
              alt={selectedRecipe.title}
              className="w-full h-64 object-cover mb-4 rounded"
            />
          )}
          <h2 className="text-2xl font-bold mb-2">{selectedRecipe.title}</h2>
          <h3 className="font-semibold">Zutaten:</h3>
          <p className="whitespace-pre-line mb-2">{selectedRecipe.ingredients}</p>
          <h3 className="font-semibold">Anleitung:</h3>
          <p className="whitespace-pre-line">{selectedRecipe.instructions}</p>

          <button
            onClick={() => {
              const index = recipes.findIndex((r) => r === selectedRecipe);
              if (index !== -1) {
                setEditIndex(index);
                setNewRecipe(recipes[index]);
                setSelectedRecipe(null);
                setShowForm(true);
              }
            }}
            className="p-2 bg-yellow-500 text-white rounded mt-4 mr-2"
          >
            ✏️ Bearbeiten
          </button>
          <button
            onClick={() => {
              const index = recipes.findIndex((r) => r === selectedRecipe);
              if (index !== -1) deleteRecipe(index);
            }}
            className="p-2 bg-red-500 text-white rounded mt-4"
          >
            🗑️ Löschen
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
