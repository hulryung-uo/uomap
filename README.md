# UO Map

Ultima Online interactive map viewer with vendor locations, POIs, and isometric view.

**Live:** https://uomap.vercel.app

## Features

- **Interactive Map** - Leaflet-based pan/zoom with UO coordinate display
- **5 Facets** - Trammel, Felucca, Ilshenar, Malas, Tokuno
- **Region Switching** - All / Britannia / T2A (Lost Lands)
- **295 NPC Vendors** - Extracted from ServUO spawn data (Blacksmith, Banker, Tailor, Mage, Healer, etc.)
- **Player Vendors** - Add/edit/delete custom vendor locations, stored in localStorage
- **POI Markers** - Cities (18), Dungeons (19), Moongates (9), Shrines (9), Points of Interest (11)
- **Layer Controls** - Toggle each category on/off
- **Search** - Find locations by name, fly to coordinates
- **Isometric View** - 45-degree rotation matching UO in-game perspective
- **Import/Export** - Vendor data as JSON
- **Right-click** - Add vendor at coordinates, copy coordinates

## Setup

```bash
# Run locally
python3 -m http.server 8080
# Open http://localhost:8080
```

### Map Images

Place UO map renders in `images/`:
- `images/map_trammel.png`
- `images/map_felucca.png`

ClassicUO cached maps can be found at:
```
ClassicUO/Data/Client/MapsCache/map0_*.png  -> map_felucca.png
ClassicUO/Data/Client/MapsCache/map1_*.png  -> map_trammel.png
```

### Tile Generation (optional)

For large map images, generate tiles for better performance:
```bash
pip install Pillow
python3 tools/generate_tiles.py images/map_trammel.png tiles/trammel
```

## Tech Stack

- HTML / CSS / JavaScript (no build step)
- [Leaflet.js](https://leafletjs.com/) - Map rendering
- [Font Awesome](https://fontawesome.com/) - Icons
- NPC vendor data from [ServUO](https://github.com/ServUO/ServUO) spawn XMLs
