// Favorites/Wishlist functionality

const FAVORITES_KEY = 'user_favorites'

// Get all favorites
export function getFavorites(): string[] {
  const stored = localStorage.getItem(FAVORITES_KEY)
  return stored ? JSON.parse(stored) : []
}

// Add to favorites
export function addFavorite(propertyId: string): void {
  const favorites = getFavorites()
  if (!favorites.includes(propertyId)) {
    favorites.push(propertyId)
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
  }
}

// Remove from favorites
export function removeFavorite(propertyId: string): void {
  const favorites = getFavorites()
  const updated = favorites.filter(id => id !== propertyId)
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated))
}

// Check if property is favorited
export function isFavorite(propertyId: string): boolean {
  return getFavorites().includes(propertyId)
}

// Toggle favorite
export function toggleFavorite(propertyId: string): boolean {
  if (isFavorite(propertyId)) {
    removeFavorite(propertyId)
    return false
  } else {
    addFavorite(propertyId)
    return true
  }
}
