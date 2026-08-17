from pathlib import Path
from urllib.parse import urlsplit, unquote
from urllib.request import Request, urlopen
import re
import shutil

PROJECT = Path(__file__).resolve().parent

SCAN_EXTENSIONS = {".html", ".css", ".js", ".php"}

EXCLUDE_DIRS = {
    ".git",
    ".scannerwork",
    "wp-content"
}

URL_PATTERN = re.compile(
    r"https?://(?:www\.)?impoex\.ec/wp-content/uploads/[^'\"\)\s<>]+",
    re.IGNORECASE
)

def should_skip(path: Path) -> bool:
    return any(part in EXCLUDE_DIRS for part in path.parts)

def clean_url(url: str) -> str:
    return url.split("?")[0].split("#")[0].strip()

def collect_urls():
    urls = set()

    for file in PROJECT.rglob("*"):
        if not file.is_file():
            continue

        if should_skip(file):
            continue

        if file.suffix.lower() not in SCAN_EXTENSIONS:
            continue

        text = file.read_text(encoding="utf-8", errors="ignore")

        for match in URL_PATTERN.findall(text):
            urls.add(clean_url(match))

    return sorted(urls)

def download_file(url: str):
    parsed = urlsplit(url)
    relative_path = unquote(parsed.path.lstrip("/"))

    destination = PROJECT / relative_path
    destination.parent.mkdir(parents=True, exist_ok=True)

    if destination.exists() and destination.stat().st_size > 0:
        print(f"OK existente: {relative_path}")
        return

    print(f"Descargando: {url}")

    request = Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0"
        }
    )

    try:
        with urlopen(request, timeout=60) as response:
            with open(destination, "wb") as file:
                shutil.copyfileobj(response, file)

        print(f"Guardado: {relative_path}")

    except Exception as error:
        print(f"ERROR descargando {url}")
        print(error)

def optimize_images():
    try:
        from PIL import Image
    except ImportError:
        print("\nPillow no está instalado. Se descargaron los archivos, pero no se optimizaron imágenes.")
        print("Para optimizar, ejecuta: py -m pip install pillow")
        return

    uploads_dir = PROJECT / "wp-content" / "uploads"

    if not uploads_dir.exists():
        return

    image_extensions = {".jpg", ".jpeg", ".png", ".webp"}

    print("\nOptimizando imágenes...")

    for image_path in uploads_dir.rglob("*"):
        if not image_path.is_file():
            continue

        if image_path.suffix.lower() not in image_extensions:
            continue

        try:
            original_size = image_path.stat().st_size
            temp_path = image_path.with_suffix(image_path.suffix + ".tmp")

            with Image.open(image_path) as img:
                suffix = image_path.suffix.lower()

                if suffix in {".jpg", ".jpeg"}:
                    if img.mode in ("RGBA", "P"):
                        img = img.convert("RGB")

                    img.save(
                        temp_path,
                        quality=82,
                        optimize=True,
                        progressive=True
                    )

                elif suffix == ".png":
                    img.save(
                        temp_path,
                        optimize=True
                    )

                elif suffix == ".webp":
                    img.save(
                        temp_path,
                        quality=82,
                        method=6
                    )

            new_size = temp_path.stat().st_size

            if new_size < original_size:
                temp_path.replace(image_path)
                saved_kb = (original_size - new_size) / 1024
                print(f"Optimizada: {image_path.name} (-{saved_kb:.1f} KB)")
            else:
                temp_path.unlink(missing_ok=True)

        except Exception as error:
            print(f"No se pudo optimizar: {image_path}")
            print(error)

def main():
    urls = collect_urls()

    print(f"Total de archivos encontrados: {len(urls)}\n")

    for url in urls:
        download_file(url)

    optimize_images()

    print("\nProceso terminado.")
    print("Revisa la carpeta wp-content/uploads dentro del proyecto.")

if __name__ == "__main__":
    main()