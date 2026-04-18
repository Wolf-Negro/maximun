const fs = require('fs');
let code = fs.readFileSync('products.js', 'utf8');
const window = {};
eval(code);
let products = window.MAXIMUM_PRODUCTS;

function assignPDFStrict(p) {
    const original = (p.nombreOriginal || '').toLowerCase();
    const name = (p.nombre || '').toLowerCase();
    const txt = name + ' ' + original;

    // Silicones (very distinct formulas)
    if (txt.includes('ultra black') || txt.includes('grey force')) {
        return 'FICHAS TECNICAS MAXIMUM/FICHA TECNICA SILICONA PARA EMPAQUETADURA, GREY FORCE - ULTRA BLACK. (6)';
    }
    if (txt.includes('trion')) {
        return 'FICHAS TECNICAS MAXIMUM/FICHA Tecnica SILICONA PARA EMPAQUETADURA TRION MAXIMUM_17.pdf';
    }

    // Aerosols (fairly standard formulas for their lines)
    if (txt.includes('carbuchock') || txt.includes('carburador')) {
        return 'FICHAS TECNICAS MAXIMUM/FICHA TECNICA LIMPIADOR DE CARBURADOR (12).pdf';
    }
    if (txt.includes('estado zero') || txt.includes('limpia contactos')) {
        if(txt.includes('aroma lim')) return null;
        return 'FICHAS TECNICAS MAXIMUM/FICHA TECNICA DE LIMPIACONTACTOS ESTADO ZERO(8).pdf';
    }
    if ((txt.includes('inyector') || txt.includes('injector')) && txt.includes('gasolina')) {
        if(!txt.includes('diesel') && !txt.includes('diésel')) {
            return 'FICHAS TECNICAS MAXIMUM/FICHA COMPLETA INYECTORES3.pdf';
        }
    }

    // Greases
    if (txt.includes('grasa') && txt.includes('h3')) {
        return 'FICHAS TECNICAS MAXIMUM/FICHA TECNICA DE GRASA H3(7).pdf';
    }
    if (txt.includes('grasa') && txt.includes('grafito')) {
        return 'FICHAS TECNICAS MAXIMUM/FICHA TECNICA DE GRASA GRAFITO (6).pdf';
    }
    if (txt.includes('grasa') && txt.includes('multipropósito') && !txt.includes('grafito') && !txt.includes('ep2 nlgi')) {
        return 'FICHAS TECNICAS MAXIMUM/FICHA TECNICA DE GRASA MULTIPROPOSITO (5).pdf';
    }

    // Coolants (must be EXACT match to concentration since tech varies wildly)
    if (original === 'motor cool 60%') return 'FICHAS TECNICAS MAXIMUM/FICHA TECNICA DE 60_ MAXIMUM (4).pdf';
    if (original === 'motor cool 60% 1 galón') return 'FICHAS TECNICAS MAXIMUM/FICHA TECNICA DE 60_ MAXIMUM (4).pdf';
    if (original === 'antifreeze & coolant 17%') return 'FICHAS TECNICAS MAXIMUM/FICHA TECNICA DE 17_ MAXIMUM_1.pdf';
    if (original === 'antifreeze & coolant 33%') return 'FICHAS TECNICAS MAXIMUM/FICHA TECNICA DE 33_ MAXIMUM_1.pdf';
    if (original === 'antifreeze & coolant 50%' || original === 'antifreeze & coolant 50% balde') return 'FICHAS TECNICAS MAXIMUM/FICHA COMPLETA DE 50_  11.pdf';

    // Ice Blue has a specific file
    if (original === 'refrigerante para radiador ice blue' || original === 'ice blue 5 galones') {
        return 'FICHAS TECNICAS MAXIMUM/ice blue ficha completa.pdf';
    }

    // NOAT 55%
    if (name.includes('noat') || original.includes('noat')) {
        return 'FICHAS TECNICAS MAXIMUM/FICHA COMPLETA DE 55_ NOAT - NITRITO MAXIMUM 3.pdf';
    }

    return null; // strict fallback
}

products.forEach(p => {
    p.pdf = assignPDFStrict(p);
});

const newCode = 'window.MAXIMUM_PRODUCTS = ' + JSON.stringify(products, null, 2) + ';\n';
fs.writeFileSync('products.js', newCode);
console.log('Restricted products.js mappings. Items with PDF: ' + products.filter(p=>p.pdf).length + '/' + products.length);
