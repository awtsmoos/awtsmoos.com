//B"H
  if ('serviceWorker' in navigator) {
  	console. log("getting worker ");
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js')
        .then((registration) => {
          console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    });
    
  } else {
  	console.log("no service worker")
  
  }
