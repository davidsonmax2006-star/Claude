window.GUIDES = window.GUIDES || {};
window.GUIDES.gym = {
  id: "gym",
  title: "Gym Plan",
  blurb: "4 to 5 sessions a week, upper and lower body, 15:30.",
  tabs: [["today", "Today"], ["week", "Week"], ["workouts", "Workouts"], ["info", "Info"]],
  defaultTab: "today",
  warmup: "5 minutes easy on a bike, then 2–3 lighter sets of the first exercise, building up to your working weight (for example 8 reps at about half, 5 at about 70%, 2 at about 85%). Supersets mean doing the two moves back to back, then resting.",
  kit: "Every exercise uses standard gym kit: racks, benches and dumbbells, a leg press, a hack squat, cable stations, a lat pulldown, an assisted chin and dip station, a hip thrust machine, and bikes, rowers, SkiErgs and stair climbers.",
  sessions: {
    upperA: {
      name: "Upper A", short: "Upper A", length: "About 55 minutes, then cardio",
      exercises: [
        { id: "ua_bench", name: "Barbell bench press", sets: "3 × 5–8", rest: "2–3 min", note: "Heavy lift of the day. Use a rack with safety bars set just below chest height." },
        { id: "ua_row", name: "Seated cable row", sets: "3 × 8–10", rest: "2 min", note: "Squeeze your shoulder blades together at the end." },
        { id: "ua_press", name: "Seated dumbbell shoulder press", sets: "3 × 8–10", rest: "2 min" },
        { id: "ua_pulldown", name: "Lat pulldown", sets: "3 × 10–12", rest: "90 s", note: "Pull to your upper chest." },
        { id: "ua_lateral", name: "Cable lateral raise", sets: "3 × 12–15", rest: "60 s", note: "One arm at a time." },
        { id: "ua_arms", name: "EZ-bar or dumbbell curl + rope triceps pushdown (superset)", sets: "2 × 10–12 each", rest: "60 s" },
        { id: "ua_cardio", name: "Easy cardio", sets: "15–20 min", note: "Bike, incline walk or stair climber.", noWeight: true }
      ]
    },
    lowerA: {
      name: "Lower A", short: "Lower A", length: "About 60 minutes",
      exercises: [
        { id: "la_squat", name: "Back squat", sets: "3 × 5–8", rest: "3 min", note: "Heavy lift of the day. Swap for the hack squat if it doesn't suit your build." },
        { id: "la_rdl", name: "Romanian deadlift", sets: "3 × 8–10", rest: "2–3 min", note: "Push your hips back and keep the bar close. Stop when you feel a strong hamstring stretch." },
        { id: "la_legpress", name: "Leg press", sets: "3 × 10–12", rest: "2 min" },
        { id: "la_legcurl", name: "Seated leg curl", sets: "3 × 10–12", rest: "90 s" },
        { id: "la_calf", name: "Standing calf raise", sets: "3 × 10–15", rest: "60 s", note: "Pause for a second at the bottom." },
        { id: "la_crunch", name: "Cable crunch", sets: "2 × 10–15", rest: "60 s" }
      ]
    },
    shoulders: {
      name: "Shoulders, arms and intervals", short: "Shoulders & arms", optional: true, length: "About 45 minutes, then intervals",
      exercises: [
        { id: "w_press", name: "Machine shoulder press", sets: "3 × 8–12", rest: "2 min" },
        { id: "w_lateral", name: "Cable lateral raise", sets: "3 × 12–15", rest: "60 s" },
        { id: "w_facepull", name: "Face pull", sets: "2 × 12–15", rest: "60 s", note: "Rope attachment, pull towards your forehead." },
        { id: "w_curltri", name: "Cable curl + triceps pushdown (superset)", sets: "3 × 10–12 each", rest: "60 s" },
        { id: "w_hammer", name: "Hammer curl + overhead cable triceps extension (superset)", sets: "2 × 10–12 each", rest: "60 s" },
        { id: "w_intervals", name: "Intervals", sets: "20 min", note: "5 min easy, then 6 rounds of 30 s hard and 90 s easy, then 3 min easy. Bike, rower or SkiErg.", noWeight: true }
      ]
    },
    upperB: {
      name: "Upper B", short: "Upper B", length: "About 55 minutes, then cardio",
      exercises: [
        { id: "ub_incline", name: "Incline dumbbell press", sets: "3 × 8–12", rest: "2 min", note: "Bench at about 30 degrees." },
        { id: "ub_pullup", name: "Pull-up, assisted if needed", sets: "3 × 6–10", rest: "2 min", note: "Use the assisted chin station. Swap for a wide-grip pulldown if you can't get 6." },
        { id: "ub_chest", name: "Machine chest press", sets: "3 × 10–12", rest: "90 s" },
        { id: "ub_row", name: "Single-arm dumbbell row", sets: "3 × 10–12 each side", rest: "90 s" },
        { id: "ub_revfly", name: "Reverse cable fly", sets: "2 × 12–15", rest: "60 s", note: "Works the rear shoulders." },
        { id: "ub_arms", name: "Incline dumbbell curl + overhead cable triceps extension (superset)", sets: "2 × 10–12 each", rest: "60 s" },
        { id: "ub_cardio", name: "Easy cardio", sets: "15–20 min", note: "Bike, incline walk or stair climber.", noWeight: true }
      ]
    },
    lowerB: {
      name: "Lower B", short: "Lower B", length: "About 60 minutes",
      exercises: [
        { id: "lb_hipthrust", name: "Hip thrust (machine or barbell)", sets: "3 × 8–10", rest: "2 min", note: "Heavy lift of the day." },
        { id: "lb_hack", name: "Hack squat", sets: "3 × 8–12", rest: "2 min", note: "Feet shoulder-width, go as deep as you can control." },
        { id: "lb_lunge", name: "Walking lunges with dumbbells", sets: "2 × 10 each leg", rest: "90 s" },
        { id: "lb_legcurl", name: "Lying leg curl", sets: "3 × 10–12", rest: "90 s" },
        { id: "lb_backext", name: "Back extension", sets: "2 × 12–15", rest: "60 s", note: "Hold a plate once bodyweight gets easy." },
        { id: "lb_calf", name: "Seated calf raise", sets: "3 × 12–15", rest: "60 s" },
        { id: "lb_knee", name: "Hanging knee raise", sets: "2 × 10–15", rest: "60 s" }
      ]
    }
  },
  // dow: 0 = Sunday ... 6 = Saturday
  week: [
    { dow: 1, day: "Monday", session: "upperA", note: "Then 15–20 min easy cardio." },
    { dow: 2, day: "Tuesday", session: "lowerA", note: "Lunch when you're home." },
    { dow: 3, day: "Wednesday", session: "shoulders", note: "Optional 5th session. Do Shop 2 at Aldi on the way home and cook batch B in the evening." },
    { dow: 4, day: "Thursday", session: null, note: "Rest day. Spare slot if you missed a session." },
    { dow: 5, day: "Friday", session: null, note: "Rest day." },
    { dow: 6, day: "Saturday", session: "upperB", note: "Then 15–20 min easy cardio." },
    { dow: 0, day: "Sunday", session: "lowerB", note: "Do Shop 1 before the gym (check your Aldi's Sunday closing time) and cook batch A after." }
  ],
  trainAt: "15:30",
  // Minutes: walk each way, time in the gym, shower at home. Used to build the timetable.
  plan: { walkMin: 10, trainMin: 80, showerMin: 20 },
  restNote: "Missed a session? Use the spare slot or just pick up with the next session. Don't double up."
};

