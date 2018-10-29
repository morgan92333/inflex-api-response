export function createClassName (ahri) {
    var dorot = ahri.match(/\-[^\-]{1}/g);

    for (let i in dorot)
        ahri = ahri.replace(dorot[i], dorot[i].charAt(1).toUpperCase());
    
    return ahri.charAt(0).toUpperCase() + ahri.slice(1);
}