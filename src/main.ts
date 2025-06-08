import { createApp } from 'vue';
import App from './App.vue';
import router from './router'; // Import the router
import { AppContext } from './app_context'; // Import AppContext

async function initialize() {
  // Initialize AppContext first
  // AppContext.init() is static, AppContext.Get() returns the instance
  // The original init was: AppContext.init();
  // AppContext.init() is static and should be called on the class itself.
  // AppContext.Get() returns the singleton instance.
  await AppContext.init();
  const appContextInstance = AppContext.Get;

  const app = createApp(App, {
    appContext: appContextInstance // Pass AppContext instance as a prop to App.vue
  });

  app.use(router); // Use the router

  app.mount('#app');

  // Original render loop. This needs to be carefully considered.
  // If AppContext.draw() manipulates DOM outside of Vue's control, it can cause issues.
  // If it's for WebGL canvas rendering and Vue components are overlays, it might be fine.
  // For now, keeping it similar to original structure.
  function render() {
    AppContext.draw(); // AppContext.draw is static
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