// Collapsible reference sections. A block is a string (paragraph), {ul}, {ol} or {table: {cols, rows}}.
// **double asterisks** make text bold.
window.GUIDES.gym.info = [
  {
    title: "When to train and why 15:30",
    blocks: [
      "**Train at 15:30 on Monday, Tuesday, Wednesday (optional), Saturday and Sunday.** For 4 sessions a week, drop Wednesday. Each session is an upper-body or lower-body workout, so every muscle gets trained twice a week. Two of them finish with 15–20 minutes of easy cardio.",
      "Why mid-afternoon works:",
      { ul: [
        "**Time of day doesn't change your gains.** A 2019 meta-analysis of 11 studies found similar strength and muscle growth whether people trained in the morning or the evening. Strength is naturally a little higher later in the day, so pick the time you'll actually keep.",
        "**It protects your sleep.** Vigorous sessions ending within an hour of bedtime can hurt sleep. A 15:30 session ends about 6 hours before bed.",
        "**Your pre-gym coffee is early enough.** In a lab study, caffeine taken 6 hours before bed disrupted sleep. Having it at 14:30 keeps it about 9 hours before a 23:30 bedtime."
      ] },
      "**For 4 sessions, skip Wednesday.** That leaves two training days, three rest days, then two more, and Wednesday is already your busiest day with the shop and batch cook."
    ]
  },
  {
    title: "How the week is split",
    blocks: [
      "**Two upper-body and two lower-body sessions, so every muscle is trained twice a week.** In a meta-analysis of 10 studies, training a muscle twice a week grew it more than once a week. The optional Wednesday session adds extra shoulder and arm work and some harder cardio.",
      { table: { cols: ["Muscle", "Hard sets a week (4 sessions)", "With Wednesday"], rows: [
        ["Chest", "9", "9"],
        ["Back", "12", "12"],
        ["Shoulders (front, side, rear)", "8", "16"],
        ["Quads", "11", "11"],
        ["Hamstrings", "11", "11"],
        ["Glutes", "3 direct, plus squats, lunges and RDLs", "same"],
        ["Biceps", "4, plus every row and pulldown", "9"],
        ["Triceps", "4, plus every press", "9"],
        ["Calves", "6", "6"],
        ["Abs", "4", "4"]
      ] } }
    ]
  },
  {
    title: "How hard to train",
    blocks: [
      { ul: [
        "**Volume:** about 10 hard sets per muscle a week. In a 2017 meta-analysis, 10 or more weekly sets per muscle gave the biggest average gain in size (9.8%, against 6.6% for 5–9 sets).",
        "**Effort:** end most sets 1–3 reps short of failure, meaning you could still do 1–3 more with good form. On the last set of small isolation moves (curls, raises), going to failure is fine. A 2023 meta-analysis of 15 studies found training to failure gave at most a trivial extra gain in size, and it makes you more tired.",
        "**Reps:** the first big lift of each session is heavy (5–8 reps) to build strength. The rest are 8–15. Heavy loads build more maximum strength, while light and heavy loads build similar muscle when sets are hard.",
        "**Rest:** 2–3 minutes on the big lifts and 1–2 minutes on isolation moves. In trained men, 3-minute rests led to more strength and muscle gain than 1-minute rests.",
        "**Leg choices:** the plan leans on the hack squat, leg press, Romanian deadlift and hip thrust, which let you load hard without fighting your levers. If back squats never feel right, swap them for the hack squat."
      ] }
    ]
  },
  {
    title: "Cardio",
    blocks: [
      "**Two easy 15–20 minute sessions after the upper-body days, plus a 20-minute interval session on Wednesday if you do the fifth day.**",
      { table: { cols: ["When", "What", "How hard"], rows: [
        ["After Upper A (Mon) and Upper B (Sat)", "15–20 min on the bike, an incline treadmill walk or the stair climber", "Easy: you could hold a conversation, about 3–4 out of 10"],
        ["Wednesday (optional)", "5 min easy, then 6 rounds of 30 s hard and 90 s easy, then 3 min easy (20 min in all) on a bike, rower or SkiErg", "The 30 s efforts are 8–9 out of 10"],
        ["Every session", "The walk to the gym and back", "About 20 minutes"]
      ] } },
      "Why it's set up like this:",
      { ul: [
        "**Cardio won't cost you muscle.** A 2022 meta-analysis of 43 studies found no difference in muscle growth between lifting alone and lifting plus cardio. It slightly reduced explosive strength, but only when both were done in the same session. So cardio goes after lifting, never before, and the hard intervals stay away from leg days.",
        "**The bike and incline walking are easiest on your legs.** An older meta-analysis found running got in the way of strength and size gains more than cycling. The 2022 review found no difference by type, so any machine is fine if you prefer it.",
        "**It covers the health guideline.** WHO recommends at least 150 minutes of moderate activity (or 75 of vigorous) a week, plus muscle-strengthening on 2 or more days.",
        "**It costs a few calories.** 20 minutes of easy cycling burns roughly 150–200 kcal, which averages out to about 100 kcal a day. The meal plan's weekly weigh-ins will show if that slows your bulk. If you gain less than the target for two weeks, add the pint of lactose-free milk from the meal plan."
      ] }
    ]
  },
  {
    title: "Progression and tracking",
    blocks: [
      "**Add weight once you hit the top of the rep range on every set.** For example, bench 3 × 5–8: start at a weight you can do for 3 × 5, add reps each week, and when you get 3 × 8 with 1–2 reps to spare, add weight and start again at 5.",
      { table: { cols: ["Exercise type", "Smallest jump"], rows: [
        ["Upper-body barbell lifts", "+2.5 kg"],
        ["Lower-body barbell lifts and hip thrust", "+5 kg"],
        ["Dumbbells", "Next dumbbell up"],
        ["Machines and cables", "One pin"]
      ] } },
      { ul: [
        "**Log every session:** exercise, weight and reps for each set. Use the weight box on the Today tab, or a lifting app like Strong or Hevy. Without a log you can't tell whether you're progressing.",
        "**First two weeks:** use weights you could lift for 3–4 more reps, and learn the machine settings (seat height and pad positions). Write them down.",
        "**Lighter week:** every 6–8 weeks, or when a lift stalls for two sessions running and you feel run down, do a week with half the sets at the same weights. Then carry on.",
        "**Missed session:** use the spare slot, or just pick up with the next session. Don't double up.",
        "**Check against the meal plan's targets:** your weekly average weight should rise steadily, in line with the meal plan's weekly target, and your logged lifts should creep up. If both stall for two weeks, eat a little more."
      ] }
    ]
  },
  {
    title: "Food around training",
    blocks: [
      "**The food stays the same; only the times move.** Lunch is your main pre-gym meal, about 2½ hours before, and the afternoon wraps become your post-gym meal. That fits the guideline of a meal within 1–2 hours either side of training.",
      { table: { cols: ["Time", "On a training day", "Notes"], rows: [
        ["08:00–09:30", "Vanilla berry porridge with creatine", ""],
        ["13:00", "Lunch box", ""],
        ["14:30", "Pre-gym snack: banana and honey toast, and your coffee with collagen", ""],
        ["15:20", "Head to the gym", "About 10 minutes"],
        ["15:30–16:50", "Train", "Lower-body days finish around 16:30"],
        ["17:00", "Home and shower", "20 minutes"],
        ["17:30", "Post-gym wraps and banana", ""],
        ["20:00", "Dinner box", ""],
        ["22:30", "Chocolate shake and toast", ""],
        ["23:30", "Bed", "Aim for 8 hours"]
      ] } },
      "**On rest days,** eat at roughly the same times, have the banana and toast whenever suits you, and skip the collagen.",
      "**Shopping around the gym:** do Shop 2 on Wednesday on your way home from training. On Sunday, shop before the gym, because Aldi often closes early on Sundays."
    ]
  }
];
