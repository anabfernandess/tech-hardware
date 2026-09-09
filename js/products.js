const PRODUCTS = [
  {
    id: 1,
    name: "AMD Ryzen 7 7800X3D",
    category: "processadores",
    price: 3499.90,
    oldPrice: 3899.90,
    icon: "fa-microchip",
    badge: "Vendido",
    specs: ["8 núcleos · 16 threads", "Até 5.0 GHz", "AM5"]
  },
  {
    id: 2,
    name: "Intel Core i5-14400F",
    category: "processadores",
    price: 1549.90,
    icon: "fa-microchip",
    specs: ["10 núcleos · 16 threads", "Até 4.7 GHz", "LGA 1700"]
  },
  {
    id: 3,
    name: "AMD Ryzen 5 5600",
    category: "processadores",
    price: 899.90,
    oldPrice: 1049.90,
    icon: "fa-microchip",
    badge: "Promo",
    specs: ["6 núcleos · 12 threads", "Até 4.4 GHz", "AM4"]
  },
  {
    id: 4,
    name: "Intel Core i9-14900K",
    category: "processadores",
    price: 4299.90,
    icon: "fa-microchip",
    badge: "Top",
    specs: ["24 núcleos · 32 threads", "Até 6.0 GHz", "LGA 1700"]
  },
  {
    id: 5,
    name: "GeForce RTX 4070 Super",
    category: "placas-de-video",
    price: 4799.90,
    oldPrice: 5299.90,
    icon: "fa-gamepad",
    badge: "Vendido",
    specs: ["12 GB GDDR6X", "DLSS 3.5", "Ray tracing"]
  },
  {
    id: 6,
    name: "Radeon RX 7900 XTX",
    category: "placas-de-video",
    price: 6499.90,
    icon: "fa-gamepad",
    badge: "Top",
    specs: ["24 GB GDDR6", "FSR 3", "4K gaming"]
  },
  {
    id: 7,
    name: "GeForce RTX 5060 Ti",
    category: "placas-de-video",
    price: 2899.90,
    icon: "fa-gamepad",
    specs: ["16 GB GDDR7", "DLSS 4", "1440p gaming"]
  },
  {
    id: 8,
    name: "GeForce GTX 1660 Super",
    category: "placas-de-video",
    price: 1299.90,
    oldPrice: 1499.90,
    icon: "fa-gamepad",
    badge: "Promo",
    specs: ["6 GB GDDR6", "1080p gaming", "Baixo consumo"]
  },
  {
    id: 9,
    name: "Corsair Vengeance 16GB DDR4",
    category: "memoria-ram",
    price: 349.90,
    icon: "fa-memory",
    specs: ["2x 8GB", "3200 MHz", "CL16"]
  },
  {
    id: 10,
    name: "Kingston Fury 32GB DDR5",
    category: "memoria-ram",
    price: 899.90,
    oldPrice: 999.90,
    icon: "fa-memory",
    badge: "Promo",
    specs: ["2x 16GB", "5600 MHz", "RGB"]
  },
  {
    id: 11,
    name: "XPG Pichau 8GB DDR4",
    category: "memoria-ram",
    price: 199.90,
    icon: "fa-memory",
    specs: ["1x 8GB", "3000 MHz", "CL16"]
  },
  {
    id: 12,
    name: "G.Skill Trident Z5 64GB DDR5",
    category: "memoria-ram",
    price: 1799.90,
    icon: "fa-memory",
    badge: "Top",
    specs: ["2x 32GB", "6600 MHz", "RGB"]
  },
  {
    id: 13,
    name: "SSD NVMe 1TB Gen4",
    category: "ssd",
    price: 549.90,
    oldPrice: 649.90,
    icon: "fa-hard-drive",
    badge: "Vendido",
    specs: ["7000 MB/s leitura", "M.2 NVMe", "1 TB"]
  },
  {
    id: 14,
    name: "SSD SATA 480GB",
    category: "ssd",
    price: 259.90,
    icon: "fa-hard-drive",
    specs: ["550 MB/s leitura", "2.5\" SATA", "480 GB"]
  },
  {
    id: 15,
    name: "SSD NVMe 2TB Gen4",
    category: "ssd",
    price: 999.90,
    icon: "fa-hard-drive",
    badge: "Top",
    specs: ["7400 MB/s leitura", "M.2 NVMe", "2 TB"]
  },
  {
    id: 16,
    name: "Placa-mãe B650M AORUS",
    category: "placas-mae",
    price: 999.90,
    oldPrice: 1149.90,
    icon: "fa-layer-group",
    badge: "Promo",
    specs: ["Socket AM5", "DDR5", "M.2 Gen4"]
  },
  {
    id: 17,
    name: "Placa-mãe Z790 ROG Strix",
    category: "placas-mae",
    price: 2299.90,
    icon: "fa-layer-group",
    badge: "Top",
    specs: ["Socket LGA 1700", "DDR5", "Wi-Fi 6E"]
  },
  {
    id: 18,
    name: "Placa-mãe A520M DS3H",
    category: "placas-mae",
    price: 629.90,
    icon: "fa-layer-group",
    specs: ["Socket AM4", "DDR4", "M.2"]
  },
  {
    id: 19,
    name: "Fonte 650W 80 Plus Bronze",
    category: "fontes",
    price: 429.90,
    icon: "fa-plug",
    specs: ["650W", "80 Plus Bronze", "Cabo não modular"]
  },
  {
    id: 20,
    name: "Fonte 850W 80 Plus Gold",
    category: "fontes",
    price: 799.90,
    oldPrice: 899.90,
    icon: "fa-plug",
    badge: "Vendido",
    specs: ["850W", "80 Plus Gold", "Modular"]
  },
  {
    id: 21,
    name: "Fonte 1000W 80 Plus Platinum",
    category: "fontes",
    price: 1499.90,
    icon: "fa-plug",
    badge: "Top",
    specs: ["1000W", "80 Plus Platinum", "Fully modular"]
  },
  {
    id: 22,
    name: "Gabinete Mid Tower com Vidro",
    category: "gabinetes",
    price: 449.90,
    icon: "fa-desktop",
    specs: ["ATX / mATX", "Lateral de vidro", "3 fans inclusos"]
  },
  {
    id: 23,
    name: "Gabinete Full Tower RGB",
    category: "gabinetes",
    price: 899.90,
    icon: "fa-desktop",
    badge: "Top",
    specs: ["E-ATX / ATX", "Fans RGB", "Water-cooling"]
  },
  {
    id: 24,
    name: "Gabinete Mini ITX Compacto",
    category: "gabinetes",
    price: 349.90,
    icon: "fa-desktop",
    specs: ["Mini ITX", "Compacto", "Metal fino"]
  }
];