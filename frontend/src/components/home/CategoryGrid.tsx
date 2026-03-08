import Link from "next/link";
import Image from "next/image";

const CATEGORIES = [
  {
    label: "Men",
    href: "/men",
    image: "https://picsum.photos/seed/men-category/600/800",
    description: "Shop Men's Collection",
    color: "from-blue-900/70 to-blue-900/20",
  },
  {
    label: "Women",
    href: "/women",
    image: "https://picsum.photos/seed/women-category/600/800",
    description: "Shop Women's Collection",
    color: "from-pink-900/70 to-pink-900/20",
  },
  {
    label: "Kids",
    href: "/kids",
    image: "https://picsum.photos/seed/kids-category/600/800",
    description: "Shop Kids' Collection",
    color: "from-green-900/70 to-green-900/20",
  },
];

export function CategoryGrid() {
  return (
    <section className="container mx-auto px-4 py-10">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Shop by Category</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.href}
            href={cat.href}
            className="group relative overflow-hidden rounded-2xl h-72 sm:h-96"
          >
            <Image
              src={cat.image}
              alt={cat.label}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, 33vw"
            />
            <div className={`absolute inset-0 bg-gradient-to-t ${cat.color}`} />
            <div className="absolute bottom-0 left-0 p-6 text-white">
              <h3 className="text-2xl font-bold">{cat.label}</h3>
              <p className="text-sm text-white/80 mt-1">{cat.description}</p>
              <span className="mt-3 inline-block text-sm font-semibold text-white border-b border-white pb-0.5 group-hover:text-white/80 transition-colors">
                Shop Now →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
