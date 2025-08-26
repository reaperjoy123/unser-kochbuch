import React, { useState, useEffect, ChangeEvent } from "react"

type Recipe = {
  title: string
  ingredients: string
  instructions: string
  image?: string
}

function App() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [newRecipe, setNewRecipe] = useState<Recipe>({
    title: "",
    ingredients: "",
    instructions: "",
    image: "",
  })
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Laden aus localStorage
  useEffect(() => {
    const stored = localStorage.getItem("recipes")
    if (stored) {
      setRecipes(JSON.parse(stored))
    }
  }, [])

  // Speichern in localStorage
  useEffect(() => {
    localStorage.setItem("recipes", JSON.stringify(recipes))
  }, [recipes])

  const addOrUpdateRecipe = () => {
    if (editIndex !== null) {
      const updated = [...recipes]
      updated[editIndex] = newRecipe
      setRecipes(updated)
      setEditIndex(null)
      setSelectedRecipe(newRecipe) // Nach Speichern in Rezept-Ansicht bleiben
    } else {
      setRecipes([...recipes, newRecipe])
    }
    setNewRecipe({ title: "", ingredients: "", instructions: "", image: "" })
    setShowForm(false)
  }

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target?.result as string
      img.onload = () => {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")!
        const maxSize = 300
        let width = img.width
        let height = img.height

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
        const dataUrl = canvas.toDataURL("image/jpeg", 0.7)
        setNewRecipe({ ...newRecipe, image: dataUrl })
      }
    }
    reader.readAsDataURL(file)
  }

  const exportRecipes = () => {
    const dataStr = JSON.stringify(recipes, null, 2)
    const blob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "unser-kochbuch.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  const importRecipes = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string)
        if (Array.isArray(imported)) {
          setRecipes(imported)
        } else {
          alert("Ungültiges Format")
        }
      } catch {
        alert("Fehler beim Import")
      }
    }
    reader.readAsText(file)
  }

  const filteredRecipes = recipes.filter((r) =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // ✅ Hilfsfunktion für dynamische Textarea-Höhe
  const autoResize = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget
    target.style.height = "auto"
    target.style.height = target.scrollHeight + "px"
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">📖 Unser Kochbuch</h1>

      {!showForm && !selectedRecipe && (
        <div>
          <div className="flex gap-2 mb-4">
            <button
              className="bg-green-500 text-white px-3 py-1 rounded"
              onClick={() => setShowForm(true)}
            >
              ➕ Rezept hinzufügen
            </button>
            <button
              className="bg-blue-500 text-white px-3 py-1 rounded"
              onClick={exportRecipes}
            >
              📤 Exportieren
            </button>
            <label className="bg-purple-500 text-white px-3 py-1 rounded cursor-pointer">
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
            placeholder="🔍 Rezept suchen..."
            className="border p-2 w-full mb-4 rounded"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {/* Galerie */}
          <div className="grid grid-cols-2 gap-4">
            {filteredRecipes.map((r, i) => (
              <div
                key={i}
                className="border rounded p-2 cursor-pointer hover:bg-gray-100"
                onClick={() => setSelectedRecipe(r)}
              >
                {r.image && (
                  <img
                    src={r.image}
                    alt={r.title}
                    className="w-full h-32 object-cover rounded"
                  />
                )}
                <h2 className="font-bold mt-2">{r.title}</h2>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rezept-Detailansicht */}
      {selectedRecipe && !showForm && (
        <div className="border p-4 rounded">
          {selectedRecipe.image && (
            <img
              src={selectedRecipe.image}
              alt={selectedRecipe.title}
              className="w-full h-48 object-cover rounded mb-4"
            />
          )}
          <h2 className="text-xl font-bold mb-2">{selectedRecipe.title}</h2>
          <p className="whitespace-pre-line mb-2">
            <strong>Zutaten:</strong>
            {"\n"}
            {selectedRecipe.ingredients}
          </p>
          <p className="whitespace-pre-line mb-4">
            <strong>Anleitung:</strong>
            {"\n"}
            {selectedRecipe.instructions}
          </p>
          <div className="flex gap-2">
            <button
              className="bg-yellow-500 text-white px-3 py-1 rounded"
              onClick={() => {
                const index = recipes.findIndex((r) => r === selectedRecipe)
                if (index !== -1) {
                  setEditIndex(index)
                  setNewRecipe(recipes[index])
                  setSelectedRecipe(null)
                  setShowForm(true)
                }
              }}
            >
              ✏️ Bearbeiten
            </button>
            <button
              className="bg-red-500 text-white px-3 py-1 rounded"
              onClick={() => {
                if (
                  window.confirm(
                    `Soll das Rezept "${selectedRecipe.title}" wirklich gelöscht werden?`
                  )
                ) {
                  setRecipes(recipes.filter((r) => r !== selectedRecipe))
                  setSelectedRecipe(null)
                }
              }}
            >
              🗑️ Löschen
            </button>
            <button
              className="bg-gray-500 text-white px-3 py-1 rounded"
              onClick={() => setSelectedRecipe(null)}
            >
              ⬅️ Zurück
            </button>
          </div>
        </div>
      )}

      {/* Formular für neues/bearbeitetes Rezept */}
      {showForm && (
        <div className="border p-4 rounded">
          <input
            className="border p-2 w-full mb-2 rounded"
            placeholder="Rezeptname"
            value={newRecipe.title}
            onChange={(e) => setNewRecipe({ ...newRecipe, title: e.target.value })}
          />
          <textarea
            className="border p-2 w-full mb-2 rounded"
            placeholder="Zutaten"
            value={newRecipe.ingredients}
            onChange={(e) =>
              setNewRecipe({ ...newRecipe, ingredients: e.target.value })
            }
            onInput={autoResize}
          />
          <textarea
            className="border p-2 w-full mb-2 rounded"
            placeholder="Anleitung"
            value={newRecipe.instructions}
            onChange={(e) =>
              setNewRecipe({ ...newRecipe, instructions: e.target.value })
            }
            onInput={autoResize}
          />
          <input type="file" accept="image/*" onChange={handleImageUpload} />
          <div className="flex gap-2 mt-2">
            <button
              className="bg-green-500 text-white px-3 py-1 rounded"
              onClick={addOrUpdateRecipe}
            >
              💾 Speichern
            </button>
            <button
              className="bg-gray-500 text-white px-3 py-1 rounded"
              onClick={() => {
                setShowForm(false)
                setEditIndex(null)
                setSelectedRecipe(null)
                setNewRecipe({
                  title: "",
                  ingredients: "",
                  instructions: "",
                  image: "",
                })
              }}
            >
              ❌ Abbrechen
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
