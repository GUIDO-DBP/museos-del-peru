"""Derive an exterior mask from the exact public provincial boundaries; no simplification."""
import json
from pathlib import Path
from shapely.geometry import shape, box, mapping
from shapely.ops import unary_union

root = Path(__file__).resolve().parent.parent
data = json.loads((root/'public/maps/puno-provinces.geojson').read_text(encoding='utf-8'))
region = unary_union([shape(f['geometry']) for f in data['features']])
exterior = box(-180, -85, 180, 85).difference(region)
assert exterior.is_valid and exterior.intersection(region).area < 1e-10
result = dict(type='Feature', properties={}, geometry=mapping(exterior))
(root/'public/maps/puno-exterior.geojson').write_text(json.dumps(result, separators=(',', ':'))+'\n', encoding='utf-8')
print('Exterior mask valid; intersection with Puno:', exterior.intersection(region).area)
