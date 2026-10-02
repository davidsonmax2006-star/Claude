window.GUIDES = window.GUIDES || {};
window.GUIDES.meals = {
  id: "meals",
  title: "Meal Plan",
  blurb: "High-protein lean bulk, batch-cooked from Aldi.",
  tabs: [["today", "Today"], ["week", "Week"], ["recipes", "Recipes"], ["shopping", "Shopping"], ["notes", "Notes"]],
  defaultTab: "today",
  target: { kcal: 3450, protein: 220, carbs: 455, fat: 75 },
  bedtime: "23:30",

  // Every meal in the plan. k = kcal, p = protein g, c = carbs g, f = fat g.
  meals: {
    porridge: { name: "Vanilla berry protein porridge", k: 819, p: 49, c: 94, f: 25,
      what: "100 g oats cooked with 250 ml lactose-free milk and 150 ml water, a pinch of salt and cinnamon. Off the heat, stir in 1 scoop (30 g) vanilla protein powder, 5 g creatine and 20 g peanut butter. Top with 80 g hot frozen summer fruits and 15 g honey." },
    chicken: { name: "Peri-peri chicken, rice & veg", k: 689, p: 48, c: 94, f: 12,
      what: "140 g raw chicken breast in a garlic, lemon and smoked paprika marinade, 100 g dry rice, 150 g frozen broccoli and peas, 5 ml oil, topped with spicy mayo (15 g light mayo + 1 tsp sriracha). Batch A box." },
    pregym: { name: "Pre-gym snack", k: 232, p: 6, c: 48, f: 1,
      what: "1 banana and 1 slice of wholemeal toast with 10 g honey. On training days, your usual coffee with 10–15 g collagen stirred in, black or with a splash of lactose-free milk (the collagen isn't counted in the totals)." },
    tuna: { name: "Tuna wraps + banana", k: 639, p: 37, c: 97, f: 11,
      what: "1 tin tuna (102 g drained) mixed with 15 g light mayo, 1 tsp sriracha and lemon, in 2 toasted wraps with 20 g salad each; plus 1 banana." },
    eggs: { name: "Egg and cheese wraps + banana", k: 779, p: 33, c: 96, f: 27,
      what: "3 eggs scrambled with 15 g grated cheddar, in 2 toasted wraps with 20 g salad each and 1 tsp sriracha; plus 1 banana." },
    chilli: { name: "Beef & bean chilli with rice", k: 591, p: 42, c: 76, f: 12,
      what: "125 g raw 5% steak mince, 60 g kidney beans, 200 g chopped tomatoes, tomato purée, onion, garlic and spices; 70 g dry rice; 10 g grated cheddar. Batch A portion." },
    bolognese: { name: "Turkey bolognese pasta", k: 663, p: 48, c: 87, f: 12,
      what: "125 g turkey mince and 100 g dry fusilli in a tomato, onion and pepper sauce, with 10 g grated cheddar. Batch B portion." },
    curry: { name: "Chicken & chickpea curry with rice", k: 725, p: 52, c: 101, f: 12,
      what: "140 g raw chicken breast with chickpeas, tomatoes and curry paste, 90 g dry rice, and a spoon of fat-free Greek-style yogurt (optional). Batch B portion." },
    salmon: { name: "Salmon traybake with honey-soy glaze", k: 676, p: 42, c: 76, f: 21,
      what: "1 salmon fillet (120 g), 350 g baby potatoes, 75 g frozen broccoli and 75 g peas, roasted with a honey-soy glaze." },
    shake: { name: "Chocolate protein shake + toast", k: 381, p: 36, c: 41, f: 8,
      what: "1 scoop (30 g) chocolate protein powder shaken with 250 ml lactose-free milk; 1 slice of wholemeal toast with 15 g honey." }
  },

  // The day's slots in order. "pick" slots depend on the weekday (see rotation).
  slots: [
    { id: "breakfast", time: "08:00–09:30", label: "Breakfast", meal: "porridge" },
    { id: "lunch", time: "13:00", label: "Lunch (main pre-gym meal)", pick: "lunch" },
    { id: "snack", time: "14:30", label: "Pre-gym snack", meal: "pregym" },
    { id: "gym", time: "15:30", label: "Gym", gym: true },
    { id: "post", time: "17:30", label: "Post-gym wraps", pick: "post" },
    { id: "dinner", time: "20:00", label: "Dinner", pick: "dinner" },
    { id: "shake", time: "22:30", label: "Before bed", meal: "shake" }
  ],

  // dow: 0 = Sunday ... 6 = Saturday
  rotation: [
    { dow: 1, day: "Monday", lunch: "chicken", post: "tuna", dinner: "chilli" },
    { dow: 2, day: "Tuesday", lunch: "chicken", post: "eggs", dinner: "chilli" },
    { dow: 3, day: "Wednesday", lunch: "chicken", post: "tuna", dinner: "chilli", note: "Shop 2 on the way home, then cook batch B" },
    { dow: 4, day: "Thursday", lunch: "bolognese", post: "eggs", dinner: "curry" },
    { dow: 5, day: "Friday", lunch: "bolognese", post: "tuna", dinner: "curry" },
    { dow: 6, day: "Saturday", lunch: "bolognese", post: "eggs", dinner: "curry" },
    { dow: 0, day: "Sunday", lunch: "bolognese", post: "tuna", dinner: "salmon", note: "Shop 1 before the gym, then cook batch A" }
  ],

  gymBlurb: "Train for about 60–80 minutes (see your Gym Plan).",
  howTo: [
    "**Your training day:** lunch at 13:00 is your main pre-gym meal, and the banana and honey toast at 14:30 tops you up an hour before. Leave for the gym around 15:20, train 15:30–16:50, shower, and eat the wraps at about 17:30. A meal within 1–2 hours either side of training is the aim.",
    "**Why the pre-gym snack is small:** lunch is still being digested, so the banana and honey toast only need to add about 48 g of fast carbs.",
    "**Coffee:** have it by about 14:30. Caffeine taken 6 hours before bed can still disrupt sleep.",
    "**Sleep:** aim to be asleep by about 23:30. The bedtime shake at 22:30 fits an hour before.",
    "**Weigh meat raw and rice, oats and pasta dry** for the first two weeks. After that you'll be able to eyeball portions.",
    "**Protein powder:** the plan assumes a 30 g scoop gives about 120 kcal, 23 g protein and ~2 g lactose, typical for whey concentrate. Check your tubs' labels.",
    "**Creatine:** 5 g a day, stirred into the breakfast porridge. Timing matters much less than taking it every day.",
    "**Collagen (training days only):** 10–15 g in your 14:30 coffee. It adds about 60 kcal and isn't counted toward your protein."
  ],
  footnote: "Macros are estimates from typical UK label values, calculated in code and checked against Aldi's own label where one was available. Individual products can differ by 5–10%."
};

