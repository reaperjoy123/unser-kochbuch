import { useState } from "react";

function App() {
  const [recipes, setRecipes] = useState<string[]>([]);
  const [newRecipe, setNewRecipe] = useState("");

  const addRecipe = () => {
    if (!newRecipe.trim()) return;
    setRecipes([...recipes, newRecipe]);
    setNewRecipe("");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-4">Unser Kochbuch</h1>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newRecipe}
          onChange={(e) => setNewRecipe(e.target.value)}
          placeholder="Neues Rezept..."
          className="border p-2 rounded flex-1"
        />
        <button
          onClick={addRecipe}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Hinzufügen
        </button>
      </div>

      <ul className="space-y-2">
        {recipes.map((recipe, index) => (
          <li key={index} className="bg-white p-3 rounded shadow">
            {recipe}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
