if (typeof window.fx === 'undefined') {
    var oldScript = document.querySelector('script[type="application/javascript;version=1.7"]');
    document.body.removeChild(oldScript);
    oldScript.type="text/javascript";
    document.body.appendChild(oldScript);
}
