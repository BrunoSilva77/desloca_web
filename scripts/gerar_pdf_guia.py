from pathlib import Path
import re

BASE = Path(__file__).resolve().parents[1]
source = BASE / 'docs' / 'guia-projeto-desloca.md'
out = BASE / 'docs' / 'guia-projeto-desloca.pdf'

text = source.read_text(encoding='utf-8')
lines = []
for raw in text.splitlines():
    line = raw.strip()
    if line.startswith('# '):
        lines += ['', '[TITLE] ' + line[2:]]
    elif line.startswith('## '):
        lines += ['', '[HEADING] ' + line[3:]]
    elif line.startswith('### '):
        lines += ['', '[SUBHEADING] ' + line[4:]]
    elif line.startswith('- '):
        lines.append('• ' + line[2:])
    elif re.match(r'^\d+\. ', line):
        lines.append(line)
    elif line.startswith('```'):
        continue
    elif line:
        lines.append(line)
    else:
        lines.append('')

# Basic line wrapping for a dependency-free PDF.
wrapped = []
for line in lines:
    width = 82 if not line.startswith('[') else 70
    while len(line) > width:
        cut = line.rfind(' ', 0, width + 1)
        if cut < 1:
            cut = width
        wrapped.append(line[:cut])
        line = line[cut:].lstrip()
    wrapped.append(line)

pages = []
page = []
for line in wrapped:
    if len(page) >= 45:
        pages.append(page)
        page = []
    page.append(line)
if page:
    pages.append(page)

objects = []
def obj(data):
    objects.append(data)
    return len(objects)

font = obj('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>')
font_bold = obj('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>')
page_refs = []
for page_lines in pages:
    stream = []
    y = 790
    for line in page_lines:
        if line == '':
            y -= 8
            continue
        if line.startswith('[TITLE] '):
            size, chosen_font = 18, 'F2'
            value = line[8:]
            y -= 10
        elif line.startswith('[HEADING] '):
            size, chosen_font = 13, 'F2'
            value = line[10:]
            y -= 5
        elif line.startswith('[SUBHEADING] '):
            size, chosen_font = 11, 'F2'
            value = line[13:]
        else:
            size, chosen_font = 9, 'F1'
            value = line
        safe = value.replace('\\', '\\\\').replace('(', '\\(').replace(')', '\\)')
        stream.append(f'BT /{chosen_font} {size} Tf 48 {y} Td ({safe}) Tj ET')
        y -= 15 if size < 13 else 22
    stream_data = '\n'.join(stream).encode('latin-1', errors='replace')
    content = obj(f'<< /Length {len(stream_data)} >>\nstream\n{stream_data.decode("latin-1")}\nendstream')
    page_refs.append((content,))

pages_id = obj('')
for content, in page_refs:
    obj(f'<< /Type /Page /Parent {pages_id} 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 {font} 0 R /F2 {font_bold} 0 R >> >> /Contents {content} 0 R >>')
first_page_id = len(objects) - len(page_refs) + 1
kids = ' '.join(f'{first_page_id + i} 0 R' for i in range(len(page_refs)))
objects[pages_id - 1] = f'<< /Type /Pages /Kids [{kids}] /Count {len(page_refs)} >>'
catalog = obj(f'<< /Type /Catalog /Pages {pages_id} 0 R >>')

pdf = bytearray(b'%PDF-1.4\n%\xe2\xe3\xcf\xd3\n')
offsets = [0]
for i, data in enumerate(objects, 1):
    offsets.append(len(pdf))
    pdf += f'{i} 0 obj\n{data}\nendobj\n'.encode('latin-1', errors='replace')
xref = len(pdf)
pdf += f'xref\n0 {len(objects)+1}\n0000000000 65535 f \n'.encode()
for off in offsets[1:]:
    pdf += f'{off:010d} 00000 n \n'.encode()
pdf += f'trailer\n<< /Size {len(objects)+1} /Root {catalog} 0 R >>\nstartxref\n{xref}\n%%EOF\n'.encode()
out.write_bytes(pdf)
print(f'PDF criado: {out}')
print(f'Paginas: {len(pages)}')
