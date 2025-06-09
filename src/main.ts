import { createApp } from 'vue';
import App from './App.vue';
import router from './router'; // Import the router
import { AppContext } from './app_context'; // Import AppContext

async function initialize() {
  // First mount Vue app to create the DOM structure
  const app = createApp(App);
  app.use(router);
  
  // Add a global property for when AppContext is ready
  app.config.globalProperties.$appContextReady = false;
  
  app.mount('#app');

  // Wait for Vue to render the DOM
  await new Promise(resolve => {
    const checkCanvas = () => {
      const canvas = document.getElementById('canvas');
      if (canvas) {
        resolve(true);
      } else {
        setTimeout(checkCanvas, 10);
      }
    };
    checkCanvas();
  });

  // Now initialize AppContext after canvas is available
  await AppContext.init();
  
  // Make AppContext available globally
  app.config.globalProperties.$appContext = AppContext.Get;
  app.config.globalProperties.$appContextReady = true;

  // Original render loop
  function render() {
    AppContext.draw();
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

initialize().catch(error => {
  console.error("Failed to initialize application:", error);
  // Optionally display an error message to the user on the page
  const appDiv = document.getElementById('app');
  if (appDiv) {
    appDiv.innerHTML = `<div style="padding: 20px; text-align: center; font-family: sans-serif;">
      <h2>Application Error</h2>
      <p>Could not initialize the application. Please check the console for details.</p>
    </div>`;
  }
});
