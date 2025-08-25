import { useState, useEffect, ChangeEvent } from "react";

// 🔹 Rezept-Typ inkl. Bild (als Base64)
type Recipe = {
  title: string;
  ingredients: string;
  instructions: string;
  image?: string; // Base64-Bild
};

function App() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [newRecipe, setNewRecipe] = useState<Recipe>({
    title: "",
    ingredients: "",
    instructions: "",
    image: undefined,
  });
  const [showForm, setShowForm] = useState(false);

  // Rezepte aus localStorage laden
  useEffect(() => {
    const saved = localStorage.getItem("recipes");
    if (saved) setRecipes(JSON.parse(saved));
  }, []);

  // Rezepte in localStorage speichern
  useEffect(() => {
    localStorage.setItem("recipes", JSON.stringify(recipes));
  }, [recipes]);

  // 🔹 Rezept hinzufügen
  const addRecipe = () => {
    setRecipes([...recipes, newRecipe]);
    setNewRecipe({ title: "", ingredients: "", instructions: "", image: undefined });
    setShowForm(false);
  };

  // 🔹 Bild komprimieren + als Base64 speichern
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxSize = 800; // maximale Kantenlänge
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7); // 70% Qualität
        setNewRecipe({ ...newRecipe, image: compressedBase64 });
      };
    };
    reader.readAsDataURL(file);
  };

  // 🔹 Rezepte exportieren
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

  // 🔹 Rezepte importieren
  const importRecipes = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        setRecipes(imported); // ersetzt alte Rezepte
      } catch (err) {
        alert("Fehler beim Import der Datei!");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">📖 Unser Kochbuch</h1>

      <div className="mb-6 flex gap-3">
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          ➕ Rezept hinzufügen
        </button>
        <button
          onClick={exportRecipes}
          className="bg-blue-600 text-white px-4 py-2 rounded"
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

      {/* Formular für neues Rezept */}
      {showForm && (
        <div className="mb-6 p-4 border rounded">
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
            onClick={addRecipe}
            className="bg-green-600 text-white px-4 py-2 rounded mt-3"
          >
            Speichern
          </button>
        </div>
      )}

      {/* Anzeige der Rezepte */}
      <div className="space-y-4">
        {recipes.map((recipe, index) => (
          <div key={index} className="border p-4 rounded">
            <h2 className="text-xl font-semibold">{recipe.title}</h2>
            {recipe.image && (
              <img
                src={recipe.image}
                alt={recipe.title}
                className="w-full max-h-64 object-cover rounded my-2"
              />
            )}
            <p className="mt-2">
              <strong>Zutaten:</strong> {recipe.ingredients}
            </p>
            <p>
              <strong>Anleitung:</strong> {recipe.instructions}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
