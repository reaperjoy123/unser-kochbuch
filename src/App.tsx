import { useState } from "react";
import type { ChangeEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Recipe {
  id: number;
  title: string;
  description: string;
  image?: string;
}

function App() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [search, setSearch] = useState("");
  const [newRecipe, setNewRecipe] = useState<Omit<Recipe, "id">>({
    title: "",
    description: "",
    image: undefined,
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  // ✅ Rezept speichern oder bearbeiten
  const handleAddRecipe = () => {
    if (!newRecipe.title.trim()) return;

    if (editingId) {
      setRecipes((prev) =>
        prev.map((r) => (r.id === editingId ? { ...r, ...newRecipe } : r))
      );
      setEditingId(null);
    } else {
      setRecipes((prev) => [...prev, { id: Date.now(), ...newRecipe }]);
    }

    setNewRecipe({ title: "", description: "", image: undefined });
  };

  // ✅ Löschen
  const handleDeleteRecipe = (id: number) => {
    setRecipes((prev) => prev.filter((r) => r.id !== id));
  };

  // ✅ Bearbeiten
  const handleEditRecipe = (id: number) => {
    const recipe = recipes.find((r) => r.id === id);
    if (recipe) {
      setNewRecipe({
        title: recipe.title,
        description: recipe.description,
        image: recipe.image,
      });
      setEditingId(id);
    }
  };

  // ✅ Bild hochladen mit Kompression
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.src = ev.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const size = 200;
        canvas.width = size;
        canvas.height = size;

        const aspect = img.width / img.height;
        let sx = 0,
          sy = 0,
          sWidth = img.width,
          sHeight = img.height;

        if (aspect > 1) {
          sWidth = img.height;
          sx = (img.width - img.height) / 2;
        } else {
          sHeight = img.width;
          sy = (img.height - img.width) / 2;
        }

        ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, size, size);
        const compressed = canvas.toDataURL("image/jpeg", 0.7);
        setNewRecipe((prev) => ({ ...prev, image: compressed }));
      };
    };
    reader.readAsDataURL(file);
  };

  const filteredRecipes = recipes.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">📖 Unser Kochbuch</h1>

      {/* Rezeptformular */}
      <div className="bg-white p-4 rounded-2xl shadow mb-6">
        <input
          type="text"
          placeholder="Rezeptname"
          value={newRecipe.title}
          onChange={(e) =>
            setNewRecipe((prev) => ({ ...prev, title: e.target.value }))
          }
          className="border p-2 rounded w-full mb-2"
        />
        <textarea
          placeholder="Beschreibung"
          value={newRecipe.description}
          onChange={(e) =>
            setNewRecipe((prev) => ({ ...prev, description: e.target.value }))
          }
          className="border p-2 rounded w-full mb-2"
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
        <button
          onClick={handleAddRecipe}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          {editingId ? "Änderungen speichern" : "Rezept hinzufügen"}
        </button>
      </div>

      {/* Suche */}
      <input
        type="text"
        placeholder="🔍 Rezepte durchsuchen..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border p-2 rounded w-full mb-6"
      />

      {/* Rezeptliste */}
      <AnimatePresence>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRecipes.map((r) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-2xl shadow p-4 flex flex-col"
            >
              {r.image && (
                <img
                  src={r.image}
                  alt={r.title}
                  className="w-full h-48 object-cover rounded mb-2"
                />
              )}
              <h2 className="text-xl font-semibold">{r.title}</h2>
              <p className="text-gray-600 flex-grow">{r.description}</p>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleEditRecipe(r.id)}
                  className="bg-blue-500 text-white px-2 py-1 rounded"
                >
                  Bearbeiten
                </button>
                <button
                  onClick={() => handleDeleteRecipe(r.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Löschen
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>
    </div>
  );
}

export default App;
