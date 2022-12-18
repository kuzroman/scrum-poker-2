import { defineConfig, loadEnv  } from 'vite'
import vue from '@vitejs/plugin-vue'
import ip from "ip";
// const port = import.meta.env
// import { defineConfig, loadEnv } from 'vite';
// console.log(111, JSON.stringify(ip.address()), ip);

// console.log(1111, ip);



export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // console.log('env', env.VITE_IP, env.VITE_WEB_SOCKET_PORT);
  
  return {
    plugins: [vue()],
    define: {
      __APP_ENV__: env.APP_ENV,
    },
    resolve:{
      alias:{
        'IP' : JSON.stringify(ip.address()), ip
      },
    },
  }
})
