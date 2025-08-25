import { useState, useEffect } from "react";

type Recipe = {
  id: number;
  title: string;
  ingredients: string;
  instructions: string;
};

function App() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [title, setTitle] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [instructions, setInstructions] = useState("");
  const [showForm, setShowForm] = useState(false);

  // Lade gespeicherte Rezepte
  useEffect(() => {
    const saved = localStorage.getItem("recipes");
    if (saved) {
      setRecipes(JSON.parse(saved));
    }
  }, []);

  // Speichere Rezepte bei Änderungen
  useEffect(() => {
    localStorage.setItem("recipes", JSON.stringify(recipes));
  }, [recipes]);

  // Rezept hinzufügen
  const addRecipe = () => {
    if (!title.trim() || !ingredients.trim() || !instructions.trim()) return;

    const newRecipe: Recipe = {
      id: Date.now(),
      title,
      ingredients,
      instructions,
    };

    setRecipes([...recipes, newRecipe]);
    setTitle("");
    setIngredients("");
    setInstructions("");
    setShowForm(false); // Formular nach Speichern wieder ausblenden
  };

  // Rezept löschen
  const deleteRecipe = (id: number) => {
    setRecipes(recipes.filter((r) => r.id !== id));
  };

  // Rezepte exportieren
  const exportRecipes = () => {
    const blob = new Blob([JSON.stringify(recipes, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "unser-kochbuch.json"; // Fester Dateiname
    a.click();
    URL.revokeObjectURL(url);
  };

  // Rezepte importieren
  const importRecipes = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          setRecipes(imported);
        }
      } catch (error) {
        alert("Ungültige Datei!");
      }
    };
    reader.readAsText(file);

    // Eingabefeld zurücksetzen
    e.target.value = "";
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">📖 Unser Kochbuch</h1>

      {/* Button für Formular */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="bg-blue-500 text-white px-3 py-1 rounded mb-4"
      >
        {showForm ? "Abbrechen" : "Rezept hinzufügen"}
      </button>

      {/* Formular nur wenn showForm === true */}
      {showForm && (
        <div className="space-y-2 mb-4">
          <input
            type="text"
            placeholder="Titel"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border p-2 w-full rounded"
          />
          <textarea
            placeholder="Zutaten"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            className="border p-2 w-full rounded"
          />
          <textarea
            placeholder="Anleitung"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            className="border p-2 w-full rounded"
          />
          <button
            onClick={addRecipe}
            className="bg-green-500 text-white px-3 py-1 rounded"
          >
            Speichern
          </button>
        </div>
      )}

      {/* Export & Import */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={exportRecipes}
          className="bg-purple-500 text-white px-3 py-1 rounded"
        >
          Exportieren
        </button>
        <label className="bg-orange-500 text-white px-3 py-1 rounded cursor-pointer">
          Importieren
          <input
            type="file"
            accept="application/json"
            onChange={importRecipes}
            className="hidden"
          />
        </label>
      </div>

      {/* Rezeptliste */}
      <div className="space-y-4">
        {recipes.map((recipe) => (
          <div
            key={recipe.id}
            className="border rounded p-3 shadow flex justify-between items-start"
          >
            <div>
              <h2 className="font-semibold text-lg">{recipe.title}</h2>
              <p className="text-sm text-gray-600 whitespace-pre-line">
                {recipe.ingredients}
              </p>
              <p className="text-sm whitespace-pre-line">
                {recipe.instructions}
              </p>
            </div>
            <button
              onClick={() => deleteRecipe(recipe.id)}
              className="text-red-500 ml-4"
            >
              ❌
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
