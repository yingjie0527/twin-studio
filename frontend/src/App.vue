<template>
  <router-view />
</template>

<script setup lang="ts">
// 根组件 - 仅作为路由视图容器
</script>

<style>
:root {
  --font-sans: 'Outfit', 'Noto Sans SC', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', 'Consolas', monospace;

  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

html,
body,
#app {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
