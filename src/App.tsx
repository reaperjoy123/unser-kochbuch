import React, { useState, useEffect, useRef } from "react";
import "./App.css";

interface Recipe {
  title: string;
  ingredients: string;
  instructions: string;
  image?: string; // Base64 Bild
}

function App() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [newRecipe, setNewRecipe] = useState<Recipe>({
    title: "",
    ingredients: "",
    instructions: "",
  });
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const ingredientsRef = useRef<HTMLTextAreaElement>(null);
  const instructionsRef = useRef<HTMLTextAreaElement>(null);
  
  const [shrinkHeader, setShrinkHeader] = useState(false);


  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setShrinkHeader(true);
      } else {
        setShrinkHeader(false);
      }
    };

  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
}, []);

  // ✅ Rezepte aus localStorage laden
  useEffect(() => {
    const stored = localStorage.getItem("recipes");
    if (stored) {
      setRecipes(JSON.parse(stored));
    }
  }, []);

  // ✅ Rezepte in localStorage speichern
  useEffect(() => {
    localStorage.setItem("recipes", JSON.stringify(recipes));
  }, [recipes]);

  // ✅ Textarea automatisch an Inhalt anpassen
  useEffect(() => {
    if (ingredientsRef.current) {
      ingredientsRef.current.style.height = "auto";
      ingredientsRef.current.style.height =
        ingredientsRef.current.scrollHeight + "px";
    }
    if (instructionsRef.current) {
      instructionsRef.current.style.height = "auto";
      instructionsRef.current.style.height =
        instructionsRef.current.scrollHeight + "px";
    }
  }, [newRecipe]);

  // ✅ Bild laden + crop auf 400x300
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const targetWidth = 400;
        const targetHeight = 300;
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // crop mittig
        const aspectTarget = targetWidth / targetHeight;
        const aspectImg = img.width / img.height;

        let sx = 0,
          sy = 0,
          sWidth = img.width,
          sHeight = img.height;

        if (aspectImg > aspectTarget) {
          // Bild zu breit → seitlich beschneiden
          sWidth = img.height * aspectTarget;
          sx = (img.width - sWidth) / 2;
        } else {
          // Bild zu hoch → oben/unten beschneiden
          sHeight = img.width / aspectTarget;
          sy = (img.height - sHeight) / 2;
        }

        ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, targetWidth, targetHeight);

        const compressed = canvas.toDataURL("image/jpeg", 0.8);
        setNewRecipe({ ...newRecipe, image: compressed });
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // ✅ Rezept hinzufügen oder bearbeiten
  const addOrUpdateRecipe = () => {
    if (!newRecipe.title.trim()) return;

    if (editIndex !== null) {
      const updated = [...recipes];
      updated[editIndex] = newRecipe;
      setRecipes(updated);
      setEditIndex(null);
      setSelectedRecipe(newRecipe); // bleibt im Rezept
    } else {
      setRecipes([...recipes, newRecipe]);
      setSelectedRecipe(newRecipe); // direkt anzeigen
    }

    setNewRecipe({ title: "", ingredients: "", instructions: "" });
    setShowForm(false);
  };

  // ✅ Rezept löschen mit Bestätigung
  const deleteRecipe = (index: number) => {
    if (window.confirm("Willst du dieses Rezept wirklich löschen?")) {
      const updated = recipes.filter((_, i) => i !== index);
      setRecipes(updated);
      setSelectedRecipe(null);
    }
  };

  // ✅ Export
  const exportRecipes = () => {
    const blob = new Blob([JSON.stringify(recipes)], {
      type: "application/json",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "unser-kochbuch.json";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  // ✅ Import
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
      } catch {
        alert("Ungültige Datei!");
      }
    };
    reader.readAsText(file);
  };

  // ✅ Gefilterte Rezepte
  const filtered = recipes.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <header className={shrinkHeader ? "shrink" : ""}>
        <img 
		  src="/logo.png"
		  alt="Logo"
		  onClick={() => {
		    setSelectedRecipe(null);
			setEditIndex(null);
			setShowForm(false);
		  }}
		  style={{ cursor: "pointer" }}
		/>
        <h1>Unser Kochbuch</h1>
      </header>

      {/* Toolbar */}
	  {!selectedRecipe && editIndex === null && (
        <div style={{ padding: "15px" }}>
          <button
            onClick={() => {
              setShowForm(true);
              setEditIndex(null);
              setNewRecipe({ title: "", ingredients: "", instructions: "" });
            }}
          >
            Rezept hinzufügen
          </button>
          <button onClick={exportRecipes}>Exportieren</button>
		  {/* Import-Button styled */}
		  <label htmlFor="importFile">
		    <button>Importieren</button>
		  </label>
          <input
		    id="importFile"
            type="file"
            accept="application/json"
            onChange={(e) => {
			  importRecipes(e);
			  // Eingabefeld zurücksetzen, damit beim nächsten Klick wieder onChange ausgelöst wird
			  (e.target as HTMLInputElement).value = "";
			}}
            style={{ display: "none" }}
          />
          <input
            type="text"
            placeholder="Suche..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ marginLeft: "10px", padding: "5px" }}
          />
        </div>
	  )}

      {/* Formular */}
      {showForm && (
        <div className="recipe-card">
          <input
            type="text"
            placeholder="Titel"
            value={newRecipe.title}
            onChange={(e) => setNewRecipe({ ...newRecipe, title: e.target.value })}
          />
          <textarea
            ref={ingredientsRef}
            placeholder="Zutaten"
            value={newRecipe.ingredients}
            onChange={(e) =>
              setNewRecipe({ ...newRecipe, ingredients: e.target.value })
            }
            style={{ resize: "none", overflow: "hidden" }}
          />
          <textarea
            ref={instructionsRef}
            placeholder="Anleitung"
            value={newRecipe.instructions}
            onChange={(e) =>
              setNewRecipe({ ...newRecipe, instructions: e.target.value })
            }
            style={{ resize: "none", overflow: "hidden" }}
          />
          <input type="file" accept="image/*" onChange={handleImageUpload} />
          <button onClick={addOrUpdateRecipe}>
            {editIndex !== null ? "Speichern" : "Hinzufügen"}
          </button>
          <button
            onClick={() => {
              setShowForm(false);
              setEditIndex(null);
              setNewRecipe({ title: "", ingredients: "", instructions: "" });
            }}
          >
            Abbrechen
          </button>
        </div>
      )}

      {/* Rezept-Detailansicht */}
      {selectedRecipe && !showForm && (
        <div className="recipe-card">
          <h2>{selectedRecipe.title}</h2>
          {selectedRecipe.image && (
            <img
              src={selectedRecipe.image}
              alt={selectedRecipe.title}
              className="recipe-image"
            />
          )}
          <h3>Zutaten</h3>
		  <p className="recipe-text">{selectedRecipe.ingredients}</p>
          <h3>Anleitung</h3>
		  <p className="recipe-text">{selectedRecipe.instructions}</p>
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
            onClick={() =>
              deleteRecipe(recipes.findIndex((r) => r === selectedRecipe))
            }
          >
            Löschen
          </button>
          <button onClick={() => setSelectedRecipe(null)}>Zurück</button>
        </div>
      )}

      {/* Galerie */}
      {!selectedRecipe && !showForm && (
        <div style={{ display: "flex", flexWrap: "wrap", padding: "10px" }}>
          {filtered.map((recipe, index) => (
            <div
              key={index}
              className="recipe-card"
              onClick={() => setSelectedRecipe(recipe)}
              style={{ width: "200px" }}
            >
              {recipe.image && (
                <img
                  src={recipe.image}
                  alt={recipe.title}
                  style={{ width: "100%", borderRadius: "8px" }}
                />
              )}
              <h3>{recipe.title}</h3>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
