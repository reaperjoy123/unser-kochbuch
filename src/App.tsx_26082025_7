import React, { useEffect, useState } from "react"

interface Recipe {
  title: string
  ingredients: string
  instructions: string
  image?: string
}

export default function App() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [newRecipe, setNewRecipe] = useState<Recipe>({
    title: "",
    ingredients: "",
    instructions: "",
  })
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState("")

  // Textarea Refs für auto-resize
  const ingredientsRef = React.useRef<HTMLTextAreaElement>(null)
  const instructionsRef = React.useRef<HTMLTextAreaElement>(null)

  // Auto-resize Funktion
  const autoResize = (el: HTMLTextAreaElement | null) => {
    if (el) {
      el.style.height = "auto"
      el.style.height = el.scrollHeight + "px"
    }
  }

  // Rezepte aus localStorage laden
  useEffect(() => {
    const saved = localStorage.getItem("recipes")
    if (saved) {
      setRecipes(JSON.parse(saved))
    }
  }, [])

  // Änderungen speichern
  useEffect(() => {
    localStorage.setItem("recipes", JSON.stringify(recipes))
  }, [recipes])

  // Auto-resize bei geladenem Rezept (z.B. beim Bearbeiten)
  useEffect(() => {
    autoResize(ingredientsRef.current)
    autoResize(instructionsRef.current)
  }, [newRecipe])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const img = new Image()
        img.src = reader.result as string
        img.onload = () => {
          const canvas = document.createElement("canvas")
          const ctx = canvas.getContext("2d")!
          const maxSize = 300
          let { width, height } = img
          if (width > height) {
            if (width > maxSize) {
              height *= maxSize / width
              width = maxSize
            }
          } else {
            if (height > maxSize) {
              width *= maxSize / height
              height = maxSize
            }
          }
          canvas.width = width
          canvas.height = height
          ctx.drawImage(img, 0, 0, width, height)
          const compressed = canvas.toDataURL("image/jpeg", 0.7)
          setNewRecipe({ ...newRecipe, image: compressed })
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const addOrUpdateRecipe = () => {
    if (editIndex !== null) {
      const updated = [...recipes]
      updated[editIndex] = newRecipe
      setRecipes(updated)
      setEditIndex(null)
      setSelectedRecipe(newRecipe) // bleibt im Rezept nach Speichern
    } else {
      setRecipes([...recipes, newRecipe])
      setSelectedRecipe(newRecipe) // direkt ins neue Rezept springen
    }
    setNewRecipe({ title: "", ingredients: "", instructions: "" })
    setShowForm(false)
  }

  const deleteRecipe = (index: number) => {
    if (window.confirm("Soll dieses Rezept wirklich gelöscht werden?")) {
      const updated = recipes.filter((_, i) => i !== index)
      setRecipes(updated)
      setSelectedRecipe(null)
    }
  }

  const exportRecipes = () => {
    const blob = new Blob([JSON.stringify(recipes, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "unser-kochbuch.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  const importRecipes = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string)
        if (Array.isArray(imported)) {
          setRecipes(imported)
        } else {
          alert("Ungültige Datei")
        }
      } catch {
        alert("Fehler beim Import")
      }
    }
    reader.readAsText(file)
    e.target.value = ""
  }

  const filteredRecipes = recipes.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4 text-center">🍲 Unser Kochbuch</h1>

      {!showForm && !selectedRecipe && (
        <>
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setShowForm(true)}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Rezept hinzufügen
            </button>
            <button
              onClick={exportRecipes}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Exportieren
            </button>
            <label className="bg-yellow-500 text-white px-4 py-2 rounded cursor-pointer">
              Importieren
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={importRecipes}
              />
            </label>
          </div>

          <input
            type="text"
            placeholder="Rezepte durchsuchen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border p-2 w-full mb-4 rounded"
          />

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {filteredRecipes.map((recipe, index) => (
              <div
                key={index}
                className="border rounded p-2 cursor-pointer hover:shadow"
                onClick={() => setSelectedRecipe(recipe)}
              >
                {recipe.image && (
                  <img
                    src={recipe.image}
                    alt={recipe.title}
                    className="w-full h-32 object-cover rounded mb-2"
                  />
                )}
                <h2 className="font-semibold text-center">{recipe.title}</h2>
              </div>
            ))}
          </div>
        </>
      )}

      {selectedRecipe && !showForm && (
        <div className="border p-4 rounded">
          {selectedRecipe.image && (
            <img
              src={selectedRecipe.image}
              alt={selectedRecipe.title}
              className="w-full h-64 object-cover rounded mb-4"
            />
          )}
          <h2 className="text-2xl font-bold mb-2">{selectedRecipe.title}</h2>
          <h3 className="font-semibold">Zutaten:</h3>
          <p className="mb-2 whitespace-pre-line">
            {selectedRecipe.ingredients}
          </p>
          <h3 className="font-semibold">Anleitung:</h3>
          <p className="whitespace-pre-line">{selectedRecipe.instructions}</p>

          <div className="flex gap-2 mt-4">
            <button
              onClick={() => {
                const index = recipes.findIndex((r) => r === selectedRecipe)
                if (index !== -1) {
                  setEditIndex(index)
                  setNewRecipe(recipes[index])
                  setSelectedRecipe(null)
                  setShowForm(true)
                }
              }}
              className="bg-yellow-500 text-white px-4 py-2 rounded"
            >
              Bearbeiten
            </button>
            <button
              onClick={() => {
                const index = recipes.findIndex((r) => r === selectedRecipe)
                if (index !== -1) deleteRecipe(index)
              }}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Löschen
            </button>
            <button
              onClick={() => setSelectedRecipe(null)}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Zurück
            </button>
          </div>
        </div>
      )}

      {showForm && (
        <div className="border p-4 rounded">
          <input
            className="border p-2 w-full mb-2 rounded"
            placeholder="Titel"
            value={newRecipe.title}
            onChange={(e) => setNewRecipe({ ...newRecipe, title: e.target.value })}
          />
          <textarea
            ref={ingredientsRef}
            className="border p-2 w-full mb-2 rounded"
            placeholder="Zutaten"
            value={newRecipe.ingredients}
            onChange={(e) =>
              setNewRecipe({ ...newRecipe, ingredients: e.target.value })
            }
            onInput={(e) => autoResize(e.currentTarget)}
          />
          <textarea
            ref={instructionsRef}
            className="border p-2 w-full mb-2 rounded"
            placeholder="Anleitung"
            value={newRecipe.instructions}
            onChange={(e) =>
              setNewRecipe({ ...newRecipe, instructions: e.target.value })
            }
            onInput={(e) => autoResize(e.currentTarget)}
          />

          <input type="file" accept="image/*" onChange={handleImageUpload} />

          <div className="flex gap-2 mt-4">
            <button
              onClick={addOrUpdateRecipe}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Speichern
            </button>
            <button
              onClick={() => {
                setShowForm(false)
                if (editIndex !== null) {
                  setSelectedRecipe(recipes[editIndex])
                  setEditIndex(null)
                }
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
