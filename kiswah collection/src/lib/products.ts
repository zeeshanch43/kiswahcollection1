
export type Family = "Oud" | "Woody" | "Floral" | "Musk" | "Attar" | "Fresh";
export const FAMILIES: Family[] = ["Oud", "Woody", "Floral", "Musk", "Attar", "Fresh"];

export type Product = {
  id: string;
  name: string;
  family: Family;
  volume: string;
  price: number;
  images: (string | null)[]; // add photo URLs/imports later
  notes: { top: string; heart: string; base: string };
  description: string;
  longevity: number; // 1-5
};

export const PRODUCTS: Product[] = [
  { id: "amber-oud", name: "Amber Oud", family: "Oud", volume: "100ml", price: 8500, images: [null, null, null],
    notes: { top: "Saffron", heart: "Cambodian Oud", base: "Amber" },
    description: "A regal blend of smoky Cambodian oud wrapped in warm amber and a whisper of saffron. Crafted in Riyadh for those who leave a lasting impression.", longevity: 5 },
  { id: "dahn-al-oud", name: "Dahn Al Oud Royale", family: "Attar", volume: "12ml", price: 6500, images: [null, null, null],
    notes: { top: "Bergamot", heart: "Aged Oud Oil", base: "Sandalwood" },
    description: "Pure concentrated attar oil, alcohol-free and aged for richness. A few drops last all day on skin and clothing.", longevity: 5 },
  { id: "ward-taifi", name: "Ward Taifi", family: "Floral", volume: "50ml", price: 4500, images: [null, null, null],
    notes: { top: "Pink Pepper", heart: "Taif Rose", base: "White Musk" },
    description: "The legendary Taif rose of the Hijaz mountains, softened with clean white musk. Elegant, feminine and timeless.", longevity: 4 },
  { id: "musk-tahara", name: "Musk Al Tahara", family: "Musk", volume: "50ml", price: 3800, images: [null, null, null],
    notes: { top: "Lily", heart: "Powdery Musk", base: "Vanilla" },
    description: "A creamy, comforting white musk inspired by the traditional Musk Tahara. Soft and close to the skin.", longevity: 3 },
  { id: "sandal-majlis", name: "Sandal Majlis", family: "Woody", volume: "100ml", price: 7200, images: [null, null, null],
    notes: { top: "Cardamom", heart: "Mysore Sandalwood", base: "Cedar" },
    description: "The warmth of a Saudi majlis — spiced cardamom over creamy sandalwood and dry cedar.", longevity: 4 },
  { id: "oud-mubakhar", name: "Oud Mubakhar", family: "Oud", volume: "75ml", price: 9800, images: [null, null, null],
    notes: { top: "Rose", heart: "Bakhoor Smoke", base: "Agarwood" },
    description: "Inspired by incense-perfumed homes on Eid. Deep agarwood, smouldering bakhoor and a touch of rose.", longevity: 5 },
  { id: "nasim-sahra", name: "Nasim Al Sahra", family: "Fresh", volume: "100ml", price: 4200, images: [null, null, null],
    notes: { top: "Citrus", heart: "Sea Breeze", base: "Ambergris" },
    description: "A cool desert breeze at dawn. Sparkling citrus and marine accords over a soft ambergris base.", longevity: 3 },
  { id: "jannat-firdaus", name: "Jannat Al Firdaus", family: "Attar", volume: "6ml", price: 2500, images: [null, null, null],
    notes: { top: "Green Leaves", heart: "Jasmine", base: "Musk" },
    description: "A classic, beloved attar — green, floral and gently musky. Concentrated oil, ideal for daily wear.", longevity: 4 },
];

export const formatPKR = (n: number) => `Rs. ${n.toLocaleString("en-PK")}`;
