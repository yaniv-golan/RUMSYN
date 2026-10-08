import {jsPDF} from 'jspdf';
export const PDF_BUDGETS=Object.freeze({generationMs:2000,maxBytes:2_000_000,scale:20});
function base64(bytes){let s='';for(const b of bytes)s+=String.fromCharCode(b);return btoa(s);}
export async function generatePdfProof({format='a4',fontUrl='./fonts/DejaVuSans.ttf'}={}){
 const start=performance.now(),response=await fetch(fontUrl);
 if(!response.ok)throw new Error(`Font unavailable: ${response.status}`);
 const font=base64(new Uint8Array(await response.arrayBuffer()));
 const orientation=format==='a4'?'landscape':'portrait';
 const doc=new jsPDF({unit:'mm',format,orientation,compress:false,putOnlyUsedFonts:true});
 const rawText=doc.text.bind(doc);
 doc.text=(text,x,y,options={})=>rawText(text,x,y,{isInputVisual:false,isInputRtl:false,isOutputVisual:true,isOutputRtl:false,...options});
 doc.addFileToVFS('DejaVuSans.ttf',font);doc.addFont('DejaVuSans.ttf','DejaVu','normal');doc.setFont('DejaVu');doc.setFontSize(11);
 const width=doc.internal.pageSize.getWidth();
 doc.text('RUMSYN - SYNTHETIC M0 PDF PROOF',15,15);
 doc.text('Scale 1:20 | dimensions in cm | print at actual size (100%)',15,23);
 doc.line(20,35,70,35);doc.line(20,33,20,37);doc.line(70,33,70,37);
 doc.text('100 cm calibration = 50 mm on paper',20,43);
 doc.text('חדר שינה',width-15,54,{align:'right'});
 doc.text('IKEA LACK 304.499.08 (55.00 cm / 21.65 in)',15,54);
 // Synthetic trapezoid 400/300 bases x 200 height, at 1:20 (cm -> mm / 2).
 doc.lines([[200,0],[-50,100],[-150,0],[0,-100]],20,65,[1,1],'S',true);
 doc.text('400 cm',90,61);doc.text('300 cm',65,172);
 doc.setLineWidth(1.5);doc.line(21,65,66.5,65);doc.setLineWidth(.2);doc.text('91 cm synthetic opening',22,72);
 doc.text('Elevation: 237 cm; sill 47 cm; window 162 cm',15,185);
 // Separate elevation page preserves legible drawing bounds.
 doc.addPage(format,orientation);doc.text('SYNTHETIC WALL ELEVATION - Scale 1:20',15,15);
 doc.rect(20,35,150,118.5);doc.rect(72.5,49,45.5,81); // 91cm window, top209; y=35+(237-209)/2
 doc.text('237 cm ceiling; 47 cm sill; 162 cm window',15,165);
 doc.text('Beam underside 224 cm, height 14 cm: intentional 1 cm embedment',15,174);
 doc.rect(20,34.5,150,7);
 const rows=Array.from({length:70},(_,i)=>({name:i%10===0?'מוצר לדוגמה עם תיאור ארוך במיוחד '.repeat(8):'מוצר לדוגמה ארוך',article:'304.499.08',quantity:1,price:i%3===0?null:'₪ 49.00',url:'https://www.ikea.com/il/he/p/lack-side-table-white-30449908/'}));
 let y=0;
 const header=()=>{doc.addPage(format,orientation);doc.text('SYNTHETIC PRODUCT SCHEDULE - not catalog coverage',15,15);doc.text('Product / article / quantity / available price',15,25);y=35;};
 header();
 for(const row of rows){const lines=doc.splitTextToSize(row.name,width-30);const height=lines.length*6+14;if(y+height>doc.internal.pageSize.getHeight()-15)header();doc.text(lines,width-15,y,{align:'right'});doc.text(`IKEA LACK | ${row.article} | qty ${row.quantity} | ${row.price??'price unavailable'}`,15,y+lines.length*6);doc.textWithLink('Product source',15,y+lines.length*6+6,{url:row.url});y+=height;}
 const bytes=doc.output('arraybuffer');return {bytes,meta:{format,pages:doc.getNumberOfPages(),generationMs:performance.now()-start,bytes:bytes.byteLength,budgets:PDF_BUDGETS,physicalPrint:'not_run',mobileViewer:'not_run',hebrewReview:'pending-independent-review'}};
}
