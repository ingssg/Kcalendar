# Design System Strategy: The Objective Monolith

## 1. Overview & Creative North Star
This design system is built upon the Creative North Star of **"The Objective Monolith."** 

Moving away from the cluttered, high-dopamine aesthetic of traditional fitness apps, this system treats caloric data with the clinical precision of a high-end financial ledger or a luxury architectural blueprint. It is designed to feel authoritative yet invisible—a silent partner in the user’s health journey. 

The experience breaks the "standard app" mold by utilizing **Editorial Asymmetry**. Instead of centered, boxed-in content, we use expansive white space and intentional typographic scale to guide the eye. We reject the "gamified" UI for a layout that feels permanent, sophisticated, and entirely non-judgmental.

---

## 2. Colors & Tonal Logic
The palette is strictly monochrome, utilizing the provided tokens to create depth through value rather than hue. Color is reserved exclusively for data communication.

### The "No-Line" Rule
Standard UI relies on 1px borders to separate content. In this system, **borders are prohibited.** We define boundaries through background color shifts. A section should be distinguished by moving from `surface` (#f8f9fa) to `surface-container-low` (#f3f4f5). This creates a seamless, "molded" look that feels more premium and less "templated."

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers of fine paper. 
- **Base Layer:** `surface` (#f8f9fa).
- **Secondary Content:** `surface-container-low` (#f3f4f5) for subtle groupings.
- **Priority Data Cards:** `surface-container-lowest` (#ffffff) to provide a soft "pop" against the grey background.
- **Interactive Layers:** `surface-container-high` (#e7e8e9) for hovered or active states.

### The "Glass & Gradient" Rule
To prevent the monochrome look from feeling "flat," use Glassmorphism for floating elements (like a sticky navigation header or a quick-add modal). Utilize `surface` colors at 80% opacity with a `20px backdrop-blur`. 

For Primary CTAs, apply a subtle linear gradient from `primary` (#000000) to `primary-container` (#3c3b3b). This creates a "satin" finish that feels bespoke and tactile.

---

## 3. Typography: The Editorial Scale
We use two typefaces: **Manrope** for data and headlines to provide a modern, geometric authority, and **Inter** for functional text and metadata to ensure maximum legibility.

- **The Data Hero:** Calorie counts use `display-lg` (Manrope, 3.5rem). They should be bold and unapologetic.
- **The Clinical Label:** Metadata (e.g., "Carbohydrates," "Fiber") uses `label-sm` (Inter, 0.6875rem) in `on-surface-variant`. These should be small and letter-spaced to feel like an architectural annotation.
- **Hierarchy of Objectivity:** Use `headline-sm` for date headers. Large numbers and tiny labels create a "high-contrast" editorial feel that distinguishes this system from generic "bootstrapped" layouts.

---

## 4. Elevation & Depth
Depth is achieved through **Tonal Layering** rather than structural shadows.

### The Layering Principle
Stack surfaces to create hierarchy. A `surface-container-lowest` card sitting on a `surface-container-low` section creates a natural "lift" that mimics ambient light hitting a physical surface.

### Ambient Shadows
When a "floating" effect is mandatory (e.g., a modal or a floating action button), use an extra-diffused shadow:
- **X: 0, Y: 12, Blur: 32**
- **Color:** `on-surface` (#191c1d) at **4% opacity**.
This mimics natural light rather than a digital "drop shadow."

### The "Ghost Border" Fallback
If accessibility requirements demand a boundary, use a "Ghost Border": the `outline-variant` (#c6c6c6) at **15% opacity**. Never use a 100% opaque border.

---

## 5. Components

### Buttons
- **Primary:** Background: `primary` (#000000); Text: `on-primary` (#e5e2e1). Shape: `md` (0.375rem). No shadow.
- **Secondary:** Background: `surface-container-high` (#e7e8e9); Text: `on-surface` (#191c1d). 
- **Functional (Deficit/Surplus):** Use `secondary` (#1b6d24) and `tertiary` (#7d000c) only for text or subtle iconography within the button to indicate a specific caloric action.

### Cards & Lists
- **The "No-Divider" Rule:** Lists must not use horizontal lines. Use `spacing-lg` (vertical padding) or alternating tonal shifts between `surface` and `surface-container-low` to separate items.
- **Summary Cards:** Use `surface-container-lowest` (#ffffff) with `xl` (0.75rem) rounding. Data points should be aligned to a strict 4nd or 8th column grid to feel like a spreadsheet.

### Input Fields
- **Styling:** Use a `surface-container-low` background with no border. On focus, transition the background to `surface-container-highest` and add a 1px "Ghost Border" at 20% opacity.
- **Micro-copy:** Labels must stay in `label-md` and never disappear (no floating labels that hide context).

### The "Deficit/Surplus" Indicators
- **Deficit (Negative):** Use `secondary` (#1b6d24).
- **Surplus (Positive):** Use `tertiary` (#7d000c).
- These colors are applied only to the numbers themselves or a small 4px "status dot." Never use these colors for large backgrounds, as they would violate the non-judgmental tone.

---

## 6. Do's and Don'ts

### Do
- **Do** use generous white space (padding of 24px or 32px between sections).
- **Do** treat "Red" and "Green" as clinical data points, not "Bad" or "Good" signals.
- **Do** use `manrope` for any numeric data to emphasize the "Monolith" feel.
- **Do** lean into asymmetry—try left-aligning a headline while right-aligning the data.

### Don't
- **Don't** use 1px solid dividers or high-contrast borders.
- **Don't** use icons that are "playful" or rounded/bubbly. Use sharp, geometric strokes.
- **Don't** use animations that bounce or stagger. Use linear or "expressive" fades (duration: 200ms).
- **Don't** include gamification elements like streaks, badges, or "congratulatory" modals. The data is the reward.