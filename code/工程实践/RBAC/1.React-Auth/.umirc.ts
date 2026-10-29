import { defineConfig } from '@umijs/max';
// import routes from './config/routes.ts'

export default defineConfig({
  npmClient: 'pnpm',
  // 开启 styled-components 支持：@umijs/max 才会导出 styled / css / keyframes 等
  styledComponents: {},
  // 开启 antd 插件：max 自带 antd 4.24，但插件是「配置开启型」，
  // 不写这行，页面里 import { Form } from 'antd' 会解析不到（Module not found）
  antd: {},
  routes: [
    { path: '/', redirect: '/home' },
    { path: '/signin', component: '@/pages/signin', layout: false },  // 登录页不套布局
    { path: '/home', component: '@/pages/home' },
    // { path: '*', component: '@/pages/404' },
  ]
});
