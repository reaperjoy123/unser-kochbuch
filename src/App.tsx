import { useState, useEffect } from "react";

type Recipe = {
  title: string;
  ingredients: string;
  instructions: string;
};

function App() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [newRecipe, setNewRecipe] = useState<Recipe>({
    title: "",
    ingredients: "",
    instructions: "",
  });

  // Rezepte aus LocalStorage laden
  useEffect(() => {
    const stored = localStorage.getItem("recipes");
    if (stored) {
      setRecipes(JSON.parse(stored));
    }
  }, []);

  // Rezepte im LocalStorage speichern
  useEffect(() => {
    localStorage.setItem("recipes", JSON.stringify(recipes));
  }, [recipes]);

  const addRecipe = () => {
    if (!newRecipe.title) return;
    setRecipes([...recipes, newRecipe]);
    setNewRecipe({ title: "", ingredients: "", instructions: "" });
  };

  // 📤 Export: Rezepte als JSON-Datei herunterladen
  const exportRecipes = () => {
    const dataStr = JSON.stringify(recipes, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "kochbuch.json";
    a.click();

    URL.revokeObjectURL(url);
  };

  // 📥 Import: JSON-Datei einlesen
  const importRecipes = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          setRecipes(imported);
        } else {
          alert("Ungültiges Format!");
        }
      } catch (err) {
        alert("Fehler beim Import!");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Unser Kochbuch</h1>

      {/* Neues Rezept */}
      <div className="space-y-2 mb-4">
        <input
          type="text"
          placeholder="Titel"
          value={newRecipe.title}
          onChange={(e) => setNewRecipe({ ...newRecipe, title: e.target.value })}
          className="border p-2 w-full"
        />
        <textarea
          placeholder="Zutaten"
          value={newRecipe.ingredients}
          onChange={(e) =>
            setNewRecipe({ ...newRecipe, ingredients: e.target.value })
          }
          className="border p-2 w-full"
        />
        <textarea
          placeholder="Zubereitung"
          value={newRecipe.instructions}
          onChange={(e) =>
            setNewRecipe({ ...newRecipe, instructions: e.target.value })
          }
          className="border p-2 w-full"
        />
        <button
          onClick={addRecipe}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Rezept hinzufügen
        </button>
      </div>

      {/* Export / Import */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={exportRecipes}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Exportieren
        </button>
        <label className="bg-gray-500 text-white px-4 py-2 rounded cursor-pointer">
          Importieren
          <input
            type="file"
            accept="application/json"
            onChange={importRecipes}
            className="hidden"
          />
        </label>
      </div>

      {/* Liste der Rezepte */}
      <ul className="space-y-4">
        {recipes.map((r, i) => (
          <li key={i} className="border p-3 rounded">
            <h2 className="font-bold">{r.title}</h2>
            <p>
              <strong>Zutaten:</strong> {r.ingredients}
            </p>
            <p>
              <strong>Zubereitung:</strong> {r.instructions}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
