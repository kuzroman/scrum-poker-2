import { defineConfig, loadEnv  } from 'vite'
import vue from '@vitejs/plugin-vue'
import ip from "ip";
import mkcert from 'vite-plugin-mkcert'

export default defineConfig(({ command, mode }) => {
  // const env = loadEnv(mode, process.cwd(), '')
  return {
    server: { https: false },
    plugins: [
      vue(), mkcert()
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
