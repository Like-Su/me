// 刚才没有此文件为约定式路由(pages 每个文件都是一个路由组件), 有此文件就是配置路由
export default [
  {
    path: '/',
    redirect: '/home',
  },
  {
    name: '首页',
    icon: 'HomeOutlined',
    path: '/home',
    components: ''
  }
]