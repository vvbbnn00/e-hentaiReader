<script>
import utils from '@/common/utils.js';

export default {
	onLaunch: async function() {
		console.log('App Launch');
		// #ifdef APP-PLUS

		plus.navigator.setStatusBarBackground('#ffffff');
		if (!plus.networkinfo.isSetProxy()) {
			plus.nativeUI.alert('检测到您并未通过代理服务器访问本APP，若您在大陆地区，可能会导致网站资源无法访问。', {}, '网络提示', '好的');
		}
		utils.clearCache();
		console.log('File Cache size is ', await utils.getCacheSize());
		// #endif
	},
	onShow: function() {
		console.log('App Show');
	},
	onHide: function() {
		console.log('App Hide');
	}
};
</script>

<style lang="scss">
/*每个页面公共css */
@font-face {
	font-family: 'iconfont'; /* Project id 3666326 */
	src: url('data:application/x-font-woff2;charset=utf-8;base64,d09GMgABAAAAAAOEAAsAAAAAB5gAAAM2AAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHFQGYACDHAqCQII1ATYCJAMQCwoABCAFhGcHTBvBBsgekiRFVCG9owgUJVEQIB7o5/7z3OQ+2GQJ2AGNByZJDIrBrQRuHctO9Z9c0wyIU3A04G+HoIDVQ5JPHy/NUJGbIpJEQs9NToGbJUtut/Lw8/m/d/pb/gJc1wKAOaxNc9DvePjAvkfhB2zsLd7peJaY9xBvneAuAjLdNYsc2j04AlIXidwEhaIp3IBfGBZRIoJ4OiyKkCsLimV7RmG/AsmO5ANgn/3+8K+qUCZRSCnjDJvTpYD7P8DHkXR9xRLpTyZHALUTFJCi88hcYV5+YIYoN91ZlCztO9H6AsrKEv7w/v5jp+IfXIxdq/7lkQhSQpHCrgx6Y5mUP+g+ibXTg4rA30dyUpyV+mWUMAOwGZM0bpmIQp1S9Vi5av1Va6M+qmT96E9k19gvZMOYzytPHkuMyo1euvQsq7zzRShseJlX2XXHPElhCkiUIya8JgtjdvI+V06QhQ2nruWr+PTe0Szb+eRso4lHt/Iq47aP5Pmu5xeapwMXSVAJBJQg+dbUVnklQILfsTN2Tj+tSoADf1+Y3nu7btve8+heVO3scX+VCO6q054LMhuFakGoFMzXNeY9r2cD049rdrtrW65ftY6KHndJlyOv07p4sF7Dq0Pv7077r9bxu/GunmhfoxonsAFU3KeqpdWWfSaf6bJ0KZ37i4DAlWkPpkxNC/4fn0fw+6iRFBSqWIrK64+xXtBdEfukktQoRogxzaQbrrK9a6CRBJkMlyBPTa9tOGqVZhOU1fKRKGmEVFlLQZR0REGuJ4rK+iHTSVf/XC22KCFWQlurCEF1l0hU9Rip6h4EUfKCgrreUFTdHzJjQspoubZhZgdDIkcKlBYglS0Ta05u8x1CZEYXWVJiDLEwhRis9FdEcz3IRKyJNuFZUsU5hphZBuwm50O6bkGbWSEkc7/KuS2Ul+O0q/hlywAdGETEIQpIsgCiZBYTNuk8/HlDEGKGTsRKCsbSTBgF/lAlv4oSgh6bWaroSMYJm0VU4TgMwhjKGqBuuhqi01kgO71aCCLj/NQaSZugXKXhsjZ//w7j8JZARhkrhiSkIYaC0kqVhqhoxilGUFZp6t9TWeUmNYkPz+g6AAAA')
			format('woff2'),
		url('//at.alicdn.com/t/c/font_3666326_775bcrdwuoi.ttf?t=1664000909524') format('truetype');
}

.iconfont {
	font-family: 'iconfont' !important;
	font-size: 16px;
	font-style: normal;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
}

.icon-shijian:before {
	content: '\e8c5';
}

.icon-dianchi:before {
	content: '\e600';
}

.icon-lightning-full:before {
	content: '\e995';
}
</style>
