import { useState } from "react";
import type { ChangeEvent } from "react";

interface Recipe {
  id: number;
  title: string;
  description: string;
  image?: string;
}

function App() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [search, setSearch] = useState("");
  // ggf. weitere States hier...
  
  return (
    <div>
      <h1>📖 Unser Kochbuch</h1>
      {/* dein UI */}
    </div>
  );
}

export default App;
