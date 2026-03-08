import "dotenv/config";
import { PrismaClient, Gender, Role } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { faker } from "@faker-js/faker";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const COLORS = [
  { name: "Black", hex: "#000000" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Navy", hex: "#1a237e" },
  { name: "Red", hex: "#d32f2f" },
  { name: "Blue", hex: "#1976d2" },
  { name: "Green", hex: "#388e3c" },
  { name: "Grey", hex: "#757575" },
  { name: "Beige", hex: "#d7ccc8" },
  { name: "Pink", hex: "#e91e63" },
  { name: "Brown", hex: "#795548" },
];

const BRANDS = {
  MEN: ["Allen Solly", "Peter England", "Van Heusen", "Arrow", "Louis Philippe", "Wrangler", "Levis", "Nike", "Adidas", "Puma"],
  WOMEN: ["W", "Biba", "Global Desi", "Aurelia", "Zara", "H&M", "Forever 21", "Mango", "Max", "Westside"],
  KIDS: ["H&M Kids", "Zara Kids", "Mothercare", "FirstCry", "Miniklub", "Hopscotch", "Gini & Jony", "United Colors", "The Children's Place", "Carter's"],
};

const SUB_CATEGORIES = [
  { name: "New Arrivals", slug: "new-arrivals", sortOrder: 1 },
  { name: "Best Sellers", slug: "best-sellers", sortOrder: 2 },
  { name: "Ethnic Wear", slug: "ethnic-wear", sortOrder: 3 },
  { name: "Western Wear", slug: "western-wear", sortOrder: 4 },
  { name: "Casual Wear", slug: "casual-wear", sortOrder: 5 },
  { name: "Formal Wear", slug: "formal-wear", sortOrder: 6 },
  { name: "Sportswear / Activewear", slug: "sportswear-activewear", sortOrder: 7 },
  { name: "Sleepwear / Loungewear", slug: "sleepwear-loungewear", sortOrder: 8 },
  { name: "Winter Wear", slug: "winter-wear", sortOrder: 9 },
  { name: "Summer Wear", slug: "summer-wear", sortOrder: 10 },
  { name: "Party Wear", slug: "party-wear", sortOrder: 11 },
  { name: "Workwear / Office Wear", slug: "workwear-office-wear", sortOrder: 12 },
  { name: "Innerwear / Lingerie", slug: "innerwear-lingerie", sortOrder: 13 },
  { name: "Swimwear / Beachwear", slug: "swimwear-beachwear", sortOrder: 14 },
  { name: "Maternity Wear", slug: "maternity-wear", sortOrder: 15 },  // Women only
  { name: "Plus Size", slug: "plus-size", sortOrder: 16 },
  { name: "Accessories", slug: "accessories", sortOrder: 17 },
  { name: "Footwear", slug: "footwear", sortOrder: 18 },
  { name: "Sale / Discounts", slug: "sale-discounts", sortOrder: 19 },
];

const PARENT_CATEGORIES = [
  { name: "Men", slug: "men", gender: Gender.MEN, sortOrder: 1 },
  { name: "Women", slug: "women", gender: Gender.WOMEN, sortOrder: 2 },
  { name: "Kids", slug: "kids", gender: Gender.KIDS, sortOrder: 3 },
];

const GENDER_PALETTES: Record<string, { bg: string; fg: string }[]> = {
  men: [
    { bg: "1e3a5f", fg: "e8f4f8" },
    { bg: "243b55", fg: "ddeeff" },
    { bg: "0d2137", fg: "cce0f5" },
    { bg: "2c3e6b", fg: "e8f0fe" },
    { bg: "1a2f4a", fg: "d8ecff" },
  ],
  women: [
    { bg: "7b2d5e", fg: "fce4ec" },
    { bg: "8e3572", fg: "fdf0f8" },
    { bg: "6a1f50", fg: "f9e4f0" },
    { bg: "9c2858", fg: "fde8f0" },
    { bg: "5c1f45", fg: "f5e0ed" },
  ],
  kids: [
    { bg: "c0392b", fg: "ffeaa7" },
    { bg: "d35400", fg: "fff3e0" },
    { bg: "16a085", fg: "e0f8f4" },
    { bg: "8e44ad", fg: "f5e8ff" },
    { bg: "f39c12", fg: "fff8e1" },
  ],
};

function generateProductImages(gender: string, noun: string, index: number, count = 2): string[] {
  const palettes = GENDER_PALETTES[gender] ?? GENDER_PALETTES["men"];
  const label = encodeURIComponent(noun);
  return Array.from({ length: count }, (_, i) => {
    const { bg, fg } = palettes[(index * count + i) % palettes.length];
    return `https://placehold.co/400x500/${bg}/${fg}?text=${label}&font=playfair-display`;
  });
}

function generatePrice() {
  const prices = [299, 399, 499, 599, 699, 799, 899, 999, 1199, 1399, 1499, 1699, 1999, 2299, 2499, 2999, 3499, 3999, 4499, 4999];
  return prices[Math.floor(Math.random() * prices.length)];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const usedSlugs = new Set<string>();
function uniqueSlug(base: string): string {
  let slug = slugify(base);
  let counter = 1;
  while (usedSlugs.has(slug)) {
    slug = `${slugify(base)}-${counter++}`;
  }
  usedSlugs.add(slug);
  return slug;
}

const usedSkus = new Set<string>();
function uniqueSku(prefix: string): string {
  let sku = `${prefix}-${faker.string.alphanumeric(6).toUpperCase()}`;
  while (usedSkus.has(sku)) {
    sku = `${prefix}-${faker.string.alphanumeric(6).toUpperCase()}`;
  }
  usedSkus.add(sku);
  return sku;
}

async function main() {
  console.log("🌱 Starting seed...");

  // Clear tables in reverse FK order
  console.log("🗑️  Clearing existing data...");
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.address.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
  await prisma.coupon.deleteMany();

  // ─── Users ────────────────────────────────────────────────────────────────
  console.log("👤 Creating users...");
  const adminPassword = await bcrypt.hash("admin123456", 12);
  const customerPassword = await bcrypt.hash("customer123", 12);

  const adminUser = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@store.com",
      password: adminPassword,
      role: Role.ADMIN,
      emailVerified: true,
      phone: "9999999999",
    },
  });

  const customers = await Promise.all(
    Array.from({ length: 20 }, async () =>
      prisma.user.create({
        data: {
          name: faker.person.fullName(),
          email: faker.internet.email().toLowerCase(),
          password: customerPassword,
          role: Role.CUSTOMER,
          emailVerified: true,
          phone: `9${faker.string.numeric(9)}`,
          addresses: {
            create: {
              label: "Home",
              firstName: faker.person.firstName(),
              lastName: faker.person.lastName(),
              street: faker.location.streetAddress(),
              city: faker.location.city(),
              state: faker.location.state(),
              zip: faker.location.zipCode("######"),
              country: "IN",
              phone: `9${faker.string.numeric(9)}`,
              isDefault: true,
            },
          },
        },
      })
    )
  );
  console.log(`✅ Created 1 admin + ${customers.length} customers`);

  // ─── Categories ───────────────────────────────────────────────────────────
  console.log("📂 Creating categories...");
  const categoryMap: Record<string, Record<string, string>> = {};

  for (const parent of PARENT_CATEGORIES) {
    const parentCategory = await prisma.category.create({
      data: {
        name: parent.name,
        slug: parent.slug,
        gender: parent.gender,
        sortOrder: parent.sortOrder,
        imageUrl: `https://placehold.co/600x400/${GENDER_PALETTES[parent.slug]?.[0].bg ?? "374151"}/${GENDER_PALETTES[parent.slug]?.[0].fg ?? "ffffff"}?text=${encodeURIComponent(parent.name)}&font=playfair-display`,
        description: `Shop the latest ${parent.name.toLowerCase()}'s clothing collection`,
      },
    });

    categoryMap[parent.slug] = {};

    const subCatsForGender = SUB_CATEGORIES.filter(
      (sc) => !(sc.slug === "maternity-wear" && parent.slug !== "women")
    );

    for (const sub of subCatsForGender) {
      const subCategory = await prisma.category.create({
        data: {
          name: sub.name,
          slug: sub.slug,
          gender: parent.gender,
          sortOrder: sub.sortOrder,
          parentCategoryId: parentCategory.id,
          imageUrl: `https://placehold.co/600x400/${GENDER_PALETTES[parent.slug]?.[(sub.sortOrder - 1) % 5].bg ?? "374151"}/${GENDER_PALETTES[parent.slug]?.[(sub.sortOrder - 1) % 5].fg ?? "ffffff"}?text=${encodeURIComponent(sub.name)}&font=playfair-display`,
          description: `${parent.name}'s ${sub.name} collection`,
        },
      });
      categoryMap[parent.slug][sub.slug] = subCategory.id;
    }
  }
  console.log("✅ Created parent + sub categories");

  // ─── Products ─────────────────────────────────────────────────────────────
  console.log("👗 Creating 300 products...");
  const genders: Array<{ gender: Gender; slug: string }> = [
    { gender: Gender.MEN, slug: "men" },
    { gender: Gender.WOMEN, slug: "women" },
    { gender: Gender.KIDS, slug: "kids" },
  ];

  const clothingNouns = {
    MEN: ["Shirt", "T-Shirt", "Jeans", "Trousers", "Kurta", "Blazer", "Jacket", "Hoodie", "Shorts", "Polo", "Sweatshirt", "Suit", "Vest", "Chinos", "Track Pants"],
    WOMEN: ["Kurti", "Saree", "Lehenga", "Dress", "Top", "Jeans", "Palazzo", "Salwar Suit", "Blouse", "Skirt", "Cardigan", "Jumpsuit", "Crop Top", "Churidar", "Anarkali"],
    KIDS: ["T-Shirt", "Frock", "Shirt", "Shorts", "Jeans", "Dress", "Jumpsuit", "Kurta Set", "Track Suit", "Dungaree", "Pyjama Set", "Romper", "Hoodie", "Leggings", "School Uniform"],
  };

  const subCatSlugs = Object.keys(categoryMap["men"]);
  let productCount = 0;
  const allProducts = [];
  let globalProductIndex = 0;

  for (const { gender, slug: genderSlug } of genders) {
    const brandsForGender = BRANDS[gender];
    const nouns = clothingNouns[gender];
    const count = 100; // 100 products per gender

    for (let i = 0; i < count; i++) {
      const noun = faker.helpers.arrayElement(nouns);
      const brand = faker.helpers.arrayElement(brandsForGender);
      const productName = `${brand} ${faker.color.human()} ${noun}`;
      const slug = uniqueSlug(`${brand}-${noun}-${i}`);
      const price = generatePrice();
      const hasComparePrice = Math.random() < 0.4;
      const comparePrice = hasComparePrice
        ? Math.round(price * (1 + faker.number.float({ min: 0.2, max: 0.5 })))
        : null;

      const subCatSlug = faker.helpers.arrayElement(
        subCatSlugs.filter(
          (s) => !(s === "maternity-wear" && genderSlug !== "women")
        )
      );
      const categoryId = categoryMap[genderSlug][subCatSlug];

      const numVariants = faker.number.int({ min: 3, max: 5 });
      const variantSizes = faker.helpers.arrayElements(SIZES, numVariants);
      const color = faker.helpers.arrayElement(COLORS);

      const variants = variantSizes.map((size) => ({
        size,
        color: color.name,
        colorHex: color.hex,
        stock: faker.number.int({ min: 0, max: 50 }),
        sku: uniqueSku(`${genderSlug.toUpperCase()}-${size}`),
      }));

      const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);
      const isFeatured = Math.random() < 0.1;
      const isNewArrival = Math.random() < 0.2;
      const isBestSeller = Math.random() < 0.15;

      const product = await prisma.product.create({
        data: {
          name: productName,
          slug,
          description: faker.commerce.productDescription(),
          price,
          comparePrice,
          costPrice: Math.round(price * 0.4),
          sku: uniqueSku(genderSlug.toUpperCase()),
          gender,
          categoryId,
          brand,
          material: faker.helpers.arrayElement(["Cotton", "Polyester", "Silk", "Linen", "Wool", "Denim", "Rayon", "Nylon"]),
          tags: [subCatSlug, genderSlug, brand.toLowerCase(), noun.toLowerCase()],
          images: generateProductImages(genderSlug, noun, globalProductIndex++),
          isFeatured,
          isNewArrival,
          isBestSeller,
          totalStock,
          variants: { create: variants },
        },
      });

      allProducts.push(product);
      productCount++;
    }
  }
  console.log(`✅ Created ${productCount} products`);

  // ─── Reviews ──────────────────────────────────────────────────────────────
  console.log("⭐ Creating reviews...");
  const popularProducts = faker.helpers.arrayElements(allProducts, 80);
  let reviewCount = 0;

  for (const product of popularProducts) {
    const numReviews = faker.number.int({ min: 3, max: 12 });
    const reviewers = faker.helpers.arrayElements(customers, Math.min(numReviews, customers.length));

    for (const reviewer of reviewers) {
      try {
        await prisma.review.create({
          data: {
            userId: reviewer.id,
            productId: product.id,
            rating: faker.number.int({ min: 3, max: 5 }),
            comment: faker.helpers.maybe(() => faker.lorem.sentences(2), { probability: 0.7 }),
            isVerified: Math.random() < 0.6,
          },
        });
        reviewCount++;
      } catch {
        // Skip if unique constraint fails (same user/product)
      }
    }
  }
  console.log(`✅ Created ${reviewCount} reviews`);

  // Update product ratings
  console.log("📊 Updating product ratings...");
  for (const product of allProducts) {
    const result = await prisma.review.aggregate({
      where: { productId: product.id },
      _avg: { rating: true },
      _count: { rating: true },
    });
    await prisma.product.update({
      where: { id: product.id },
      data: {
        rating: result._avg.rating ?? 0,
        reviewCount: result._count.rating,
      },
    });
  }

  // ─── Coupons ──────────────────────────────────────────────────────────────
  console.log("🎟️  Creating coupons...");
  await prisma.coupon.createMany({
    data: [
      {
        code: "WELCOME10",
        discountType: "PERCENTAGE",
        discountValue: 10,
        minOrderAmount: 500,
        maxUses: 1000,
        isActive: true,
      },
      {
        code: "FLAT200",
        discountType: "FIXED",
        discountValue: 200,
        minOrderAmount: 1500,
        maxUses: 500,
        isActive: true,
      },
      {
        code: "SUMMER25",
        discountType: "PERCENTAGE",
        discountValue: 25,
        minOrderAmount: 999,
        maxUses: 200,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
    ],
  });
  console.log("✅ Created coupons");

  console.log("\n🎉 Seed completed successfully!");
  console.log(`   Admin: admin@store.com / admin123456`);
  console.log(`   Customer: any created email / customer123`);
  console.log(`   Coupon codes: WELCOME10, FLAT200, SUMMER25`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
