// Product details live in one array so every page can use the same catalog.
const products = [
  { id: "iphone-16", name: "iPhone 16", category: "Smartphones", price: 1425000, rating: 4.9, image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80", featured: true },
  { id: "galaxy-s25", name: "Samsung Galaxy S25", category: "Smartphones", price: 1380000, rating: 4.8, image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80", featured: true },
  { id: "macbook-air", name: "MacBook Air 13″", category: "Laptops", price: 2450000, rating: 4.9, image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80", featured: true },
  { id: "hp-spectre", name: "HP Spectre x360", category: "Laptops", price: 2180000, rating: 4.7, image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80", featured: false },
  { id: "airpods-pro", name: "AirPods Pro (2nd Gen)", category: "Audio", price: 485000, rating: 4.8, image: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=800&q=80", featured: true },
  { id: "sony-headphones", name: "Sony WH-1000XM5", category: "Audio", price: 625000, rating: 4.9, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80", featured: false },
  { id: "galaxy-watch", name: "Samsung Galaxy Watch7", category: "Smartwatches", price: 395000, rating: 4.6, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80", featured: true },
  { id: "apple-watch", name: "Apple Watch Series 10", category: "Smartwatches", price: 710000, rating: 4.8, image: "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?auto=format&fit=crop&w=800&q=80", featured: false },
  { id: "wireless-charger", name: "MagSafe Charging Stand", category: "Accessories", price: 95000, rating: 4.5, image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80", featured: false },
  { id: "portable-speaker", name: "Bose SoundLink Flex", category: "Accessories", price: 275000, rating: 4.7, image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&q=80", featured: false }
];