// Batch-cook timelines and fridge routine, shown on the Week tab.
window.GUIDES.meals.batch = [
  {
    title: "Sunday: batch A + salmon dinner (about 75 min)",
    blocks: [
      "**Tomorrow's boxes go in the fridge and everything else goes in the freezer.**",
      { ol: [
        "**0:00** Put 510 g of rice on to boil (300 g for the chicken boxes, 210 g for the chilli). Chop the onions.",
        "**0:05** Start the chilli: onion, then mince, then spices, tomatoes and beans. Leave it to simmer.",
        "**0:15** Fry the chicken, which you marinated after lunch. Add the frozen veg for the last 5 minutes.",
        "**0:25** Put the halved baby potatoes in the oven for the salmon traybake.",
        "**0:35** Box the chicken and rice into 3. Monday's box goes in the fridge; Tuesday's and Wednesday's go straight into the freezer.",
        "**0:40** Add the salmon and veg to the tray.",
        "**0:45** Split the chilli into 4. Monday's goes in the fridge; Tuesday's, Wednesday's and the spare go in the freezer.",
        "**0:55** Eat the salmon traybake, then wash up."
      ] }
    ]
  },
  {
    title: "Wednesday: batch B (about 60 min)",
    blocks: [
      { ol: [
        "Rice (270 g) and pasta (400 g) on to boil.",
        "Cook the turkey bolognese and the chicken curry side by side, following the recipes.",
        "Thursday's bolognese and curry go in the fridge. Friday's, Saturday's and Sunday's go in the freezer."
      ] }
    ]
  },
  {
    title: "Every night (2 minutes)",
    blocks: [
      "Move the next day's lunch and dinner from the freezer to the fridge so they defrost overnight. On Saturday night, also move 420 g chicken (and the salmon, if it's frozen) to the fridge for Sunday. For early starts, make overnight oats the night before."
    ]
  }
];

