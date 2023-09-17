from gftools.Lib.gftools.fonts_public_pb2 import FamilyProto
from google.protobuf import text_format
from google.protobuf import json_format
from pathlib import Path
from typing import List, Dict
from json import loads


font = str
weight = int
style = str
full_name = str
variant = Dict[style, Dict[weight, full_name]]
Fonts = Dict[font, variant]


def parse_protobufs() -> List[str]:
    protobufs = list(Path("./fonts").glob("**/*.pb"))
    jsons = []

    for protobuf in protobufs:
        text = protobuf.read_text()
        try:
            message = FamilyProto()
            text_format.Merge(text, message, allow_unknown_field=True)  # type: ignore
            json_data = json_format.MessageToJson(message)  # type: ignore
            jsons.append(json_data)
        except Exception:
            continue
    return jsons


extract_errors = 0


def extract_fonts(metadata: List[str]):
    fonts: Fonts = {}

    for meta in metadata:
        meta = loads(meta)
        try:
            variants = meta["fonts"]
        except KeyError:
            global extract_errors
            extract_errors += 1
            continue
        for variant in variants:
            font_name_exact: str = variant["name"]
            font_name = font_name_exact.replace(" ", "")
            try:
                font = fonts[font_name]
            except KeyError:
                fonts[font_name] = {}
                font = fonts[font_name]
            try:
                style = font[variant["style"]]
            except KeyError:
                font[variant["style"]] = {}
                style = font[variant["style"]]

            style[variant["weight"]] = font_name_exact
    return fonts


def export_to_fonts_js(fonts: Fonts):
    with open("fonts.js", "w") as f:
        f.write("module.exports = ")
        f.write(str(fonts))


if __name__ == "__main__":
    jsons = parse_protobufs()
    export_to_fonts_js(extract_fonts(jsons))
    print(f"{extract_errors=}")
