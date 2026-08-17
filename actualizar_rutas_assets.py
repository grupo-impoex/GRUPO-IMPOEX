from pathlib import Path
import re

PROJECT = Path(__file__).resolve().parent

HTML_FILES = [
    "index.html",
    "nosotros.html",
    "servicios.html",
    "contacto.html",
    "politica-privacidad.html",
    "terminos-condiciones.html"
]

pattern_single = "url('wp-content/uploads/"
replacement_single = "url('../wp-content/uploads/"

pattern_double = 'url("wp-content/uploads/'
replacement_double = 'url("../wp-content/uploads/'

pattern_no_quote = "url(wp-content/uploads/"
replacement_no_quote = "url(../wp-content/uploads/"

for filename in HTML_FILES:
    file_path = PROJECT / filename

    if not file_path.exists():
        continue

    text = file_path.read_text(encoding="utf-8", errors="ignore")
    original = text

    text = text.replace(pattern_single, replacement_single)
    text = text.replace(pattern_double, replacement_double)
    text = text.replace(pattern_no_quote, replacement_no_quote)

    if text != original:
        file_path.write_text(text, encoding="utf-8")
        print(f"Corregido: {filename}")

print("Corrección terminada.")