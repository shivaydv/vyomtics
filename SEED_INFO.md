# Database Seed Information

## Overview

Successfully seeded the database with realistic electronics/robotics e-commerce data inspired by robocraze.com.

## Seeded Data

### Admin User

- **Email**: admin@vyomtics.com
- **Password**: admin123
- **Role**: ADMIN
- **Email Verified**: ✅

### Categories (5)

1. **Development Boards**

   - Microcontrollers and development boards for IoT and embedded projects
   - Products: Raspberry Pi 5, Arduino Uno R4, ESP32

2. **Sensors & Modules**

   - Various sensors and electronic modules
   - Products: Ultrasonic sensor, DHT22, MPU6050, SG90 Servo, L298N Motor Driver, OLED Display

3. **Robotics & STEM Kits**

   - Complete robotics and educational kits
   - Products: 4WD Robot Car Chassis, Arduino Robot Building Kit, Line Follower Kit

4. **3D Printers & Accessories**

   - 3D printers, filaments, and accessories
   - Products: Bambu Lab P1P, PLA+ Filament, Nozzle Set

5. **Tools & Instruments**
   - Essential tools for electronics
   - Products: Digital Multimeter, Soldering Station, Helping Hands, Jumper Wires, Breadboard

### Products (20)

#### Featured Products (8)

- Raspberry Pi 5 Model 8GB RAM - ₹10,499 (MRP: ₹12,999)
- Arduino Uno R4 WiFi - ₹2,799 (MRP: ₹3,499)
- ESP32 DevKit V1 - ₹499 (MRP: ₹799)
- MPU6050 6-Axis Gyro - ₹249 (MRP: ₹399)
- 4WD Smart Robot Car Chassis - ₹1,499 (MRP: ₹1,999)
- Bambu Lab P1P 3D Printer - ₹47,999 (MRP: ₹54,999)
- Digital Multimeter - ₹2,299 (MRP: ₹2,999)
- L298N Motor Driver - ₹249 (MRP: ₹349)

#### Bestsellers (5)

- Raspberry Pi 5 - ✅
- Arduino Uno R4 - ✅
- Ultrasonic Sensor HC-SR04 - ₹149 (MRP: ₹249)
- Arduino Robot Building Kit - ₹4,499 (MRP: ₹5,999)
- SG90 Micro Servo - ₹99 (MRP: ₹199) [ON SALE]
- Jumper Wire Set - ₹199 (MRP: ₹299)

#### New Arrivals (2)

- Raspberry Pi 5 - ✅
- 4WD Robot Car Chassis - ✅

#### On Sale (2)

- Line Follower Robot Kit - ₹999 (MRP: ₹1,499)
- SG90 Micro Servo - ₹99 (MRP: ₹199)

## Product Features

### Rich Product Data

Each product includes:

- **Basic Info**: Title, slug, description, images
- **Pricing**: MRP and selling price (with discounts)
- **Inventory**: Stock levels
- **Flags**: Featured, Bestseller, New Arrival, On Sale
- **Sections**: Structured content (specs, bullets, text)
- **FAQs**: Question & answer pairs
- **Tags**: For search and filtering

### Example Product Structure

```json
{
  "sections": [
    {
      "type": "bullets",
      "title": "What's in the Box",
      "items": ["Item 1", "Item 2"]
    },
    {
      "type": "specs",
      "title": "Specifications",
      "items": [
        { "key": "Processor", "value": "2.4GHz Quad-core" },
        { "key": "RAM", "value": "8GB LPDDR4X" }
      ]
    },
    {
      "type": "text",
      "title": "About This Product",
      "content": "Detailed description..."
    }
  ],
  "faqs": [
    {
      "question": "Does it include power supply?",
      "answer": "No, sold separately..."
    }
  ]
}
```

## Image URLs

All products use high-quality Unsplash images:

- Development boards: Circuit board and electronics images
- Sensors: Close-up component images
- Robotics: Robot and mechanical images
- 3D Printers: 3D printing images
- Tools: Tool and instrument images

**Note**: These are placeholder images. You can replace them with:

1. ImageKit uploaded images
2. Direct URLs from product websites
3. Your own product photography

## Using the Seeded Data

### View in Prisma Studio

```bash
pnpm db:studio
```

Opens at: http://localhost:5555

### Login to Admin Panel

1. Go to `/admin/login`
2. Email: `admin@vyomtics.com`
3. Password: `admin123`

### Test Storefront

- Homepage: List featured products
- Category pages: Filter by category
- Product details: Show sections, specs, FAQs
- Search: Use product tags

## Next Steps

### Storefront Pages to Build

1. **Homepage** (`app/(store)/page.tsx`)

   - Hero section with featured products
   - Category grid
   - Bestsellers carousel
   - New launches section

2. **Category Page** (`app/(store)/categories/[slug]/page.tsx`)

   - Product grid with filters
   - Sort options
   - Pagination

3. **Product Detail Page** (`app/(store)/products/[slug]/page.tsx`)

   - Image gallery
   - Price and add to cart
   - Specifications tabs
   - FAQs accordion
   - Related products

4. **Search Page** (`app/(store)/search/page.tsx`)
   - Search results with filters
   - Tag-based search

### API Routes to Create

- `GET /api/products` - List products with filters
- `GET /api/products/[slug]` - Get product details
- `GET /api/categories` - List categories
- `GET /api/search` - Search products

## Re-seeding

To reset and re-seed the database:

```bash
pnpm db:push  # Sync schema
pnpm db:seed  # Run seed file
```

To modify seed data:

- Edit `prisma/seed.ts`
- Run `pnpm db:seed` again (uses upsert, so it's safe)
