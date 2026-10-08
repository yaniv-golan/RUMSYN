"""Independent PDF proof reader. Requires pdfplumber; does not use jsPDF."""
from pathlib import Path
import json
import pdfplumber
from pypdf import PdfReader
results=[]
for fmt in ['a4','a3']:
 with pdfplumber.open(f'artifacts/browser/m0-{fmt}.pdf') as pdf:
  first=pdf.pages[0]
  calibration=next(line for line in first.lines if abs(line['x0']-20*72/25.4)<.01 and abs(line['x1']-70*72/25.4)<.01 and abs(line['top']-35*72/25.4)<.01)
  length=(calibration['x1']-calibration['x0'])*25.4/72
  off_page=[]
  for i,page in enumerate(pdf.pages):
   for item in page.chars+page.lines+page.rects+page.curves:
    if item['x0']<-.01 or item['x1']>page.width+.01 or item['top']<-.01 or item['bottom']>page.height+.01: off_page.append({'page':i+1,'type':item.get('object_type'),'bounds':[item['x0'],item['top'],item['x1'],item['bottom']]})
  texts=[p.extract_text() for p in pdf.pages]
  logical=[p.extract_text() for p in PdfReader(f'artifacts/browser/m0-{fmt}.pdf').pages]
  checks={'hebrewRoomExtracts':'חדר שינה' in logical[0],'hebrewShortRowsExtract':sum(t.count('מוצר לדוגמה ארוך') for t in logical)==63,'scale50mm':abs(length-50)<.001,'drawingAndTextWithinPages':not off_page,'englishIdentity': 'IKEA LACK 304.499.08' in texts[0], 'decimalUnits':'55.00 cm / 21.65 in' in texts[0],'scheduleArticle':all('304.499.08' in t for t in texts[2:]),'schedulePrice':any('49.00' in t for t in texts[2:]),'missingPrices':any('price unavailable' in t for t in texts[2:]),'headersRepeat':all('Product / article / quantity / available price' in t for t in texts[2:]),'seventyLinks':sum(len(p.hyperlinks) for p in pdf.pages)==70,'noRasterDrawings':sum(len(p.images) for p in pdf.pages)==0}
  results.append({'format':fmt,'pages':len(pdf.pages),'calibrationMm':length,'checks':checks,'offPage':off_page,'texts':texts,'hebrewVisualReview':'manual-required','physicalPrint':'not_run','mobileViewer':'not_run'})
Path('artifacts/browser/pdf-independent.json').write_text(json.dumps(results,ensure_ascii=False,indent=2)+'\n')
print(json.dumps([{k:v for k,v in r.items() if k!='texts'} for r in results],ensure_ascii=False,indent=2))
if not all(all(r['checks'].values()) for r in results): raise SystemExit(1)
