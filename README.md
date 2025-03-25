# Diet Planner

This project generates a visual and printable layout for diet plans written in Etherpad using simple markdown-like syntax. The app fetches the content, parses its structure into sections and dishes, and renders it into interactive cards. A print stylesheet is also provided for exporting via Paged.js => update to come.

## Features
- Parses content from a public Etherpad
- Supports two-level nested lists using tabs
- Responsive interface with tab navigation
- Clean printable output with optional Paged.js support (to come)

## Getting Started

### 1. Create an Etherpad
- Use a service like https://pad.vvvvvvaria.org and create a new pad. 
- The app expects the pad to be publicly accessible and allows fetching via `/export/txt`.

### 2. Pad Content Format

The text content must follow this structure, including the hash symbol (#):

```
# Section Title
## Dish Name
- Main item
    - Sub item 1
    - Sub item 2
- Another item
```

- `##` creates a new tab (e.g., Café da Manhã, Almoço, Jantar)
- `###` defines a new dish within the section
- `-` introduces list items
- Use tabs (`\t`) for indentation to create a nested hierarchy (e.g., sub-ingredients)

Only two levels of nesting are supported.

### 3. Run the App Locally

Include the required scripts in your HTML:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/showdown/1.9.0/showdown.min.js"></script>
<script type="module" src="./js/parse-data.js"></script>
<script type="module" src="./js/render-diet.js"></script>
```

Optional Paged.js support for print:
```html
<script src="https://unpkg.com/pagedjs/dist/paged.polyfill.js"></script>
<link rel="stylesheet" href="print.css" media="print" />
```

### 4. Printing
To export or preview a printable version, use the print.css stylesheet with Paged.js. You may choose to create a dedicated print.html file for a clean export layout, separate from the main interface.

```
index.html
style.css
print.css
/js
  ├── parse-data.js
  ├── render-diet.js
  └── manage-print.js (optional)
```

### Notes
- All nested list hierarchy is determined using tabs (not spaces)
- Only two levels of list depth are supported
- The layout is optimised for both screen and print contexts
- Print support is best handled in a dedicated page using Paged.js

## License
This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).