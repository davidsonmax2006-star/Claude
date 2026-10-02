window.GUIDES = window.GUIDES || {};
window.GUIDES.meals = window.GUIDES.meals || {};

// Prices are in pence. Item: [id, name, quantity, pence each, note]. pence null = not priced online, check in store.
// A "when" string (top-ups) replaces the quantity.
window.GUIDES.meals.shopping = {
  intro: "**Two smaller shops a week keep the fridge clear.** Shop 1 on Sunday covers Sunday to Wednesday, and Shop 2 on Wednesday covers Thursday to Saturday. The fridge only ever holds about 3–4 days of fresh food; everything else is frozen or from the cupboard. The plan averages about **£42.55 a week (£6.10 a day)**, not counting the powder, creatine, collagen and coffee you already have. The one-off spice and sauce cupboard costs about £12 and lasts months. Prices are from aldi.co.uk, September 2026; check in store where marked.",
  sections: [
    {
      id: "s1", title: "Shop 1: Sunday", total: true,
      items: [
        ["s1_chicken", "Frozen chicken breast fillets 1 kg", 1, 425, "Freezer. Covers both batches: defrost 420 g in the fridge on Saturday night and again on Tuesday night."],
        ["s1_beef", "5% fat beef steak mince 500 g", 1, 505, "Fridge, cooked the same day. Price from the store."],
        ["s1_tuna", "Tuna chunks in water, 4-pack", 1, 249, "Cupboard"],
        ["s1_milk", "Lactose-free milk 1 L", 2, 99, "Fridge"],
        ["s1_bananas", "Bananas ×5", 2, 78, "Counter"],
        ["s1_lemons", "Lemons ×4", 1, 89, "Counter. One for the chicken, the rest for the salmon, tuna wraps and curry."],
        ["s1_salad", "Bistro salad 160 g", 1, 89, "Fridge"],
        ["s1_wraps", "White tortilla wraps ×8", 1, 99, "Cupboard"],
        ["s1_tomatoes", "Chopped tomatoes 400 g", 2, 43, "Cupboard"],
        ["s1_beans", "Red kidney beans tin", 1, 39, "Cupboard"]
      ]
    },
    {
      id: "s2", title: "Shop 2: Wednesday", total: true,
      items: [
        ["s2_turkey", "2% fat turkey mince 500 g", 1, 399, "Fridge, cooked the same day"],
        ["s2_milk", "Lactose-free milk 1 L", 2, 99, "Fridge"],
        ["s2_bananas", "Bananas ×5", 1, 78, "Counter"],
        ["s2_salad", "Bistro salad 160 g", 1, 89, "Fridge"],
        ["s2_wraps", "White tortilla wraps ×8", 1, 99, "Cupboard"],
        ["s2_peppers", "Mixed peppers ×3", 1, 179, "Fridge, used the same day"],
        ["s2_tomatoes", "Chopped tomatoes 400 g", 3, 43, "Cupboard"],
        ["s2_chickpeas", "Chickpeas tin (270 g drained)", 1, 41, "Cupboard. Price from the store."]
      ]
    },
    {
      id: "top", title: "Top-ups: add to either shop when you run low",
      items: [
        ["t_berries", "Frozen summer fruits 500 g", "Most weeks (a bag lasts about 6 days)", 199, "Freezer"],
        ["t_salmon", "Boneless salmon fillets, 2 × 120 g", "Every 2 weeks (freeze the second fillet)", 359, "Freezer"],
        ["t_eggs", "Free-range eggs ×15", "Most weeks", 285, "Cupboard or fridge"],
        ["t_cheddar", "Grated mature cheddar 250 g", "Every 3 weeks", 189, "Freezer (grated cheese freezes well). Price from the store."],
        ["t_yogurt", "Fat-free Greek-style yogurt 500 g (optional)", "Every 3 weeks", 95, "Fridge"],
        ["t_broccoli", "Frozen broccoli florets 1 kg", "Every 3 weeks", 119, "Freezer"],
        ["t_peas", "Frozen garden peas 900 g", "Every 3 weeks", 109, "Freezer"],
        ["t_potatoes", "Baby potatoes 1 kg (salmon traybake)", "Every 3 weeks", 99, "Cupboard, somewhere cool and dark"],
        ["t_onions", "Brown onions 1 kg", "Every 2 weeks", 69, "Cupboard"],
        ["t_garlic", "Garlic, 4 bulbs", "Every 3 weeks (the plan uses about 15 cloves a week)", 87, "Cupboard"],
        ["t_bread", "Wholemeal sliced loaf 800 g", "Every 1½ weeks", 75, "Freezer; toast from frozen"],
        ["t_oats", "Porridge oats 1 kg", "Every 1½ weeks", 85, "Cupboard"],
        ["t_rice", "Long grain rice 1 kg", "Every 1½ weeks", 52, "Cupboard. Price from the store."],
        ["t_fusilli", "Fusilli 1 kg", "Every 2½ weeks", 119, "Cupboard"],
        ["t_puree", "Tomato purée (double concentrate)", "Every 2–3 weeks", 59, "Once opened, freeze leftovers in tablespoon dollops on baking paper, then bag them."],
        ["t_pb", "Smooth peanut butter 340 g", "Every 2½ weeks", 95, "Cupboard"],
        ["t_honey", "Honey 340 g", "Every 10 days or so", 209, "Cupboard. Price from the store."],
        ["t_curry", "Curry paste 190 g", "Every 4 weeks", 139, "Fridge once opened (small jar). Price from the store."],
        ["t_mayo", "Light mayo 500 ml", "Every 4–5 weeks", 95, "Fridge once opened. Price from the store."],
        ["t_oil", "Vegetable oil 1 L", "Every 15 weeks (the plan uses ~65 ml a week)", 145, "Cupboard"],
        ["t_have", "Vanilla and chocolate protein powder, creatine, collagen, coffee", "Already in your cupboard", null, "Cupboard"]
      ]
    },
    {
      id: "spice", title: "Spice and sauce cupboard: buy once (about £12)", total: true,
      items: [
        ["sp_paprika", "Smoked paprika 40 g", "Chicken, chilli, salmon, tuna wraps", 69, ""],
        ["sp_cumin", "Cumin 40 g", "Chicken, chilli", 65, ""],
        ["sp_chilli", "Chilli powder 40 g", "Chilli", 79, ""],
        ["sp_garlic", "Garlic granules 52 g", "Salmon potatoes, egg wraps", 69, ""],
        ["sp_herbs", "Italian mixed herbs 13 g", "Chicken, chilli, bolognese", 69, ""],
        ["sp_crushed", "Crushed chillies 29 g", "Chicken, bolognese, salmon, egg wraps", 79, ""],
        ["sp_cinnamon", "Ground cinnamon 40 g", "Porridge, chilli", 89, ""],
        ["sp_garam", "Garam masala 85 g", "Curry", 89, ""],
        ["sp_salt", "Table salt 750 g", "Everything", 65, ""],
        ["sp_pepper", "Ground black pepper 100 g", "Everything", 159, ""],
        ["sp_soy", "Light soy sauce 150 ml", "Bolognese, salmon glaze (lasts about 7 weeks)", 55, ""],
        ["sp_sriracha", "Sriracha", "Spicy mayo, wraps, chilli (a bottle lasts about 10 weeks)", 295, "About £2.95; not priced online, check in store."],
        ["sp_stock", "Beef stock cubes, 12-pack", "Chilli and bolognese (a pack lasts about 8 weeks)", null, "Not listed online; check in store."]
      ]
    }
  ],
  after: [
    "Apart from the milk and your morning coffee, just drink water: aim for 3–4 L a day, more on training days. Tap water is fine.",
    "If the sriracha is out of stock, Aldi's sweet chilli sauce works in the spicy mayo and wraps, though it's sweeter. Shortcut: a peri-peri seasoning can replace the paprika, cumin and herbs in the chicken marinade; keep the fresh garlic and lemon.",
    "**Cheaper swaps:** frozen chicken breast is about £4.25 per kg against £6.69 fresh (the lists already use it). Everyday Essentials wholemeal bread is cheaper again. Buy yellow-sticker meat on the day, portion it and freeze it. Making the chilli with a second pack of turkey mince saves about £1 a week, but you'd lose most of the plan's red-meat iron and zinc. Skipping the frozen berries and using cinnamon and honey alone saves about £2.20 a week."
  ]
};
