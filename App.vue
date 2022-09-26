<script>
// import utils from '@/common/utils.js';

export default {
	onLaunch: async function() {
		console.log('App Launch');
		// #ifdef APP-PLUS

		plus.navigator.setStatusBarBackground('#ffffff');
		if (!plus.networkinfo.isSetProxy()) {
			plus.nativeUI.alert('检测到您并未通过代理服务器访问本APP，若您在大陆地区，可能会导致网站资源无法访问。', {}, '网络提示', '好的');
		}

		plus.downloader.clear();
		// utils.clearCache();
		// console.log('File Cache size is ', await utils.getCacheSize());
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
  font-family: "iconfont"; /* Project id 3666326 */
  src: 
       url('data:application/x-font-woff2;charset=utf-8;base64,d09GMgABAAAAAAQQAAsAAAAACFwAAAPEAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHFQGYACDMgqDXINGATYCJAMUCwwABCAFhGcHVht2B8iemjwJqIVJkgAAgEOA4Plv7fW+gc1mJkxlUgisEpb/bwFRVRG6SiIXlD3VO+/cZw6IcwCU30NQCA3+/uJLc6jIncOhJBJ6bhLQzW4a3doGKFBd8kz4/nGvcpZNkWcfADLnxg8WmxQM6BijY1Kt4L2eF4z7jC0xqtkNqz+fggCOgfQTPmHS7AJI3rFWOSCfSNxmgSJTdmwVOohVlBhGphAiBNSVBjmKBZVQH4Ejyc9LB4MlBIXVuPvM2TRGwZtm2k7pxrgR9C+iJgQYrQALaKDvytSyj23cQUQW7EsEDvu7SMYAcIQoVDPNidYPbafiGCzu3sTOEzLGP57CgAS46WkAjIGQgWYCBBqaEwgEWj8gUNB2iv3qFFsAHMgpp4CvuMSusE57BxmSH5Nl0jKK1p7fb3rgo8VfPWrToi/U5IJP82j8PPfU2bu3C758kRZ/xW3Rws+ffX3jgk+WsIYtb1xYq+lz98pF8RGehbuPn7u05EuxTa98evSILSTIKuLxCc37Bk4WnfLDbp0DJ00X7viaA+u3TzuXfHq5dPn9Bz59yclT3kcvrsUNGaPlI8mHmzWCENHEL7yX0F4R+OXrKept3HI01309PSqed3Fu+ITBBxu31W5UbZ4nVvZYr/kMtJiW08q0uulzr+XafFINoB5TLTQaCFBN/DFEfxoQ2p/GO46uf6lJhWP+vYufQytedO9Z/65rfUF72UTF73JU0fZo8Lb0XtSOUCuKvrQ35+tRNybrQc6A193Doox8Wga9Vv1OvdGY44Ulz098eLzmXw/eL+0yEdlY2lEGDgBA3GjQDYnstfb4QqBdrcPkejOsFkBgZrecue0U7X/oL7Xl7+L6emD2NzbBxyaCzPyQRSuIqMai8yKD1Qd6BEvFkJIbBR9lzadqzeH7OOJccjoIIbkFKFIoBU1IZ4wh9AaLZzAEhIwERx/G1nty8YhATCrQnTMOhCyegSKDJ6DJ4i3GEL6BpYAfEJDFf3AskqTdPN1l/XjJdMUoxIfQIK7DfYlKBp1jYtfSZZtviUnfAA9sbWqpRyaYw+QQc/w90aYUh1y6NhyXzmOW5UJPuiFGVFNQKQ81N3PsU5qIa4MRJAwdBYMCwRwCMSC4OPAIXVV/3xwMwS4WOpKIWQpKfAwYHNJKEy0EzITQITVcyT4+ewjaUCg4EI7kwjaQcUXPsMygC8TDh4VgEBRNBHv4PRDNHhqnCpvmF9sPuAdwuHdaUaLFiJWAlB27dWo4IsbfYoQM3YmhIY8U/OQ/pj6oHDSxke9aFgA=') format('woff2'),
       url('//at.alicdn.com/t/c/font_3666326_vbecg9ib8zb.ttf?t=1664208299063') format('truetype');
}

.iconfont {
  font-family: "iconfont" !important;
  font-size: 16px;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.icon-loading:before {
  content: "\e689";
}

.icon-shijian:before {
  content: "\e8c5";
}

.icon-dianchi:before {
  content: "\e600";
}

.icon-lightning-full:before {
  content: "\e995";
}

</style>