window.GUIDES.meals.notes = [
  {
    title: "Your numbers",
    blocks: [
      "**You're on a leaner bulk: about 3,450 kcal and ~220 g of protein a day, with fat kept to about 75 g.** A small surplus of about 150 kcal keeps building muscle while keeping fat gain to a minimum. The other two columns are there if you change goal later.",
      { table: { cols: ["Per day", "Maintain / recomp", "Lean bulk (current)", "Cut"], rows: [
        ["Calories", "~3,300 kcal", "~3,450 kcal (+150)", "~2,850 kcal (about −480)"],
        ["Protein", "200–220 g", "~220 g", "~205 g (keep it high)"],
        ["Carbohydrate", "~430 g", "~455 g", "~355 g"],
        ["Fat", "~75 g", "~75 g", "~60 g"],
        ["Fibre", "30 g minimum (plan gives ~40 g)", "~45 g", "30 g+"],
        ["Fluid", "~3–4 L, more on training days", "same", "same"],
        ["Protein meals", "5 feeds of 36–52 g, 3–4 h apart", "same", "same"],
        ["Expected weight change", "stable, ±0.5 kg", "+0.15–0.3 kg/week", "about −0.4 to −0.5 kg/week"]
      ] } },
      "**Protein:** the daily total matters most; timing and distribution are refinements. Five feeds of roughly 35–50 g, every 3–4 hours, with a 36 g shake before bed. There's no hard \"30 g per meal\" cap, so if you miss a meal, make it up later in the day.",
      "**Carbs and fat:** carbs refill muscle glycogen for high-rep sets and are the cheapest calories at Aldi. Trimming fat is the easiest way to keep the surplus small without touching protein, but don't go below about 50 g a day because fat is needed for hormones and vitamins A, D, E and K.",
      "**Fibre:** the NHS target is 30 g a day. Oats, beans, frozen veg and wholemeal bread take the plan to about 45 g. If you currently eat much less, build up over 1–2 weeks and drink more water, or you'll feel bloated."
    ]
  },
  {
    title: "Daily drinks allowance",
    blocks: [
      "**Each day you can have one of these: a large glass of wine, a double rum and coke, or 2 pints of beer.** On a day you drink, make the matching swap so the drink replaces food calories instead of adding to your surplus. It's an allowance, not a target, so on days you don't drink, eat the plan as written.",
      { table: { cols: ["Drink", "Calories", "Swap that day"], rows: [
        ["Double rum and Coke Zero (50 ml rum, 250 ml Zero)", "~105 kcal (~1.9 units)", "Skip the bedtime toast and honey (keep the shake)"],
        ["Large glass of wine (250 ml, 12%)", "~215 kcal (3.0 units)", "Skip the bedtime toast, and leave the honey off the porridge and pre-gym toast"],
        ["Double rum and regular coke", "~210 kcal (~1.9 units)", "Skip the bedtime toast, and leave the honey off the porridge and pre-gym toast"],
        ["2 pints of beer or lager (4%)", "~390 kcal (4.5 units)", "Skip the bedtime toast and the pre-gym toast, and all the honey (keep the banana)"]
      ] } },
      { ul: [
        "**Keep the bedtime shake.** It's your pre-sleep protein, and it matters more on a night you drink.",
        "**Alcohol calories replace food calories, not add to them.** Your surplus is only about 150 kcal, so 2 pints without a swap would more than triple it, and most of the extra would go to fat.",
        "**Drink in the evening, not straight after the gym.** Have the post-gym wraps first and the drink later.",
        "**Finish your drink a couple of hours before bed.** Alcohol helps you fall asleep but makes the second half of the night lighter and more broken.",
        "**Have a glass of water with it,** on top of your usual 3–4 L.",
        "**The weekly picture:** the UK low-risk guideline is no more than 14 units a week, spread over 3 or more days with some drink-free days. Taking the allowance every day works out to about 13 units (double rum and coke), 21 (wine) or 32 (2 pints). If you want the beer, using the allowance on 3 days a week instead of 7 keeps you at about 14 units."
      ] }
    ]
  },
  {
    title: "Supplements: what's worth it",
    blocks: [
      "You already have most of what's worth taking. Creatine and vitamin D have the strongest evidence, and you only need to buy the vitamin D.",
      { table: { cols: ["Supplement", "How to use it", "Verdict"], rows: [
        ["Creatine monohydrate", "5 g a day, every day, stirred into the porridge or shake. No loading phase needed.", "Use it"],
        ["Vanilla and chocolate protein powder", "1 scoop of vanilla in the morning porridge, 1 scoop of chocolate in the bedtime shake", "Use it"],
        ["Collagen", "10–15 g stirred into coffee about 1 hour before training. Training days only. It doesn't build muscle like whey and isn't a complete protein, so don't count it toward your protein.", "Optional. Use up what you have."],
        ["Vitamin D", "10 micrograms (400 IU) a day, October to March", "Worth buying, and very cheap"],
        ["BCAAs", "At this much protein, food already gives you far more than a scoop.", "Skip"],
        ["Mass gainers", "Mostly sugar and milk powder (and lactose). Oats plus lactose-free milk do the same job for far less.", "Skip"],
        ["Fat burners / \"test boosters\"", "No good evidence they work for healthy young men, and some contain undeclared stimulants.", "Skip"]
      ] } }
    ]
  },
  {
    title: "Lean bulk, cutting and rest days",
    blocks: [
      "Change calories by adding or removing carbs and fats. **Keep protein at roughly 200 g in every phase.**",
      "**Lean bulk (what the plan does now):** keep the surplus small. Two slices of toast do the work: one with honey before the gym and one with honey at bedtime, about 240 kcal together. If your weight gain stays below target for two weeks running, add one of these:",
      { table: { cols: ["Add-on", "Calories", "Protein"], rows: [
        ["A pint of lactose-free milk with any meal", "+267 kcal", "+20 g"],
        ["+80 g dry rice or pasta at lunch", "+280 kcal", "+6 g"]
      ] } },
      "**To maintain,** drop the bedtime toast and honey (−128 kcal). That puts you at about 3,300 kcal.",
      "**To cut,** do that first, then make these changes together for a deficit of about 490 kcal a day, or roughly 0.4–0.5 kg of fat a week:",
      { ol: [
        "Leave the peanut butter and honey out of the porridge; keep the berries and cinnamon (−180 kcal).",
        "Cut the rice or pasta at lunch from 100 g to 60 g dry, and use plain sriracha instead of spicy mayo on the chicken (−140 to −180 kcal).",
        "Use 25 g less rice at dinner (45 g with the chilli, 65 g with the curry), or 100 g fewer potatoes with the salmon (−80 to −90 kcal).",
        "Leave the honey off the pre-gym toast, and skip the cheddar on the egg wraps (−31 to −93 kcal)."
      ] },
      "That gives about **2,850 kcal, 205 g protein, 355 g carbs and 60 g fat.** Keep lifting heavy; training is the main signal to hold on to muscle.",
      "**Training days vs rest days:** eat the same meals every day. Your weekly totals drive results, and one routine is easier to stick to. On rest days, skip the collagen and have the banana and honey toast whenever suits you. Keep meals roughly 3–4 hours apart."
    ]
  },
  {
    title: "Tracking and adjusting",
    blocks: [
      "The 3,300 kcal maintenance figure, and so the 3,450 kcal bulk target, is an estimate. **Your weight trend is the real measurement.** Check it every two weeks and change calories by 150–250 kcal at a time.",
      "**Weigh yourself daily** first thing in the morning, after the toilet and before eating. Then use the **weekly average**. Single days can swing 1–2 kg from water, salt and carbs.",
      { table: { cols: ["Goal", "Target change per week", "Off target for 2 weeks running?"], rows: [
        ["Maintain / recomp", "0 ± 0.2 kg", "Add or remove ~200 kcal"],
        ["Lean bulk", "+0.15 to +0.3 kg", "Too slow: +150–200 kcal. Too fast: −150–200 kcal"],
        ["Cut", "−0.4 to −0.7 kg", "Too slow: −150–200 kcal. Too fast: +150–200 kcal"]
      ] } },
      "Make changes with carbs and fats, using the add-ons and cuts above. Leave protein where it is.",
      { ul: [
        "**Your gym log.** Your main lifts should creep up on a bulk and hold steady on a cut. Falling strength on a cut usually means the deficit is too big.",
        "**Your waist, weekly,** measured at the belly button. If your waist grows quickly while lifts stall on a bulk, the surplus is too big.",
        "**Photos, monthly,** in the same light.",
        "**Ignore week one.** More carbs, fibre and water can add 1–2 kg on the scale in the first few days. That's glycogen and water, not fat.",
        "**Check your portions.** Log 3 typical days in a free app such as MyFitnessPal or Cronometer, scanning the Aldi barcodes. If your totals are within about 10% of the template, you're on track."
      ] }
    ]
  },
  {
    title: "Keeping lactose low",
    blocks: [
      "The plan has about **4–6 g of lactose a day, with no meal above ~2 g.** Most people who digest lactose poorly tolerate up to 12 g in one go with no or only minor symptoms, so every meal here stays well under that.",
      { table: { cols: ["Food", "Lactose", "In the plan"], rows: [
        ["Cow's milk", "4.6–4.8 g per 100 ml (~12 g in a 250 ml glass)", "Swapped for lactose-free milk (0 g)"],
        ["Yogurt", "3.6–4.7 g per 100 g", "Protein pots dropped; 50 g Greek-style in the curry only (~2 g)"],
        ["Cottage cheese", "3.5 g per 100 g", "Dropped; the egg wraps use 3 eggs"],
        ["Cheddar", "0.1 g per 100 g", "Kept"],
        ["Your protein powder", "A couple of grams per scoop if it's whey concentrate", "2 scoops a day"],
        ["Collagen, eggs, meat, fish", "0 g", "Kept"]
      ] } },
      { ul: [
        "**Reading labels:** on plain milk, plain yogurt and protein powder without added sugar, the \"of which sugars\" line is roughly the lactose content. This doesn't work for lactose-free milk, where the sugar has already been split.",
        "**When your tubs run out:** whey isolate is at least 90% protein, which leaves little room for lactose. It's the best replacement if you want to stay low.",
        "**For zero lactose:** leave the yogurt out of the curry, or use a splash of lactose-free milk instead."
      ] }
    ]
  },
  {
    title: "Good to know",
    blocks: [
      "**Food pairings matter.** Wheat on its own is short of lysine, but with tuna or eggs inside the wraps it's fine. Grains plus beans fill each other's gaps, which is why the chilli and curry pair meat and pulses with starch. Every meal here has enough protein, including leucine (the amino acid that switches on muscle building).",
      "**Zinc and selenium are already fairly high** from food, so don't add a multivitamin or a zinc or selenium supplement. Take vitamin D from October to March.",
      "This plan is general guidance for a healthy adult, not medical advice. If you have a medical condition, or a history of problems with food, talk to your GP before making big diet changes."
    ]
  }
];
