import App from './App'

// #ifdef APP-PLUS

import checkNotifyPermission from '@/js_sdk/Houzhenyu-NotifyTheAuthority/Houzhenyu-NotifyTheAuthority/Permissions.js';
checkNotifyPermission();

// #endif

// #ifndef VUE3
import Vue from 'vue'
Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
	...App
})
app.$mount()
// #endif

// #ifdef VUE3
import {
	createSSRApp
} from 'vue'
export function createApp() {
	const app = createSSRApp(App)
	return {
		app
	}
}
// #endif
