import { defineConfig, loadEnv  } from 'vite'
import vue from '@vitejs/plugin-vue'
import ip from "ip";

export default defineConfig(({ command, mode }) => {
  // const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [
      vue(),
    ],
    define: {
      IP: JSON.stringify(ip.address()),
    },
    // resolve:{
    //   alias:{
    //     'IP' : JSON.stringify(ip.address()), ip
    //   },
    // },
  }
})
