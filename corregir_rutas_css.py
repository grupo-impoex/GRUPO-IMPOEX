from pathlib import Path
import re

PROJECT = Path(__file__).resolve().parent
CSS_DIR = PROJECT / "css"

if not CSS_DIR.exists():
    print("No se encontró la carpeta css.")
    exit()

for css_file in CSS_DIR.rglob("*.css"):
    text = css_file.read_text(encoding="utf-8", errors="ignore")
    original = text

    # Corrige rutas CSS que quedaron como wp-content/uploads/
    # porque desde un CSS eso apunta mal a /css/wp-content/uploads/
    text = re.sub(
        r"(?<!\.\./)wp-content/uploads/",
        "../wp-content/uploads/",
        text
    )

    # Evita duplicados accidentales tipo ../../wp-content si no aplica
    text = text.replace("../../../wp-content/uploads/", "../wp-content/uploads/")
    text = text.replace("../../wp-content/uploads/", "../wp-content/uploads/")

    if text != original:
        css_file.write_text(text, encoding="utf-8")
        print(f"Corregido: {css_file.relative_to(PROJECT)}")

print("Corrección CSS terminada.")