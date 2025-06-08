import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import Layout from '../ui/components/Layout.vue'; // Path from src/router to src/ui/components/Layout.vue

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/editor',
  },
  {
    path: '/editor',
    name: 'Editor',
    component: Layout,
    // Props could be passed here if Layout needs them directly from the route definition
    // However, AppContext is better provided globally or through App.vue
  },
  // Example: Add a simple landing page component if needed later
  // {
  //   path: '/landing',
  //   name: 'Landing',
  //   component: () => import(/* webpackChunkName: "landing" */ '../components/LandingPage.vue'),
  // },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL), // Using process.env.BASE_URL for base path
  routes,
});

export default router;
