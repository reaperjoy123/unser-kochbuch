import { useState, useEffect } from "react";

type Recipe = {
  title: string;
  ingredients: string;
  instructions: string;
  image?: string; // Base64
};

export default function App() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [newRecipe, setNewRecipe] = useState<Recipe>({
    title: "",
    ingredients: "",
    instructions: "",
    image: "",
  });
  const [showForm, setShowForm] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // 🔹 Rezepte aus localStorage laden
  useEffect(() => {
    const saved = localStorage.getItem("recipes");
    if (saved) setRecipes(JSON.parse(saved));
  }, []);

  // 🔹 Rezepte speichern
  useEffect(() => {
    localStorage.setItem("recipes", JSON.stringify(recipes));
  }, [recipes]);

  // 🔹 Bild komprimieren & Base64 umwandeln
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxSize = 600;
        let { width, height } = img;
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
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
          setNewRecipe({ ...newRecipe, image: dataUrl });
        }
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // 🔹 Neues Rezept hinzufügen oder bestehendes speichern
  const saveRecipe = () => {
    if (!newRecipe.title.trim()) return;

    if (editIndex !== null) {
      const updated = [...recipes];
      updated[editIndex] = newRecipe;
      setRecipes(updated);
      setEditIndex(null);
	  setNewRecipe({ title: "", ingredients: "", instructions: "" });
	  setSelectedRecipe(updated[editIndex]); // ✅ zurück ins bearbeitete Rezept
    } else {
      setRecipes([...recipes, newRecipe]);
    }

    setNewRecipe({ title: "", ingredients: "", instructions: "", image: "" });
    setShowForm(false);
  };

  // 🔹 Rezept löschen
  const deleteRecipe = (index: number) => {
    if (window.confirm("Soll dieses Rezept wirklich gelöscht werden?")) {
      const updated = [...recipes];
      updated.splice(index, 1);
      setRecipes(updated);
      setSelectedRecipe(null);
	}
  };

  // 🔹 Importieren (alte Rezepte werden überschrieben)
  const importRecipes = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target?.result as string);
        if (Array.isArray(imported)) {
          setRecipes(imported);
        }
      } catch {
        alert("Fehler: Keine gültige JSON-Datei!");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // 🔹 Exportieren (immer unter „unser-kochbuch.json“)
  const exportRecipes = () => {
    const blob = new Blob([JSON.stringify(recipes)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "unser-kochbuch.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  // 🔹 Suche
  const filteredRecipes = recipes.filter(
    (r) =>
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.ingredients.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.instructions.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">📖 Unser Kochbuch</h1>

      {/* Detailansicht */}
      {selectedRecipe ? (
        <div className="mb-6 p-4 border rounded shadow">
          <h2 className="text-xl font-bold mb-2">{selectedRecipe.title}</h2>
          {selectedRecipe.image && (
            <img
              src={selectedRecipe.image}
              alt={selectedRecipe.title}
              className="w-full h-48 object-cover mb-3 rounded"
            />
          )}
          <h3 className="font-semibold">📝 Zutaten</h3>
          <p className="mb-2 whitespace-pre-line">{selectedRecipe.ingredients}</p>
          <h3 className="font-semibold">👩‍🍳 Anleitung</h3>
          <p className="whitespace-pre-line">{selectedRecipe.instructions}</p>

          <div className="flex gap-2 mt-4">
            <button
              onClick={() => {
			    const index = recipes.findIndex((r) => r === selectedRecipe);
				if (index !== -1) {
				  setEditIndex(index);
				  setNewRecipe(recipes[index]); // ✅ bestehendes Rezept in Formular laden
				  setSelectedRecipe(null);      // ✅ Detailansicht schließen
				}
			  }}
              className="bg-yellow-500 text-white px-4 py-2 rounded"
            >
              ✏️ Bearbeiten
            </button>
            <button
              onClick={() =>
                deleteRecipe(recipes.findIndex((r) => r === selectedRecipe))
              }
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              🗑️ Löschen
            </button>
            <button
              onClick={() => setSelectedRecipe(null)}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              ⬅️ Zurück
            </button>
          </div>
        </div>
      ) : editIndex !== null ? (
        // Bearbeiten-Ansicht
        <div className="mb-6 p-4 border rounded shadow">
          <h2 className="text-xl font-bold mb-3">✏️ Rezept bearbeiten</h2>
          <input
            type="text"
            placeholder="Titel"
            value={newRecipe.title}
            onChange={(e) =>
              setNewRecipe({ ...newRecipe, title: e.target.value })
            }
            className="border p-2 w-full mb-2"
          />
          <textarea
            placeholder="Zutaten"
            value={newRecipe.ingredients}
            onChange={(e) =>
              setNewRecipe({ ...newRecipe, ingredients: e.target.value })
            }
            className="border p-2 w-full mb-2"
          />
          <textarea
            placeholder="Anleitung"
            value={newRecipe.instructions}
            onChange={(e) =>
              setNewRecipe({ ...newRecipe, instructions: e.target.value })
            }
            className="border p-2 w-full mb-2"
          />
          <input type="file" accept="image/*" onChange={handleImageUpload} />
		  {newRecipe.image && (
		    <img
			  src={newRecipe.image}
			  alt="Preview"
			  className="w-full h-32 object-cover mt-2 rounded"
			/>
		  )}
          <div className="flex gap-3 mt-3">
            <button
              onClick={saveRecipe}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              💾 Änderungen speichern
            </button>
			<button
			  onClick={() => {
			    if (editIndex !== null) {
				  setSelectedRecipe(recipes[editIndex]); // ✅ zurück zum Rezept
				}
				setEditIndex(null);
				setNewRecipe({ title: "", ingredients: "", instructions: "" });
			  }}
            >
              ❌ Abbrechen
            </button>
          </div>
        </div>
      ) : (
        // Startseite
        <>
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              ➕ Rezept hinzufügen
            </button>
            <button
              onClick={exportRecipes}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              📤 Exportieren
            </button>
            <label className="bg-purple-600 text-white px-4 py-2 rounded cursor-pointer">
              📥 Importieren
              <input
                type="file"
                accept="application/json"
                onChange={importRecipes}
                className="hidden"
              />
            </label>
          </div>

          {/* Suchfeld */}
          <input
            type="text"
            placeholder="🔍 Suche nach Rezept..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border p-2 w-full mb-4"
          />

          {/* Formular neues Rezept */}
          {showForm && (
            <div className="mb-6 p-4 border rounded shadow">
              <h2 className="text-xl font-bold mb-3">Neues Rezept</h2>
              <input
                type="text"
                placeholder="Titel"
                value={newRecipe.title}
                onChange={(e) =>
                  setNewRecipe({ ...newRecipe, title: e.target.value })
                }
                className="border p-2 w-full mb-2"
              />
              <textarea
                placeholder="Zutaten"
                value={newRecipe.ingredients}
                onChange={(e) =>
                  setNewRecipe({ ...newRecipe, ingredients: e.target.value })
                }
                className="border p-2 w-full mb-2"
              />
              <textarea
                placeholder="Anleitung"
                value={newRecipe.instructions}
                onChange={(e) =>
                  setNewRecipe({ ...newRecipe, instructions: e.target.value })
                }
                className="border p-2 w-full mb-2"
              />
              <input type="file" accept="image/*" onChange={handleImageUpload} />
              <button
                onClick={saveRecipe}
                className="mt-3 bg-blue-600 text-white px-4 py-2 rounded"
              >
                ✅ Rezept speichern
              </button>
            </div>
          )}

          {/* Galerie */}
          <div className="grid grid-cols-2 gap-4">
            {filteredRecipes.map((r, idx) => (
              <div
                key={idx}
                className="border rounded shadow cursor-pointer p-2"
                onClick={() => setSelectedRecipe(r)}
              >
                {r.image && (
                  <img
                    src={r.image}
                    alt={r.title}
                    className="w-full h-32 object-cover mb-2 rounded"
                  />
                )}
                <h3 className="font-semibold">{r.title}</h3>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
