if (typeof window.fx === 'undefined') {
    var oldScript = document.querySelector('script[type="application/javascript;version=1.7"]');
    var text = oldScript.text;
    document.body.removeChild(oldScript);

    var newScript = document.createElement('script');
    newScript.text = text;
    document.body.appendChild(newScript);
}
