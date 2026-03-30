import { NextResponse } from 'next/server'

export async function GET() {
  const products = [
    { id: 1, name: "Macallan 12Y", brand: "Macallan", country: "Scotland", category: "Single Malt", age: "12Y", volume: "700ml", price: 169, img: "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400&h=400&fit=crop" },
    { id: 2, name: "Macallan 18Y", brand: "Macallan", country: "Scotland", category: "Single Malt", age: "18Y", volume: "700ml", price: 499, img: "https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=400&h=400&fit=crop" },
    { id: 3, name: "Glenfiddich 15Y", brand: "Glenfiddich", country: "Scotland", category: "Single Malt", age: "15Y", volume: "700ml", price: 129, img: "https://images.unsplash.com/photo-1571104508999-893933ded431?w=400&h=400&fit=crop" },
    { id: 4, name: "Octomore 10.3", brand: "Octomore", country: "Scotland", category: "Single Malt", age: "NAS", volume: "700ml", price: 299, img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop" },
    { id: 5, name: "Yamazaki 12Y", brand: "Yamazaki", country: "Japan", category: "Single Malt", age: "12Y", volume: "700ml", price: 199, img: "https://images.unsplash.com/photo-1516594798947-e65505dbb29d?w=400&h=400&fit=crop" },
    { id: 6, name: "Yamazaki 18Y", brand: "Yamazaki", country: "Japan", category: "Single Malt", age: "18Y", volume: "700ml", price: 399, img: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=400&h=400&fit=crop" },
    { id: 7, name: "Hibiki 21Y", brand: "Hibiki", country: "Japan", category: "Blended", age: "21Y", volume: "700ml", price: 459, img: "https://images.unsplash.com/photo-1549439602-43ebca2327af?w=400&h=400&fit=crop" },
    { id: 8, name: "Hakushu 12Y", brand: "Hakushu", country: "Japan", category: "Single Malt", age: "12Y", volume: "700ml", price: 189, img: "https://images.unsplash.com/photo-1562601579-599dec564e06?w=400&h=400&fit=crop" },
    { id: 9, name: "Kavalan Concert", brand: "Kavalan", country: "Taiwan", category: "Single Malt", age: "NAS", volume: "700ml", price: 89, img: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&h=400&fit=crop" },
    { id: 10, name: "Kavalan Solo", brand: "Kavalan", country: "Taiwan", category: "Single Malt", age: "NAS", volume: "700ml", price: 69, img: "https://images.unsplash.com/photo-1573270689103-d7a4e42b609a?w=400&h=400&fit=crop" },
    { id: 11, name: "Omar Sherry", brand: "Omar", country: "Taiwan", category: "Single Malt", age: "NAS", volume: "700ml", price: 99, img: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&h=400&fit=crop" },
    { id: 12, name: "W.L. Weller 12Y", brand: "W.L. Weller", country: "USA", category: "Bourbon", age: "12Y", volume: "750ml", price: 79, img: "https://images.unsplash.com/photo-1560807707-8cc77767d783?w=400&h=400&fit=crop" },
    { id: 13, name: "Jack Daniel's No.7", brand: "Jack Daniel's", country: "USA", category: "Bourbon", age: "NAS", volume: "1000ml", price: 59, img: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400&h=400&fit=crop" },
    { id: 14, name: "Glenlivet 15Y", brand: "Glenlivet", country: "Scotland", category: "Single Malt", age: "15Y", volume: "700ml", price: 149, img: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&h=400&fit=crop" },
    { id: 15, name: "Talisker 18Y", brand: "Talisker", country: "Scotland", category: "Single Malt", age: "18Y", volume: "700ml", price: 229, img: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop" },
  ]

  return NextResponse.json(products)
}
